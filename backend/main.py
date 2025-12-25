from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import os
import pandas as pd  # <--- THIS WAS MISSING!

# 1. Setup the App
app = FastAPI()

# 2. Configure CORS
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
cache_dir = os.path.join(os.getcwd(), 'cache')
if not os.path.exists(cache_dir):
    os.makedirs(cache_dir)

fastf1.Cache.enable_cache(cache_dir)

# 4. Root Endpoint
@app.get("/")
def read_root():
    return {"message": "Backend is online", "status": "OK"}

# 5. Schedule Endpoint
@app.get("/api/schedule/{year}")
def get_schedule(year: int):
    try:
        schedule = fastf1.get_event_schedule(year)
        json_data = schedule[['RoundNumber', 'Country', 'Location', 'EventName', 'EventDate']].to_dict(orient='records')
        return {"year": year, "races": json_data}
    except Exception as e:
        return {"error": str(e)}

# 6. Qualifying Results Endpoint (The Fixed Version)
@app.get("/api/qualifying/{year}/{round_number}")
def get_qualifying_results(year: int, round_number: int):
    try:
        session = fastf1.get_session(year, round_number, 'Q')
        session.load()
        
        # 1. Get all laps
        laps = session.laps
        
        # 2. Filter: Keep only laps with valid times
        # INSTEAD OF pick_timed(), WE DO IT MANUALLY:
        # We drop any rows where 'LapTime' is Not-a-Time (NaT)
        drivers_with_times = laps.dropna(subset=['LapTime'])
        
        # 3. Sort ALL laps by time (Fastest first)
        sorted_laps = drivers_with_times.sort_values(by='LapTime')
        
        # 4. Keep only the first instance of each driver
        fastest_unique = sorted_laps.drop_duplicates(subset=['Driver'], keep='first').reset_index(drop=True)

        # 5. Build the list for the Frontend
        results = []
        for index, row in fastest_unique.iterrows():
            lap_time_val = row['LapTime']
            
            # Safe conversion to string
            if pd.isnull(lap_time_val):
                lap_time_str = "No Time"
            else:
                lap_time_str = str(lap_time_val).split('days ')[-1]

            results.append({
                "Position": index + 1,
                "Driver": row['Driver'],
                "Team": row['Team'],
                "LapTime": lap_time_str,
            })
            
        return {"round": round_number, "results": results}
        
    except Exception as e:
        print(f"ERROR: {e}") 
        return {"error": str(e)}