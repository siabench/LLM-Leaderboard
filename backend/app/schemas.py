from typing import List, Optional, Dict
from pydantic import BaseModel

class LandingInfo(BaseModel):
    title:       str
    description: str
    images:      List[str]
    links:       List[str]
    announcement_title: str
    part1_title: str
    part2_title: str
    part1_description: str
    part2_description: str
    evaluation_note: str

class LeaderboardEntry(BaseModel):
    model_name: str
    overall_fully_solved: int
    overall_solving_percentage: float
    filtered_fully_solved: int
    filtered_solving_percentage: float
    total_filtered_scenarios: int
    
class ModelResult(BaseModel):
    model_name: str
    overall_fully_solved: int
    overall_solving_percentage: float
    filtered_fully_solved: int
    filtered_solving_percentage: float

class DetailedBreakdown(BaseModel):
    model_name: str
    
    breakdown: Dict[str, Dict[str, float]]

class LegendEntry(BaseModel):
    code: str
    meaning: str

class ModelIntegration(BaseModel):
    model_name: str
    provider: str
    api: str
    
class UpcomingModel(BaseModel):
    name: str
    url: str

class InfoData(BaseModel):
    repo_url: str
    repo_structure: str
    upcoming_models: List[UpcomingModel]

class FooterLink(BaseModel):
    text: str
    url: Optional[str] = None

class FooterSection(BaseModel):
    title: str
    icon: str 
    content: str

class FooterInfo(BaseModel):
    contact: FooterSection
    acknowledgments: List[FooterLink]
    ethics: str
    links: List[FooterLink]
    copyright: str