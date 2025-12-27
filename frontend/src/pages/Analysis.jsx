import { useState, useEffect } from 'react';
import { getSchedule, getSessionResults, getTelemetry, getTrackMap, getTyreStrategy, getTimeDelta } from '../services/api';
import Sidebar from '../components/Sidebar';
import ResultsTable from '../components/ResultsTable';
import SessionControls from '../components/SessionControls';
import Telemetry from '../components/Telemetry';
import TrackMap from '../components/TrackMap';
import TyreStrategy from '../components/TyreStrategy';
import { BarChart2, List, ChevronLeft, ChevronRight } from 'lucide-react'; 

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
  const [sidebarOpen, setSidebarOpen] = useState(true); // New: Collapse Sidebar

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
    // Auto-collapse sidebar on mobile or small screens could go here
    // setSidebarOpen(false); 
    
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
      setDeltaData(null); // Clear delta when closing comparison
      loadDriverTelemetry(selectedDriver); 
      return;
    }
    setLoading(true);
    setComparisonDriver(driver2);

    console.log(`🔎 Requesting Delta: ${selectedDriver} vs ${driver2}`);

    // Fetch Telemetry AND Time Delta together
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
      
      // 2. Set Delta Data (Check for errors first)
      if (deltaRes && !deltaRes.error) {
          setDeltaData(deltaRes.delta_data);
      }
      
      setLoading(false);
    });
  };

  // --- STYLES ---
  const tabBtnStyle = (isActive) => ({
    padding: '8px 16px',
    cursor: 'pointer',
    borderRadius: '6px',
    background: isActive ? '#e10600' : 'transparent',
    color: isActive ? 'white' : '#666',
    fontWeight: '600',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  });

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '"Segoe UI", Roboto, sans-serif', background: '#f5f7fa', overflow: 'hidden' }}>
      
      {/* 1. COLLAPSIBLE SIDEBAR CONTAINER */}
      <div style={{ 
          width: sidebarOpen ? '260px' : '0px', 
          opacity: sidebarOpen ? 1 : 0,
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          borderRight: '1px solid #ddd',
          background: 'white',
          position: 'relative'
      }}>
          <Sidebar 
            races={races} 
            selectedYear={selectedYear} 
            onYearChange={setSelectedYear} 
            selectedRound={selectedRound} 
            onRaceSelect={(round) => loadSession(round, 'R')}
          />
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* COMPACT HEADER */}
        <div style={{ background: 'white', borderBottom: '1px solid #ddd', padding: '12px 25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             {/* Toggle Sidebar Button */}
             <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0, display: 'flex' }}>
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

          {/* INLINE TABS & CONTROLS (Saves vertical space) */}
          {selectedRound && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
               <div style={{ display: 'flex', background: '#f0f2f5', padding: '4px', borderRadius: '8px' }}>
                  <div style={tabBtnStyle(activeTab === 'results')} onClick={() => setActiveTab('results')}>
                    <List size={16} /> Classification
                  </div>
                  <div style={tabBtnStyle(activeTab === 'telemetry')} onClick={() => setActiveTab('telemetry')}>
                    <BarChart2 size={16} /> Telemetry
                  </div>
               </div>
               <div style={{ height: '20px', width: '1px', background: '#ddd' }}></div>
               <SessionControls sessionType={sessionType} onSessionChange={(type) => loadSession(selectedRound, type)} />
            </div>
          )}
        </div>

        {/* SCROLLABLE CONTENT (100% Width) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
           
           {/* VIEW 1: RESULTS TABLE */}
           {activeTab === 'results' && selectedRound && (
             <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
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
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
                
                {/* ROW 1: STRATEGY (Full Width) */}
                {strategyData && (
                  <div style={{ background: 'white', padding: '15px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <TyreStrategy strategy={strategyData} />
                  </div>
                )}

                {/* ROW 2: MAP & STATS (Split 30% / 70%) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '20px' }}>
                    
                    {/* MAP CARD */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', height: '320px' }}>
                      <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#666', fontWeight: '700' }}>TRACK LAYOUT</h4>
                      {trackData ? <TrackMap data={trackData} driver={selectedDriver} /> : <div style={{height: '100%', background: '#f5f5f5', borderRadius: '8px'}}/>}
                    </div>

                    {/* STATS CARD (Placeholder stats for now) */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', textAlign: 'center' }}>
                          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                             <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>TOP SPEED</div>
                             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                               {Math.max(...(telemetryData?.map(d => d.Speed) || [0]))} km/h
                             </div>
                          </div>
                          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                             <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>AVG SPEED</div>
                             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                               {Math.round(telemetryData?.reduce((a, b) => a + b.Speed, 0) / (telemetryData?.length || 1))} km/h
                             </div>
                          </div>
                          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                             <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>GEAR SHIFTS</div>
                             <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
                               {telemetryData?.filter((d, i, arr) => i > 0 && d.Gear !== arr[i-1].Gear).length || 0}
                             </div>
                          </div>
                       </div>
                    </div>
                </div>

                {/* ROW 3: TELEMETRY GRAPHS (Full Width) */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    
                    {/* --- THIS IS THE DROPDOWN HEADER --- */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
                        TELEMETRY DATA 
                        {comparisonDriver && <span style={{fontWeight: 'normal', color: '#666', marginLeft: '10px'}}>vs {comparisonDriver}</span>}
                      </h4>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', color: '#666' }}>Compare with:</span>
                        <select 
                          onChange={(e) => loadComparison(e.target.value)} 
                          value={comparisonDriver || ""}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', cursor: 'pointer', background: '#f8f9fa' }}
                        >
                          <option value="">-- Solo View --</option>
                          {selectedRaceResults && selectedRaceResults.map(d => (
                            <option key={d.Driver} value={d.Driver}>{d.Driver} ({d.Team})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/* ----------------------------------- */}

                    <Telemetry 
                      data={telemetryData} 
                      deltaData={deltaData} // We will hook up delta next
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