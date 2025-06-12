from fastapi import APIRouter
from app.schemas import LandingInfo

router = APIRouter()

@router.get("/", response_model=LandingInfo, summary="Landing page info")
def get_landing():
    return LandingInfo(
        title="SIA Bench",
        description=(
            "This benchmark is designed for Security Incident Analysis tasks, encompassing various cybersecurity investigation domains such as Memory Forensics, Malware Analysis, Network Forensics, and more. "
        ),
        images=[
            
        ],
        links=[
            "https://github.com/llmslayer/SIABench",
        ],
        announcement_title="Key Components:",
        part1_title="Part I: SIA Tasks",
        part2_title="Part II: Alert Triage",
        part1_description=(
            "- Simulates the in-depth investigation process of SIA tasks with 25 unique security scenarios containing 229 investigative questions in total."
            ),
        part2_description=(
            "Part II: Alert Triage - Includes true and false positives for evaluating classification tasks with 35 alert scenarios and 35 questions in total."
            ),
        evaluation_note=(
            "Evaluation Note: We evaluate different LLMs with our dataset using the [🤖 SIABench Agent]."
        ),
    )
