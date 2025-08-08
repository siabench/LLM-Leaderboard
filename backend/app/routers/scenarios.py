from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas import ScenarioSummary, ScenarioQuestion
from app.crud import fetch_scenarios, fetch_scenario_questions

router = APIRouter(prefix="/scenarios", tags=["scenarios"])

@router.get("/", response_model=List[ScenarioSummary], summary="List scenarios")
def list_scenarios():
    return fetch_scenarios()

@router.get("/{scenario_name}/questions",
            response_model=List[ScenarioQuestion],
            summary="Questions for a scenario")
def list_scenario_questions(scenario_name: str):
    try:
        return fetch_scenario_questions(scenario_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
