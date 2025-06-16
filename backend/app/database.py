from pathlib import Path
from dotenv import load_dotenv
import os
import psycopg2
from urllib.parse import urlparse

env_path = Path(__file__).resolve().parent.parent / ".env"
print(f"⏳ Loading .env from {env_path}")
load_dotenv(dotenv_path=env_path)

print("🔑 DATABASE_URL =", os.environ.get("DATABASE_URL"))


DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

result = urlparse(DATABASE_URL)
username = result.username
password = result.password
database = result.path.lstrip("/")   # everything after the "/"
hostname = result.hostname
port     = result.port

