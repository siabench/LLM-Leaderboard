from fastapi import APIRouter
from app.schemas import FooterInfo, FooterSection, FooterLink

router = APIRouter()

@router.get("/footer", response_model=FooterInfo, summary="Footer information")
def get_footer():
    return FooterInfo(
        contact=FooterSection(
            title="Contact",
            icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
            content="Contact iformation will be added soon.",
        ),
        acknowledgments=[
            FooterLink(
                text="The LangChain community.",
                url="https://www.langchain.com/"
            ),
            FooterLink(
                text="Security researchers who continue to push boundaries in automated incident analysis.",
                url=""
            ),
            FooterLink(
                text="Our partners and contributors from the security community.",
                url=""
            )
        ],
        ethics="https://github.com/llmslayer/SIABench/blob/main/Ethics.md",
        links=[
            FooterLink(text="Privacy Policy", url="#"),
            FooterLink(text="Terms of Service", url="#"),
            FooterLink(text="Accessibility", url="#"),
            FooterLink(text="FAQ", url="#")
        ],
        copyright="SIA Bench Project. All rights reserved."
    )