from fastapi import APIRouter
from app.schemas import InfoData, UpcomingModel

router = APIRouter()

@router.get("/info", response_model=InfoData, summary="Information page data")
async def get_info():
    return InfoData(
        repo_url="https://github.com/llmslayer/SIABench",
        repo_structure="SIABench/\n├── SIA_Dataset/      # Contains JSON files with SIA scenarios\n│   ├── SIA_Dataset.md             # Dataset structure and format documentation\n│   └── [scenario files...]        # JSON files with security scenarios\n├── Alert_Triaging_Dataset/         # Contains JSON files with Alert triaging scenarios\n│   ├── Alert_Triaging_Dataset.md  # Dataset structure and format documentation\n│   └── [scenario files...]        # JSON files with security scenarios\n├── ETHICS.md                       # Ethics statement and responsible use guidelines\n└── README.md",
        upcoming_models=[
            UpcomingModel(
                name="DeepSeek-R1",
                url="https://api-docs.deepseek.com/guides/reasoning_model"
            ),
            UpcomingModel(
                name="OpenAI o3-mini",
                url="https://openai.com/index/openai-o3-mini/"
            ),
            UpcomingModel(
                name="Claude 3.5 Sonnet",
                url="https://www.anthropic.com/claude"
            ),
        ]
    )