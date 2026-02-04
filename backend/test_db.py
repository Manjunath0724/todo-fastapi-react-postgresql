import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()
print("DATABASE_URL:", os.getenv("DATABASE_URL"))

try:
    conn = psycopg2.connect(os.getenv("DATABASE_URL"), sslmode="prefer")
    print("SUCCESS: Database connected!")
    conn.close()
    print("Your FastAPI app will now work perfectly!")
except Exception as e:
    print("Error:", str(e))
