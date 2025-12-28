import { useState, useEffect } from 'react';
import { getSchedule, getSessionResults, getTelemetry, getTrackMap, getTyreStrategy, getTimeDelta } from '../services/api';
import Sidebar from '../components/Sidebar';
import ResultsTable from '../components/ResultsTable';
import SessionControls from '../components/SessionControls';
import Telemetry from '../components/Telemetry';
import TrackMap from '../components/TrackMap';
import TyreStrategy from '../components/TyreStrategy';
import { BarChart2, List, ChevronLeft, ChevronRight, Gauge, Activity, GitCommit } from 'lucide-react';
import './Analysis.css'; // <--- IMPORT THE CSS

function Analysis() {
  // Global State
  const [selectedYear, setSelectedYear] = useState(2024);
  const [races, setRaces] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [sessionType, setSessionType] = useState('R');
  
  // Data State
  const [selectedRaceResults, setSelectedRaceResults] = useState(null);
  const [telemetryData, setTelemetryData] = useState(null);
  const [trackData, setTrackData] = useState(null);
  const [strategyData, setStrategyData] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [deltaData, setDeltaData] = useState(null);
  const [comparisonDriver, setComparisonDriver] = useState(null);
  const [loading, setLoading] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('results'); 
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 1. Initial Load
  useEffect(() => {
    setRaces([]);
    getSchedule(selectedYear).then(data => setRaces(data.races || []));
  }, [selectedYear]);

  // 2. Load Session
  const loadSession = (round, type) => {
    setSelectedRound(round);
    setSessionType(type);
    setActiveTab('results'); 
    setTelemetryData(null);
    setStrategyData(null);
    setTrackData(null);
    setSelectedDriver(null);

    getSessionResults(selectedYear, round, type).then(data => {
      if (!data.error) setSelectedRaceResults(data.results);
    });
  };

  // 3. Load Telemetry
  const loadDriverTelemetry = (driver) => {
    setActiveTab('telemetry'); 
    
    if (selectedDriver === driver) return;
    setLoading(true);
    setSelectedDriver(driver);
    setComparisonDriver(null);
    setTrackData(null); 
    setStrategyData(null);
    
    Promise.all([
        getTelemetry(selectedYear, selectedRound, sessionType, driver),
        getTrackMap(selectedYear, selectedRound, sessionType, driver),
        getTyreStrategy(selectedYear, selectedRound, sessionType, driver)
    ]).then(([telData, mapData, stratData]) => {
        setTelemetryData(telData.telemetry);
        setTrackData(mapData.track_data);
        setStrategyData(stratData.strategy);
        setLoading(false);
    });
  };

  // 4. Comparison Logic
  const loadComparison = (driver2) => {
    if (!driver2) {
      setComparisonDriver(null);
      setDeltaData(null); 
      loadDriverTelemetry(selectedDriver); 
      return;
    }
    setLoading(true);
    setComparisonDriver(driver2);

    console.log(`🔎 Requesting Delta: ${selectedDriver} vs ${driver2}`);

    Promise.all([
        getTelemetry(selectedYear, selectedRound, sessionType, driver2),
        getTimeDelta(selectedYear, selectedRound, sessionType, selectedDriver, driver2)
    ]).then(([newData, deltaRes]) => {
      
      console.log("📦 API Response:", deltaRes);

      // 1. Merge Telemetry
      const merged = telemetryData.map((point, i) => {
        const p2 = newData.telemetry[i];
        return { ...point, Speed2: p2?.Speed, Throttle2: p2?.Throttle, Brake2: p2?.Brake, Gear2: p2?.Gear };
      });
      setTelemetryData(merged);
      
      // 2. Set Delta Data
      if (deltaRes && !deltaRes.error) {
          setDeltaData(deltaRes.delta_data);
      }
      
      setLoading(false);
    });
  };

  const currentRace = races.find(r => r.RoundNumber === selectedRound);
  console.log("🏁 Current Race Data:", currentRace);

  return (
    <div className="analysis-container">
      
      {/* 1. COLLAPSIBLE SIDEBAR CONTAINER */}
      <div 
        className="sidebar-wrapper"
        style={{ width: sidebarOpen ? '260px' : '0px', opacity: sidebarOpen ? 1 : 0 }} // Keep dynamic width inline
      >
          <Sidebar 
            races={races} 
            selectedYear={selectedYear} 
            onYearChange={setSelectedYear} 
            selectedRound={selectedRound} 
            onRaceSelect={(round) => loadSession(round, 'R')}
          />
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="main-content">
        
        {/* HEADER */}
        <div className="header-bar">
          
          <div className="header-title-group">
             {/* Toggle Sidebar Button */}
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn">
                {sidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}
             </button>

             {selectedRound ? (
               <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{races.find(r => r.RoundNumber === selectedRound)?.EventName}</h2>
                    <span style={{ fontSize: '12px', color: '#888' }}>Round {selectedRound}</span>
                  </div>
               </div>
             ) : (
                <div style={{color: '#888'}}>Select a race to begin</div>
             )}
          </div>

          {/* TABS & CONTROLS */}
          {selectedRound && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
               <div className="tabs-container">
                  <button 
                    className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('results')}
                  >
                    <List size={16} /> Classification
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
                    onClick={() => setActiveTab('telemetry')}
                  >
                    <BarChart2 size={16} /> Telemetry
                  </button>
               </div>
               
               <div className="separator"></div>
               
               <SessionControls 
                  sessionType={sessionType} 
                  onSessionChange={(type) => loadSession(selectedRound, type)}
                  // 👇 PASS THE RACE DATA HERE
                  raceData={races.find(r => r.RoundNumber === selectedRound)} 
              />
            </div>
          )}
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="scrollable-area">
           
           {/* VIEW 1: RESULTS TABLE */}
           {activeTab === 'results' && selectedRound && (
             <div className="card" style={{padding: 0, overflow: 'hidden'}}>
                <ResultsTable 
                  results={selectedRaceResults} 
                  sessionType={sessionType} 
                  selectedDriver={selectedDriver} 
                  onDriverClick={loadDriverTelemetry} 
                />
             </div>
           )}

           {/* VIEW 2: TELEMETRY (BENTO GRID LAYOUT) */}
           {activeTab === 'telemetry' && selectedDriver && (
             <div className="bento-grid">
                
                {/* ROW 1: STRATEGY */}
                {strategyData && (
                  <div className="card" style={{padding: '15px'}}>
                    <TyreStrategy strategy={strategyData} />
                  </div>
                )}

                {/* ROW 2: MAP & STATS */}
                <div className="bento-row-split">
                    
                    {/* MAP CARD */}
                    <div className="card map-card">
                      <div className="map-header">
                        <h4 className="card-title" style={{marginBottom: 0}}>TRACK LAYOUT</h4>
                      </div>
                      {/* Passed 'height' prop so the map knows to fill the space */}
                      {trackData ? (
                        <TrackMap 
                          data={trackData} 
                          driver={selectedDriver} 
                          driversList={selectedRaceResults}
                          height={350} 
                        /> 
                      ) : (
                        <div style={{height: '100%', background: '#f9f9f9'}}/>
                      )}
                    </div>

                    {/* STATS CARD */}
                    <div className="card stats-container">
                      <div className="stats-grid">
                          
                          {/* 1. TOP SPEED */}
                          <div className="stat-box red">
                            <div className="stat-label">
                                <Gauge size={14} /> TOP SPEED
                            </div>
                            <div className="stat-value">
                              {Math.max(...(telemetryData?.map(d => d.Speed) || [0]))}
                              <span className="stat-unit">KM/H</span>
                            </div>
                          </div>

                          {/* 2. AVG SPEED */}
                          <div className="stat-box blue">
                            <div className="stat-label">
                                <Activity size={14} /> AVG SPEED
                            </div>
                            <div className="stat-value">
                              {Math.round(telemetryData?.reduce((a, b) => a + b.Speed, 0) / (telemetryData?.length || 1))}
                              <span className="stat-unit">KM/H</span>
                            </div>
                          </div>

                          {/* 3. GEAR SHIFTS */}
                          <div className="stat-box orange">
                            <div className="stat-label">
                                <GitCommit size={14} /> GEAR SHIFTS
                            </div>
                            <div className="stat-value">
                              {telemetryData?.filter((d, i, arr) => i > 0 && d.Gear !== arr[i-1].Gear).length || 0}
                            </div>
                          </div>

                      </div>
                    </div>
                </div>

                {/* ROW 3: TELEMETRY GRAPHS */}
                <div className="card">
                    
                    {/* DROPDOWN HEADER */}
                    <div className="dropdown-header">
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
                        TELEMETRY DATA 
                        {comparisonDriver && <span style={{fontWeight: 'normal', color: '#666', marginLeft: '10px'}}>vs {comparisonDriver}</span>}
                      </h4>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', color: '#666' }}>Compare with:</span>
                        <select 
                          className="compare-select"
                          onChange={(e) => loadComparison(e.target.value)} 
                          value={comparisonDriver || ""}
                        >
                          <option value="">-- Solo View --</option>
                          {selectedRaceResults && selectedRaceResults.map(d => (
                            <option key={d.Driver} value={d.Driver}>{d.Driver} ({d.Team})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/* ----------------- */}

                    <Telemetry 
                      data={telemetryData} 
                      deltaData={deltaData}
                      driver1={selectedDriver} 
                      driver2={comparisonDriver} 
                      driversList={selectedRaceResults || []} 
                      onComparisonChange={loadComparison}
                    />
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

export default Analysis;