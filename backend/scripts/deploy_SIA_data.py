import pandas as pd
from sqlalchemy import create_engine
import os
from pathlib import Path
from dotenv import load_dotenv


load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT") or "5432"
DB_NAME = os.getenv("DB_NAME")
LOCAL_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

SUPA_DB_USER = os.getenv("SUPA_DB_USER")
SUPA_DB_PASS = os.getenv("SUPA_DB_PASS")
SUPA_DB_HOST = os.getenv("SUPA_DB_HOST")
SUPA_DB_PORT = os.getenv("SUPA_DB_PORT") or "5432"
SUPA_DB_NAME = os.getenv("SUPA_DB_NAME")
SUPABASE_URL = os.getenv("DATABASE_URL")
if SUPABASE_URL:
    supabase_url = SUPABASE_URL
else:
    supabase_url = f"postgresql://{SUPA_DB_USER}:{SUPA_DB_PASS}@{SUPA_DB_HOST}:{SUPA_DB_PORT}/{SUPA_DB_NAME}"


tables = ['models', 'model_metrics', 'question_metadata']

local_engine = create_engine(LOCAL_URL)
supabase_engine = create_engine(supabase_url)

for table in tables:
    print(f"Copying table: {table}")
    df = pd.read_sql_table(table, local_engine)
    df.to_sql(table, supabase_engine, if_exists='append', index=False)
print("Done.")
