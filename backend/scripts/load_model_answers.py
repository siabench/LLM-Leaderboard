import os
import json
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT") or "5432"
DB_NAME = os.getenv("DB_NAME")

print("Connecting to:", DB_HOST, DB_NAME, DB_USER)
conn = psycopg2.connect(
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASS,
    host=DB_HOST,
    port=DB_PORT,
)
cur = conn.cursor()

from psycopg2 import sql

cur.execute("SELECT model_name, model_id FROM models")
model_id_map = {name: mid for name, mid in cur.fetchall()}

base = Path(__file__).parent.parent /"data" / "models"
for model_dir in base.iterdir():
    if not model_dir.is_dir():
        continue
    model_name = model_dir.name
    model_id = model_id_map.get(model_name)
    if model_id is None:
        print(f"⚠️  Unknown model folder: {model_name}")
        continue

    for json_file in model_dir.glob("*.json"):
        scenario = json_file.stem  
        with open(json_file) as f:
            answers = json.load(f)

        cur.execute(
            "SELECT question_id, split_part(question_number, '.', 2) AS qnum FROM question_metadata WHERE scenario_name = %s",
            (scenario,),
        )
        rows = cur.fetchall() 

        for entry in answers:
            qnum = entry["question_number"]
            match = next((qid for qid, num in rows if num == qnum), None)
            if match is None:
                print(f"  ❌ No metadata for {scenario} q#{qnum}")
                continue

            response = "pass" if entry["result"] == "1" else "fail"
            model_answer = entry["answer_found_by_llm"]

            cur.execute(
                """
                INSERT INTO model_metrics (model_id, question_id, response, model_answer)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (model_id, question_id) DO UPDATE
                  SET response = EXCLUDED.response,
                      model_answer = EXCLUDED.model_answer;
                """,
                (model_id, match, response, model_answer),
            )

    conn.commit()
    print(f"✅ Loaded answers for model {model_name}")

cur.close()
conn.close()
