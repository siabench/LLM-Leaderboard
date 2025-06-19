from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.routing import Mount
from app.routers.landing import router as landing_router
from app.routers.leaderboard import router as leaderboard_router
from app.routers.alert_triaging import router as alert_triaging_router
from app.routers.footer import router as footer_router
from app.routers.info import router as info_router

app = FastAPI(
    title="SIA Leaderboard API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
    "http://localhost:3000",
    "https://siabench.github.io",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.router.redirect_slashes = False

app.include_router(landing_router)      
app.include_router(leaderboard_router)   
app.include_router(alert_triaging_router)
app.include_router(footer_router)
app.include_router(info_router)

app.router.redirect_slashes = False


