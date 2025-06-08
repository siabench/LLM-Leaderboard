import os
import psycopg2
from dotenv import load_dotenv
from pathlib import Path
from urllib.parse import urlparse


DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

result = urlparse(DATABASE_URL)
username = result.username
password = result.password
database = result.path.lstrip("/")   # everything after the "/"
hostname = result.hostname
port     = result.port

conn = psycopg2.connect(
    host=hostname,
    port=port,
    database=database,
    user=username,
    password=password,
    sslmode="require"   # Render’s Postgres requires SSL
)