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

@app.get("/api/session/{year}/{round_number}/{session_type}")
def get_session_results(year: int, round_number: int, session_type: str):
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load()
        results = []

        # 1. Global Lap Counter (Works for ALL session types)
        # This counts how many times each driver appears in the lap data
        total_laps_per_driver = session.laps['Driver'].value_counts()

        # === CASE A: QUALIFYING (Q) ===
        if session_type == 'Q':
            results_df = session.results
            results_df['Position'] = results_df['Position'].fillna(0)

            for index, row in results_df.iterrows():
                # Helper to format time
                def format_time(val):
                    if pd.isnull(val) or val == pd.NaT:
                        return ""
                    return str(val).split('days ')[-1][:-3]

                # Get the manual lap count we calculated above
                driver_lap_count = int(total_laps_per_driver.get(row['Abbreviation'], 0))

                results.append({
                    "Position": int(row['Position']),
                    "DriverNumber": str(row['DriverNumber']),
                    "Driver": row['Abbreviation'],
                    "Team": row['TeamName'],
                    "Q1": format_time(row['Q1']),
                    "Q2": format_time(row['Q2']),
                    "Q3": format_time(row['Q3']),
                    "Laps": driver_lap_count # <--- Uses manual count now
                })

        # === CASE B: RACE (R) & SPRINT (S) ===
        elif session_type in ['R', 'S']:
            results_df = session.results
            results_df['Position'] = results_df['Position'].fillna(0)
            results_df['Points'] = results_df['Points'].fillna(0)
            
            for index, row in results_df.iterrows():
                if str(row['Status']) == 'Finished':
                    val = row['Time']
                    time_str = str(val).split('days ')[-1][:-3] if pd.notna(val) else "Finished"
                else:
                    time_str = str(row['Status'])

                results.append({
                    "Position": int(row['Position']),
                    "DriverNumber": str(row['DriverNumber']),
                    "Driver": row['Abbreviation'],
                    "Team": row['TeamName'],
                    "Time": time_str,
                    "Points": float(row['Points']),
                    "Laps": int(row['Laps']) # Race usually has correct laps in results_df
                })

        # === CASE C: PRACTICE (FP1, FP2, FP3) ===
        else:
            laps = session.laps
            fastest_laps = laps.pick_quicklaps().reset_index()
            drivers_fastest = fastest_laps.sort_values(by='LapTime').drop_duplicates(subset=['Driver'], keep='first')
            
            position = 1
            for index, row in drivers_fastest.iterrows():
                lap_time_val = row['LapTime']
                time_str = str(lap_time_val).split('days ')[-1][:-3] if pd.notna(lap_time_val) else "No Time"
                
                # Get the manual lap count
                driver_lap_count = int(total_laps_per_driver.get(row['Driver'], 0))

                results.append({
                    "Position": position,
                    "DriverNumber": str(row['DriverNumber']),
                    "Driver": row['Driver'],
                    "Team": row['Team'],
                    "Time": time_str,
                    "Laps": driver_lap_count
                })
                position += 1
                
        return {"round": round_number, "session": session_type, "results": results}
        
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}
    
@app.get("/api/telemetry/{year}/{round_number}/{session_type}/{driver}")
def get_driver_telemetry(year: int, round_number: int, session_type: str, driver: str):
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load(telemetry=True, weather=False)
        
        # 1. Get the fastest lap for this driver
        try:
            lap = session.laps.pick_driver(driver).pick_fastest()
        except:
            return {"error": f"Driver {driver} has no valid lap data."}

        # 2. Get Telemetry (Speed, Throttle, Brake)
        tel = lap.get_telemetry()
        
        # 3. Downsample: Take every 8th point to keep it fast
        tel_reduced = tel.iloc[::8]

        telemetry_data = []
        for _, row in tel_reduced.iterrows():
            telemetry_data.append({
                "Distance": round(row['Distance'], 2),
                "Speed": int(row['Speed']),
                "Throttle": int(row['Throttle']),
                "Brake": int(row['Brake']),
                "RPM": int(row['RPM']),
                "nGear": int(row['nGear'])
            })
            
        return {
            "driver": driver, 
            "telemetry": telemetry_data
        }

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}