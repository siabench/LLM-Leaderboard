from fastapi import APIRouter
from app.schemas import LandingInfo

router = APIRouter()

@router.get("/", response_model=LandingInfo, summary="Landing page info")
def get_landing():
    return LandingInfo(
        title="SIA Bench",
        description=(
            "Welcome to the SIA_Dataset repository!  "
            "This dataset is designed for Security Incident Analysis (SIA) tasks, encompassing various cybersecurity investigation domains such as Network Forensics, Disk & Memory Forensics, Malware Analysis, and more."
        ),
        images=[
            
        ],
        links=[
            "https://github.com/llmslayer/SIABench",
            "https://your-paper-link.example.com",
        ],
         announcement=(
            "🔔 **What's New?**\n"
            "New Model Evaluation Added: Claude-3.5!\n"
            "Upcoming Reasoning Models: DeepSeek-R1 & OpenAI o3-mini\n\n"
            "Stay updated as we continue expanding and refining our dataset and evaluation! ✨"
        ),
    )
