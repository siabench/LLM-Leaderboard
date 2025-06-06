from pydantic import BaseModel
from typing import List, Optional

class LandingInfo(BaseModel):
    title: str
    description: str
    images: List[str]
    links: List[str]

class LeaderboardItem(BaseModel):
    model_name: str
    total_passes: int
    overall_percentage: float
    avg_scenario_solving_percentage: float
    num_fully_solved_scenarios: int