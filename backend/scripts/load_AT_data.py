import pandas as pd
import numpy as np
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine

# 1) Load env & connect
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT") or "5432"
DB_NAME = os.getenv("DB_NAME")

LOCAL_PATH   = "../data/New_LLM_Evaluation - Alerts.csv"
CLEANED_PATH = "../data/AT_responses_only.csv"

DISPLAYED_MODELS = [
    "Llama3.1-8B", "Llama3.1-70B", "Llama3.1-405B",
    "GPT-4.0", "GPT-4.0mini", "Gemini1.5-pro",
    "DeepSeek-Reasoner", "OpenAI-o3-mini", "Claude-3.5"
]

engine = create_engine(
    f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# 2) Read CSV with double‐header
df_raw = pd.read_csv(LOCAL_PATH, header=[0,1], dtype=str, keep_default_na=False)

# 3) Map the four meta columns by their second‐level header
wanted = {
    "Question":        "at_question_number",
    "Scenario_category":   "at_scenario_category",
    "Scenario_name":      "at_scenario_name",
    "Question_Level":  "at_question_level",
    "Task_Category":   "at_task_category",
}

meta_cols = {
    wanted[L1]: (L0, L1)
    for (L0, L1) in df_raw.columns
    if L1 in wanted
}

# 4) Restrict to only your displayed models’ Response columns
model_cols = {
    model: (model, "Response")
    for model in DISPLAYED_MODELS
    if (model, "Response") in df_raw.columns
}

# 5) Build a long DataFrame
rows = []
for idx, row in df_raw.iterrows():
    meta = { key: row[col] for key, col in meta_cols.items() }
    if not meta["at_question_number"].strip():
        continue
    for model_name, col in model_cols.items():
        resp = row[col].strip()
        if resp:
            rows.append({ **meta,
                          "model_name": model_name,
                          "at_response": resp,
                          "_orig_idx": idx })
df_long = pd.DataFrame(rows)

# 6) Clean & dedupe
df_long = df_long.replace("", np.nan).dropna(subset=["at_response"]).drop_duplicates()

# 7) Pivot to wide & save cleaned CSV
wide = df_long.pivot_table(
    index=["_orig_idx"] + list(meta_cols.keys()),
    columns="model_name",
    values="at_response",
    aggfunc="first"
).reset_index()
wide.to_csv(CLEANED_PATH, index=False)

# 8) Insert unique metadata into AT_metadata
meta_df = wide[list(meta_cols.keys())].drop_duplicates().reset_index(drop=True)
meta_df.to_sql("at_metadata", engine, if_exists="append", index=False)

# 9) Reload AT_metadata to get AT_question_id
meta_db = pd.read_sql('SELECT * FROM "at_metadata"', engine)

# 10) Load all models, then filter in Python
models_db = pd.read_sql("SELECT * FROM models", engine)
models_db = models_db[models_db["model_name"].isin(DISPLAYED_MODELS)]

# 11) Melt wide back to long for metrics
long2 = wide.melt(
    id_vars=list(meta_cols.keys()),
    value_vars=list(model_cols.keys()),
    var_name="model_name",
    value_name="at_response"
).dropna(subset=["at_response"])

# 12) Map to foreign keys
long2 = long2.merge(meta_db,    on=list(meta_cols.keys()), how="left")
long2 = long2.merge(models_db, on="model_name",            how="left")

# 13) Insert into AT_models_metrics
metrics = long2[["at_question_id", "model_id", "at_response"]]
metrics.to_sql("at_model_metrics", engine, if_exists="append", index=False)

print(f"Loaded {meta_df.shape[0]} at_metadata rows and {metrics.shape[0]} at_model_metrics rows.")
