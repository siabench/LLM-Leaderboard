from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.crud import (fetch_task_options, fetch_level_options, fetch_leaderboard, fetch_latest, fetch_detailed_breakdown, fetch_legend, fetch_model_integrations)
from app.schemas import LeaderboardEntry, ModelResult, DetailedBreakdown, LegendEntry, ModelIntegration

router = APIRouter(prefix="/leaderboard")

@router.get("/task-options", response_model=list[str])
def getTaskOptions():
    return fetch_task_options()

@router.get("/level-options", response_model=list[str])
def getLevelOptions():
    return fetch_level_options()

@router.get(
    "/",
    response_model=List[LeaderboardEntry],
    summary="Get model leaderboard"
)
def get_leaderboard(
    tasks: Optional[List[str]] = Query(None),
    levels: Optional[List[str]] = Query(None)
):
    try:
        return fetch_leaderboard(tasks, levels)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/latest", response_model=list[ModelResult])
def get_latest(
    tasks: Optional[List[str]] = Query(None),
    levels: Optional[List[str]] = Query(None)
):
    try:
        return fetch_latest(tasks, levels)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/detailed", response_model=list[DetailedBreakdown])
def get_detailed():
    return fetch_detailed_breakdown()

@router.get("/legend", response_model=list[LegendEntry])
def get_legend():
    return fetch_legend()

@router.get("/integrations", response_model=list[ModelIntegration])
def get_integrations():
    return fetch_model_integrations()
