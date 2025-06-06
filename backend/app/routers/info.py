from fastapi import APIRouter
from app.schemas import InfoData, UpcomingModel

router = APIRouter()

@router.get("/info", response_model=InfoData, summary="Information page data")
async def get_info():
    return InfoData(
        repo_url="https://github.com/llmslayer/SIABench",
        repo_structure="/SIA_Dataset\n  ├── Tasks_Dataset/      # Contains the JSON files with scenarios\n  └── Agent/              # Contains the code and guidelines to run the SIA agent\nREADME.md",
        upcoming_models=[
            UpcomingModel(
                name="DeepSeek-R1",
                url="https://api-docs.deepseek.com/guides/reasoning_model"
            ),
            UpcomingModel(
                name="OpenAI o3-mini",
                url="https://openai.com/index/openai-o3-mini/"
            ),
            # You can add more models here
            UpcomingModel(
                name="Claude 3.5 Sonnet",
                url="https://www.anthropic.com/claude"
            ),
        ]
    )