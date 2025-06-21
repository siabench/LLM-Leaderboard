from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from app.crud import fetch_alert_leaderboard  
from app.schemas import LeaderboardEntry

router = APIRouter(prefix="/alert-triaging")

@router.get(
    "/leaderboard",
    response_model=List[LeaderboardEntry],
    summary="Alert Triaging Dataset Leaderboard",
)
def get_alert_leaderboard(
    tasks: Optional[List[str]] = Query(None),
    levels: Optional[List[str]] = Query(None),
):
    try:
        return fetch_alert_leaderboard(tasks, levels)
    except Exception as e:
        traceback.print_exc()  
        raise HTTPException(status_code=500, detail=str(e))