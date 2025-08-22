# load_data.py
import os
import re
from pathlib import Path

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.dialects.postgresql import insert

# ── Config ────────────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT") or "5432"
DB_NAME = os.getenv("DB_NAME")

LOCAL_PATH   = "../data/Test.csv"  
CLEANED_PATH = "../data/responses_only.csv"

DISPLAYED_MODELS = [
    "Llama3.1-8B", "Llama3.1-70B", "Llama3.1-405B",
    "GPT-4.0", "GPT-4.0mini", "Gemini1.5-pro",
    "DeepSeek-Reasoner", "OpenAI-o3-mini", "Claude-3.5",
]
META_KEEP = ["question", "scenario_name", "question_level", "task_category"]

engine = create_engine(
    f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
    future=True,
)

def arbiter_indexes():
    """Create indexes we know we need; safe to run every time."""
    stmts = [
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_models_model_name ON models (model_name)",
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_model_metrics ON model_metrics (question_id, model_id)",
    ]
    with engine.begin() as conn:
        for s in stmts:
            conn.exec_driver_sql(s)

_qnum_re = re.compile(r"^\s*([sS]\d+(?:\.\d+)*)")

def extract_question_number(q: str) -> str:
    """
    Extract a compact question number like 's1.1' from:
      's1.1 (hawkeye)' → 's1.1'
      's10.3'         → 's10.3'
    Fallback to the original string if no match.
    """
    if not isinstance(q, str):
        return ""
    m = _qnum_re.match(q)
    if m:
        return m.group(1).lower()
    m2 = re.match(r"^\s*(\d+(?:\.\d+)*)", q)
    if m2:
        return f"s{m2.group(1)}"
    return q.strip() 
def reflect_table(conn, name: str) -> Table:
    md = MetaData()
    return Table(name, md, autoload_with=conn)

def df_keep_table_columns(df: pd.DataFrame, table: Table) -> pd.DataFrame:
    table_cols = set(table.columns.keys())
    keep = [c for c in df.columns if c in table_cols]
    return df[keep].copy()

def read_and_clean() -> pd.DataFrame:
    df_raw = pd.read_csv(LOCAL_PATH, header=[0, 1], dtype=str, keep_default_na=False)

    meta_cols = [c for c in df_raw.columns if c[1].strip().lower() in META_KEEP]

    model_cols = {}
    for model in DISPLAYED_MODELS:
        cols = [c for c in df_raw.columns if c[0] == model and c[1].strip().lower() == "response"]
        if cols:
            model_cols[model] = cols

    rows = []
    for _, row in df_raw.iterrows():
        meta = {c[1].strip(): row[c] for c in meta_cols}
        if all(str(v).strip() == "" for v in meta.values()):
            continue
        for model, cols in model_cols.items():
            resp = row[cols[0]]
            if str(resp).strip() == "":
                continue
            rows.append({**meta, "model_name": model, "response": resp})

    if not rows:
        raise RuntimeError("No data rows found—check the input file and headers.")

    df_long = pd.DataFrame(rows)
    df_long.columns = [str(c).strip().lower() for c in df_long.columns]
    df_long = df_long.replace("", np.nan).dropna(subset=["question", "response"]).drop_duplicates()

    df_long["question_number"] = df_long["question"].apply(extract_question_number)

    wide = df_long.pivot_table(
        index=["question", "question_number", "scenario_name", "question_level", "task_category"],
        columns="model_name",
        values="response",
        aggfunc="first",
    ).reset_index()

    wide.columns.name = None
    wide.columns = [c if isinstance(c, str) else c[1] for c in wide.columns]

    meta_order = ["question", "question_number", "scenario_name", "question_level", "task_category"]
    ordered = meta_order + [m for m in DISPLAYED_MODELS if m in wide.columns]
    wide = wide[[c for c in ordered if c in wide.columns]]

    Path(CLEANED_PATH).parent.mkdir(parents=True, exist_ok=True)
    wide.to_csv(CLEANED_PATH, index=False)
    print(f"✅ Wrote {wide.shape[0]} cleaned rows to {CLEANED_PATH}")
    return wide

def upsert_models(conn, models: list[str]):
    tbl = reflect_table(conn, "models")
    values = [{"model_name": m} for m in models]
    if not values:
        return
    stmt = insert(tbl).values(values).on_conflict_do_nothing(index_elements=["model_name"])
    conn.execute(stmt)

def upsert_questions(conn, questions_df: pd.DataFrame):
    """
    Insert into question_metadata, including question_number (NOT NULL).
    We do DO NOTHING on any conflict, *without* naming a specific index
    so it works with your existing unique constraint (whatever it is).
    """
    if questions_df.empty:
        return
    tbl = reflect_table(conn, "question_metadata")

    if "question_number" not in questions_df.columns:
        questions_df = questions_df.copy()
        questions_df["question_number"] = questions_df["question"].apply(extract_question_number)

    payload = df_keep_table_columns(questions_df, tbl).to_dict(orient="records")
    if not payload:
        return

    stmt = insert(tbl).values(payload).on_conflict_do_nothing()
    conn.execute(stmt)

def upsert_metrics(conn, metrics_df: pd.DataFrame):
    """UPSERT model_metrics on (question_id, model_id), update response on conflict."""
    if metrics_df.empty:
        return
    tbl = reflect_table(conn, "model_metrics")
    payload = df_keep_table_columns(metrics_df, tbl).to_dict(orient="records")
    if not payload:
        return
    stmt = insert(tbl).values(payload).on_conflict_do_update(
        index_elements=["question_id", "model_id"],
        set_={"response": stmt.excluded.response},
    )
    conn.execute(stmt)

def main():
    arbiter_indexes()

    wide = read_and_clean()

    with engine.begin() as conn:
        upsert_models(conn, DISPLAYED_MODELS)

    questions_df = wide[["question", "question_number", "scenario_name", "question_level", "task_category"]].drop_duplicates()
    with engine.begin() as conn:
        upsert_questions(conn, questions_df)

    df_long = wide.melt(
        id_vars=["question", "question_number", "scenario_name", "question_level", "task_category"],
        value_vars=[m for m in DISPLAYED_MODELS if m in wide.columns],
        var_name="model_name",
        value_name="response",
    ).dropna(subset=["response"])

    questions_db = pd.read_sql(
        "SELECT question_id, question, question_number, scenario_name, question_level, task_category FROM question_metadata",
        engine,
    )
    models_db = pd.read_sql("SELECT model_id, model_name FROM models", engine)

    df_join = (
        df_long.merge(
            questions_db,
            on=["question", "question_number", "scenario_name", "question_level", "task_category"],
            how="left",
        )
        .merge(models_db, on="model_name", how="left")
    )

    missing_q = df_join["question_id"].isna().sum()
    missing_m = df_join["model_id"].isna().sum()
    if missing_q or missing_m:
        print(f"Missing question_id rows: {missing_q}, missing model_id rows: {missing_m}")

    metrics_df = df_join.loc[
        df_join["question_id"].notna() & df_join["model_id"].notna(),
        ["question_id", "model_id", "response"],
    ].drop_duplicates()

    with engine.begin() as conn:
        upsert_metrics(conn, metrics_df)

    print("Upsert complete.")
    print(f"   models attempted: {len(DISPLAYED_MODELS)}")
    print(f"   questions upserted: {questions_df.shape[0]}")
    print(f"   model_metrics upserted: {metrics_df.shape[0]}")

if __name__ == "__main__":
    main()
