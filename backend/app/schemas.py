from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, HttpUrl

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
    total_scenarios: int
    
class ModelResult(BaseModel):
    model_name: str
    overall_fully_solved: int
    overall_solving_percentage: float
    filtered_fully_solved: int
    filtered_solving_percentage: float
    total_filtered_scenarios: int
    total_scenarios: int
    
    
class AlertTriagingEntry(BaseModel):
    model_name:    str
    tp:            str  
    fp:            str   
    accuracy:      str   
    accuracy_sort: float 

    class Config:
        extra = "ignore"
        
class ModelDetail(BaseModel):
    scenario_name: str
    question_text: str
    correct_answer: str
    model_answer: str
    response: Literal["pass", "fail"]
    adversarial_tactic: str


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
    api_url:   HttpUrl 
    
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
    ethics: HttpUrl
    links: List[FooterLink]
    copyright: str