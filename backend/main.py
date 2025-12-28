from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import fastf1.utils
import os
import pandas as pd
import numpy as np # Needed for math

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

# 5. Schedule Endpoint (UPDATED with EventFormat)
@app.get("/api/schedule/{year}")
def get_schedule(year: int):
    print("✅ RELOADING SCHEDULE... IF YOU SEE THIS, THE NEW CODE IS WORKING!")
    try:
        schedule = fastf1.get_event_schedule(year)
        # FIX: Added 'EventFormat' so frontend knows if it's a Sprint weekend
        json_data = schedule[['RoundNumber', 'Country', 'Location', 'EventName', 'EventDate', 'EventFormat']].to_dict(orient='records')
        return {"year": year, "races": json_data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/session/{year}/{round_number}/{session_type}")
def get_session_results(year: int, round_number: int, session_type: str):
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load()
        results = []

        total_laps_per_driver = session.laps['Driver'].value_counts()

        # === UPDATE 1: Add 'SQ' to this list ===
        # Treat Sprint Qualifying exactly like normal Qualifying
        if session_type in ['Q', 'SQ']: 
            results_df = session.results
            results_df['Position'] = results_df['Position'].fillna(0)

            for index, row in results_df.iterrows():
                def format_time(val):
                    if pd.isnull(val) or val == pd.NaT:
                        return ""
                    return str(val).split('days ')[-1][:-3]

                driver_lap_count = int(total_laps_per_driver.get(row['Abbreviation'], 0))

                results.append({
                    "Position": int(row['Position']),
                    "DriverNumber": str(row['DriverNumber']),
                    "Driver": row['Abbreviation'],
                    "Team": row['TeamName'],
                    "Q1": format_time(row['Q1']),
                    "Q2": format_time(row['Q2']),
                    "Q3": format_time(row['Q3']),
                    "Laps": driver_lap_count
                })

        # CASE B: RACE & SPRINT
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
                    "Laps": int(row['Laps'])
                })

        # CASE C: PRACTICE
        else:
            laps = session.laps
            fastest_laps = laps.pick_quicklaps().reset_index()
            drivers_fastest = fastest_laps.sort_values(by='LapTime').drop_duplicates(subset=['Driver'], keep='first')
            
            position = 1
            for index, row in drivers_fastest.iterrows():
                lap_time_val = row['LapTime']
                time_str = str(lap_time_val).split('days ')[-1][:-3] if pd.notna(lap_time_val) else "No Time"
                
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
        
        try:
            lap = session.laps.pick_driver(driver).pick_fastest()
        except:
            return {"error": f"Driver {driver} has no valid lap data."}

        tel = lap.get_telemetry()
        
        # Downsample for performance
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
        
        lap = session.laps.pick_driver(driver).pick_fastest()
        pos_data = lap.get_telemetry()
        pos_reduced = pos_data.iloc[::2]

        track_data = []
        for _, row in pos_reduced.iterrows():
            track_data.append({
                "x": row['X'],
                "y": row['Y'],
                "speed": row['Speed']
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
        
        lap1 = session.laps.pick_driver(driver1).pick_fastest()
        lap2 = session.laps.pick_driver(driver2).pick_fastest()
        
        delta_series = fastf1.utils.delta_time(lap2, lap1)
        
        if isinstance(delta_series, tuple):
            delta_series = delta_series[0]
            
        dist_series = lap2.get_telemetry()['Distance']
        
        delta_list = delta_series.to_list()
        dist_list = dist_series.to_list()
        
        delta_data = []
        limit = min(len(delta_list), len(dist_list))
        
        for i in range(limit):
             if i % 4 == 0: 
                 delta_data.append({
                     "Distance": dist_list[i],
                     "Delta": delta_list[i] 
                 })
                 
        return {"driver1": driver1, "driver2": driver2, "delta_data": delta_data}

    except Exception as e:
        print(f"Error in delta calculation: {e}")
        return {"error": str(e)}

# === NEW: CORNER ANALYSIS ENDPOINT ===
@app.get("/api/corners/{year}/{round_number}/{session_type}/{driver}")
def get_corner_analysis(year: int, round_number: int, session_type: str, driver: str):
    try:
        session = fastf1.get_session(year, round_number, session_type)
        session.load(telemetry=True, weather=False)
        
        lap = session.laps.pick_driver(driver).pick_fastest()
        tel = lap.get_telemetry()
        
        # 1. Identify "Local Minima" in Speed (The slowest point of a corner)
        # We use a rolling window to filter out noise
        tel['Speed_Smooth'] = tel['Speed'].rolling(window=5, center=True).mean()
        
        # Calculate peaks (minima)
        # This logic finds points where speed is lower than the neighbors
        tel['is_min'] = (tel['Speed_Smooth'] < tel['Speed_Smooth'].shift(1)) & \
                        (tel['Speed_Smooth'] < tel['Speed_Smooth'].shift(-1))
        
        # Filter: Only consider "real" corners, not just tiny lifts on straights
        # Rule: Speed must be < 280km/h (rough heuristic) AND Brake must be applied near it
        minima = tel[tel['is_min'] & (tel['Speed'] < 280)].copy()

        corners = []
        corner_counter = 1
        
        for _, row in minima.iterrows():
            corners.append({
                "CornerID": f"T{corner_counter}", # Temporary ID, usually based on distance
                "Distance": round(row['Distance'], 2),
                "Speed": int(row['Speed']),
                "Gear": int(row['nGear'])
            })
            corner_counter += 1
            
        # Deduplicate corners that are too close (within 50m)
        # This prevents one corner showing up as two distinct minima
        final_corners = []
        if corners:
            last_dist = -1000
            for c in corners:
                if c['Distance'] - last_dist > 50: # Only add if > 50m away from last one
                    final_corners.append(c)
                    last_dist = c['Distance']

        return {"driver": driver, "corners": final_corners}

    except Exception as e:
        print(f"Error in corner analysis: {e}")
        return {"error": str(e)}