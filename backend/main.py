from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import os

# 1. Setup the App
app = FastAPI()

# 2. Configure CORS (The "Gatekeeper")
# This allows your React app (localhost:5173) to talk to this Python server.
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Enable FastF1 Cache
# This makes loading data 10x faster after the first time.
cache_dir = os.path.join(os.getcwd(), 'cache')
if not os.path.exists(cache_dir):
    os.makedirs(cache_dir)

fastf1.Cache.enable_cache(cache_dir)

# 4. Our Endpoints
@app.get("/")
def read_root():
    return {"message": "Backend is online and CORS is fixed!"}

@app.get("/api/schedule/{year}")
def get_schedule(year: int):
    """
    Get the race schedule for a specific year.
    Example: /api/schedule/2023
    """
    try:
        schedule = fastf1.get_event_schedule(year)
        # We need to clean the data to make it JSON serializable
        # (Convert timestamps to strings, etc.)
        json_data = schedule[['RoundNumber', 'Country', 'Location', 'EventName', 'EventDate']].to_dict(orient='records')
        return {"year": year, "races": json_data}
    except Exception as e:
        return {"error": str(e)}