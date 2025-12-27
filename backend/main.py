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
        
        tel_reduced = tel.iloc[::4]

        telemetry_data = []
        for _, row in tel_reduced.iterrows():
            telemetry_data.append({
                "Distance": round(row['Distance'], 2),
                "Speed": int(row['Speed']),
                "Throttle": int(row['Throttle']),
                "Brake": int(row['Brake']),
                "RPM": int(row['RPM']),
                "Gear": int(row['nGear'])
            })
            
        return {
            "driver": driver, 
            "telemetry": telemetry_data
        }

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}


@app.get("/api/map/{year}/{round_number}/{session_type}/{driver}")
def get_track_map(year: int, round_number: int, session_type: str, driver: str):
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load(telemetry=True, weather=False)
        
        # 1. Get the fastest lap
        lap = session.laps.pick_driver(driver).pick_fastest()
        
        # 2. Get Telemetry (includes X, Y, Z coordinates)
        # We also want 'Speed' so we can color-code the map later if we want
        pos_data = lap.get_telemetry()
        
        pos_reduced = pos_data.iloc[::2]

        track_data = []
        for _, row in pos_reduced.iterrows():
            track_data.append({
                "x": row['X'],
                "y": row['Y'],
                "speed": row['Speed'] # Useful for coloring later
            })
            
        return {
            "driver": driver, 
            "track_data": track_data
        }

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}

@app.get("/api/strategy/{year}/{round_number}/{session_type}/{driver}")
def get_tyre_strategy(year: int, round_number: int, session_type: str, driver: str):
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load(telemetry=False, weather=False)
        
        laps = session.laps.pick_driver(driver)
        stints = []
        
        # Group laps by 'Stint' to find start/end of each tyre set
        # We look at "Compound" (SOFT, MEDIUM, HARD)
        for stint_id, stint_laps in laps.groupby("Stint"):
            compound = stint_laps["Compound"].iloc[0]
            start_lap = int(stint_laps["LapNumber"].min())
            end_lap = int(stint_laps["LapNumber"].max())
            
            stints.append({
                "stint": int(stint_id),
                "compound": str(compound),
                "start_lap": start_lap,
                "end_lap": end_lap,
                "laps_count": end_lap - start_lap + 1
            })
            
        return {"driver": driver, "strategy": stints}

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}
    
@app.get("/api/delta/{year}/{round_number}/{session_type}/{driver1}/{driver2}")
def get_time_delta(year: int, round_number: int, session_type: str, driver1: str, driver2: str):
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load(telemetry=True, weather=False)
        
        # 1. Get Fastest Laps
        lap1 = session.laps.pick_driver(driver1).pick_fastest()
        lap2 = session.laps.pick_driver(driver2).pick_fastest()
        
        # 2. Calculate Gap using FastF1
        # We calculate the delta of Lap 1 (Target) relative to Lap 2 (Reference)
        delta_series = fastf1.utils.delta_time(lap2, lap1)
        
        # FIX 1: Handle if FastF1 returns a Tuple instead of a Series
        if isinstance(delta_series, tuple):
            delta_series = delta_series[0]
            
        # FIX 2: Use Lap 2's distance because the delta is calculated relative to IT
        dist_series = lap2.get_telemetry()['Distance']
        
        # FIX 3: Convert to simple lists to avoid "iloc" errors entirely
        delta_list = delta_series.to_list()
        dist_list = dist_series.to_list()
        
        # 3. Format for Frontend
        delta_data = []
        # Safety: Ensure we don't go out of bounds if lengths differ slightly
        limit = min(len(delta_list), len(dist_list))
        
        for i in range(limit):
             if i % 4 == 0: # Downsample for speed
                 delta_data.append({
                     "Distance": dist_list[i],
                     "Delta": delta_list[i] 
                 })
                 
        return {"driver1": driver1, "driver2": driver2, "delta_data": delta_data}

    except Exception as e:
        print(f"Error in delta calculation: {e}")
        return {"error": str(e)}