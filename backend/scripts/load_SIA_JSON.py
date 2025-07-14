import os
import json
import psycopg2
from pathlib import Path
from dotenv import load_dotenv
import re


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

data_dir = Path(__file__).parent.parent / "data" / "SIA_Dataset"

for json_path in data_dir.glob("*.json"):
    print(f"→ loading {json_path.name}")
    with open(json_path) as f:
        data = json.load(f)

    meta = next(s["metadata"]     for s in data["scenarios"] if "metadata" in s)
    scenario_name = meta["scenario_name"]
    sia           = next(s["sia_components"] for s in data["scenarios"] if "sia_components" in s)
    questions     = sia["questions"]

    cur.execute(
        """
        INSERT INTO scenario_metadata
          (scenario_name, tools_available, files_available, instructions)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (scenario_name) DO NOTHING
        """,
        (scenario_name,
         sia["tools_available"],
         sia["files_available"],
         sia["instructions"]),
    )

    cur.execute(
        """
        SELECT question_id
        FROM question_metadata
        WHERE scenario_name = %s
        ORDER BY (split_part(question_number, '.', 2))::int
        """,
        (scenario_name,),
    )
    existing_ids = [row[0] for row in cur.fetchall()]

    if len(existing_ids) != len(questions):
        print(f"⚠️  mismatch for {scenario_name!r}: "
              f"{len(existing_ids)} DB rows vs {len(questions)} JSON questions")

    for q_idx, q in enumerate(questions):
        if q_idx >= len(existing_ids):
            break  

        qid = existing_ids[q_idx]
        m = re.match(r'^(\d+)\.\s*(.*)$', q["question"])
        question_text = m.group(2) if m else q["question"]

        cur.execute(
            """
            UPDATE question_metadata
               SET question           = %s
                 , answer             = %s
                 , adversarial_tactic = %s
             WHERE question_id = %s
            """,
            (
                question_text,
                q["answer"],
                q["adversarial_tactic"],
                qid,
            ),
        )
        print(f"✅ updated qid={qid} for scenario={scenario_name!r}")
conn.commit()
cur.close()
conn.close()
print("Done loading all scenarios.")