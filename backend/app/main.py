from fastapi import FastAPI, Response
# from mangum import Mangum
import os, psycopg2
from fastapi.middleware.cors import CORSMiddleware
from starlette.routing import Mount
from app.routers.landing import router as landing_router
from app.routers.leaderboard import router as leaderboard_router
from app.routers.alert_triaging import router as alert_triaging_router
from app.routers.footer import router as footer_router
from app.routers.info import router as info_router
from app.routers.scenarios import router as scenarios_router

app = FastAPI(
    title="SIA Leaderboard API",
    debug=True, 
)
@app.get("/__diag")
def diag():
    try:
        with psycopg2.connect(os.environ["DATABASE_URL"], sslmode="require") as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT current_database(), current_user, inet_server_addr()::text, inet_server_port()")
                dbname, dbuser, host, port = cur.fetchone()
                cur.execute("SELECT COUNT(*) FROM question_metadata")
                q_count = cur.fetchone()[0]
                cur.execute("SELECT COUNT(*) FROM model_metrics")
                m_count = cur.fetchone()[0]
        return {
            "db": dbname,
            "user": dbuser,
            "host": host,
            "port": port,
            "question_metadata_count": q_count,
            "model_metrics_count": m_count,
        }
    except Exception as e:
        return Response(str(e), status_code=500)
    
    
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
@app.middleware("http")
async def no_store_headers(request: Request, call_next):
    response: Response = await call_next(request)
    if response.headers.get("content-type", "").startswith("application/json"):
        response.headers["Cache-Control"] = "no-store"
    return response

app.router.redirect_slashes = False

app.include_router(landing_router)      
app.include_router(leaderboard_router)   
app.include_router(alert_triaging_router)
app.include_router(footer_router)
app.include_router(scenarios_router)
app.include_router(info_router)

for r in app.routes:
    try:
        print(r.path, list(getattr(r, "methods", [])))
    except Exception:
        pass

app.router.redirect_slashes = False
# handler = Mangum(app) 

