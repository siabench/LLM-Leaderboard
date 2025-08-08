from typing import List
from fastapi import APIRouter, HTTPException, Path
from app.schemas import ScenarioSummary, ScenarioQuestion
from app.crud import get_conn  

router = APIRouter(prefix="/scenarios", tags=["scenarios"])

SCENARIOS_SQL = """
SELECT
  scenario_name,
  ARRAY_AGG(DISTINCT task_category) AS task_categories,
  ARRAY_AGG(DISTINCT question_level) AS levels,
  COUNT(*) AS question_count
FROM question_metadata
GROUP BY scenario_name
ORDER BY scenario_name;
"""

QUESTIONS_SQL = """
SELECT
  question_id, question, task_category, question_level
FROM question_metadata
WHERE scenario_name = %s
ORDER BY question_id;
"""

@router.get("/", response_model=List[ScenarioSummary], summary="List scenarios with meta")
def list_scenarios():
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(SCENARIOS_SQL)
        rows = cur.fetchall()
    return [
        {
            "scenario_name": r[0],
            "task_categories": list(r[1]) if r[1] else [],
            "levels": list(r[2]) if r[2] else [],
            "question_count": int(r[3]),
        }
        for r in rows
    ]

@router.get("/{scenario_name}/questions", response_model=List[ScenarioQuestion], summary="Questions in a scenario")
def list_questions(scenario_name: str = Path(...)):
    with get_conn() as conn, conn.cursor() as cur:
        cur.execute(QUESTIONS_SQL, (scenario_name,))
        rows = cur.fetchall()
    if rows is None:
        raise HTTPException(404, "Scenario not found")
    return [
        {
            "question_id": r[0],
            "question": r[1],
            "task_category": r[2],
            "question_level": r[3],
        }
        for r in rows
    ]
