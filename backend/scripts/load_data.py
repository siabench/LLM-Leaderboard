import pandas as pd
import numpy as np
import psycopg2
import os
from pathlib import Path
from dotenv import load_dotenv
import requests
from sqlalchemy import create_engine
import time

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")


DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT") or "5432"
DB_NAME = os.getenv("DB_NAME")
LOCAL_PATH = "../data/Evaluation-Result(in).csv"  
CLEANED_PATH = "../data/responses_only.csv"

DISPLAYED_MODELS = [
    "Llama3.1-8B", "Llama3.1-70B", "Llama3.1-405B",
    "GPT-4.0", "GPT-4.0mini", "Gemini1.5-pro",
    "DeepSeek-Reasoner", "OpenAI-o3-mini", "Claude-3.5"
]


COLUMNS_TO_DROP = ["Tactic_Category", "no_of_times", "POF", "Steps"]

engine = create_engine(f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

# while True:
#     try:
        # 1. Download the file
        # r = requests.get(EXCEL_URL)
        # with open(LOCAL_PATH, "wb") as f:
        #     f.write(r.content)

        # 1. Read multi-index header
df_raw = pd.read_csv(LOCAL_PATH, header=[0,1], dtype=str, keep_default_na=False)
print("Building rows from df_raw with columns:", df_raw.columns.tolist())
# Meta columns: select by 2nd-level header only
meta_keep = ["question", "scenario_name", "question_level", "task_category"]
meta_cols = [col for col in df_raw.columns if col[1].strip().lower() in meta_keep]
print("Meta columns:", meta_cols)




# 3. Get model columns
model_cols = {}
for model in DISPLAYED_MODELS:
    cols = [col for col in df_raw.columns if col[0] == model and col[1].strip().lower() == "response"]
    if cols:
        model_cols[model] = cols


# 4. Build a long dataframe: one row per (meta info + model + response columns)
rows = []
print("Building rows from df_raw with columns:", df_raw.columns.tolist())
print("Meta columns:", meta_cols)
print("Model columns:", model_cols)
for idx, row in df_raw.iterrows():
    meta = {col[1].strip(): row[col] for col in meta_cols}
    print("Meta for row", idx, ":", meta)
    if all((str(v).strip() == "" for v in meta.values())):
        continue
    for model, cols in model_cols.items():
        resp_val = row[cols[0]]
        if str(resp_val).strip() == "":
            print(f"Model: {model}, Response: '{resp_val}'")
            continue
        d = {**meta, "model_name": model, "response": resp_val,"_orig_idx": idx}
        rows.append(d)
df_long = pd.DataFrame(rows)
df_long.columns = [
    '_'.join(map(str, col)).strip().lower() if isinstance(col, tuple) else str(col).strip().lower()
    for col in df_long.columns
]


# Drop duplicates and rows with empty question or response
print("df_long columns:", df_long.columns.tolist())
df_long = df_long.replace('', np.nan).dropna(subset=["question", "response"])
df_long = df_long.drop_duplicates()

# Pivot to wide format: index = meta cols, columns = model_name, values = response
wide = df_long.pivot_table(
    index=["_orig_idx","question", "scenario_name", "question_level", "task_category"],
    columns="model_name",
    values="response",
    aggfunc="first"  # in case there are duplicates
).reset_index()

wide = wide.sort_values("_orig_idx").reset_index(drop=True)
wide = wide.drop(columns=["_orig_idx"])

# Flatten MultiIndex columns if needed
wide.columns.name = None
wide.columns = [col if isinstance(col, str) else col[1] for col in wide.columns]

# Reorder columns: meta first, then models
ordered = meta_keep + [model for model in DISPLAYED_MODELS if model in wide.columns]
wide = wide[[col for col in ordered if col in wide.columns]]


    # 8. Save cleaned data to CSV
wide.to_csv(CLEANED_PATH, index=False)
print(f"Wrote {wide.shape[0]} cleaned rows to {CLEANED_PATH}")

# INSERT 1: Save models to `models` table
models_df = pd.DataFrame({'model_name': DISPLAYED_MODELS})
models_df.drop_duplicates().to_sql('models', engine, if_exists='append', index=False)
print(f"Loaded models: {models_df.shape[0]} rows into models table.")

# INSERT 2: Save questions to `question_metadata` table
questions_df = wide[['question', 'scenario_name', 'question_level', 'task_category']].drop_duplicates()
questions_df.to_sql('question_metadata', engine, if_exists='append', index=False)
print(f"Loaded questions: {questions_df.shape[0]} rows into question_metadata table.")


# A. Melt to long format (already done!)
df_long = wide.melt(
    id_vars=['question', 'scenario_name', 'question_level', 'task_category'],
    value_vars=[model for model in DISPLAYED_MODELS if model in wide.columns],
    var_name='model_name',
    value_name='response'
).dropna(subset=['response'])
# B. Map to IDs
questions_db = pd.read_sql("SELECT * FROM question_metadata", engine)
models_db = pd.read_sql("SELECT * FROM models", engine)
df_long = df_long.merge(questions_db, on=['question', 'scenario_name', 'question_level', 'task_category'], how='left')
df_long = df_long.merge(models_db, on='model_name', how='left')
print(f"Loaded {wide.shape[0]} cleaned rows into model_responses")
# C. Prepare for model_metrics table
model_metrics_df = df_long[['question_id', 'model_id', 'response']]
# D. Insert into DB
model_metrics_df.to_sql('model_metrics', engine, if_exists='append', index=False)
print(f"Loaded {model_metrics_df.shape[0]} rows into model_metrics")
# print(f"Loaded {df.shape[0]} cleaned rows into model_metrics")

# except Exception as e:
#     print(f"Error: {e}")

# time.sleep(1)