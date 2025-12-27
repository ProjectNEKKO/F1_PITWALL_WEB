import { useState, useEffect } from 'react';
import { getSchedule, getSessionResults, getTelemetry } from './services/api';
import Sidebar from './components/Sidebar';
import ResultsTable from './components/ResultsTable';
import SessionControls from './components/SessionControls';
import Telemetry from './components/Telemetry';

function App() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [races, setRaces] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedRaceResults, setSelectedRaceResults] = useState(null);
  const [sessionType, setSessionType] = useState('R');
  
  const [telemetryData, setTelemetryData] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [comparisonDriver, setComparisonDriver] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    setRaces([]);
    setSelectedRound(null);
    setSelectedRaceResults(null);
    setTelemetryData(null);
    getSchedule(selectedYear).then(data => setRaces(data.races || []));
  }, [selectedYear]);

  // 2. Load Session
  const loadSession = (round, type) => {
    setSelectedRound(round);
    setSessionType(type);
    // Don't clear telemetry immediately so the graph doesn't "blink" away if keeping same driver
    // But for a new round, we probably should clear it.
    // For now, let's clear it to be safe.
    setTelemetryData(null);
    setSelectedDriver(null);
    setComparisonDriver(null);

    getSessionResults(selectedYear, round, type).then(data => {
      if (!data.error) setSelectedRaceResults(data.results);
    });
  };

  // 3. Load Driver Telemetry
  const loadDriverTelemetry = (driver) => {
    if (selectedDriver === driver) return;
    setLoading(true);
    setSelectedDriver(driver);
    setComparisonDriver(null);
    
    getTelemetry(selectedYear, selectedRound, sessionType, driver).then(data => {
      setTelemetryData(data.telemetry);
      setLoading(false);
    });
  };

  // 4. Comparison Logic
  const loadComparison = (driver2) => {
    if (!driver2) {
      setComparisonDriver(null);
      loadDriverTelemetry(selectedDriver); 
      return;
    }
    setLoading(true);
    setComparisonDriver(driver2);

    getTelemetry(selectedYear, selectedRound, sessionType, driver2).then(newData => {
      const merged = telemetryData.map((point, i) => {
        const p2 = newData.telemetry[i];
        return {
          ...point,
          Speed2: p2?.Speed,
          Throttle2: p2?.Throttle,
          Brake2: p2?.Brake
        };
      });
      setTelemetryData(merged);
      setLoading(false);
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>
      
      {/* 1. SLIM SIDEBAR */}
      <Sidebar 
        races={races} 
        selectedYear={selectedYear} 
        onYearChange={setSelectedYear} 
        selectedRound={selectedRound} 
        onRaceSelect={(round) => loadSession(round, 'R')}
      />

      {/* 2. MAIN CONTENT AREA (Flex Column) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f7fa' }}>
        
        {/* === TOP SECTION (Fixed/Pinned) === */}
        {/* This section will NOT scroll. It stays at the top. */}
        <div style={{ borderBottom: '1px solid #ddd', background: 'white', padding: '15px 25px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10 }}>
          
          {/* Header & Controls */}
          {selectedRound ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                 <h2 style={{margin: 0, fontSize: '24px'}}>
                   {races.find(r => r.RoundNumber === selectedRound)?.EventName}
                 </h2>
                 <p style={{margin: '5px 0 0 0', fontSize: '13px', color: '#666'}}>
                   Round {selectedRound} • {selectedYear}
                 </p>
              </div>
              <SessionControls sessionType={sessionType} onSessionChange={(type) => loadSession(selectedRound, type)} />
            </div>
          ) : (
            <div style={{ color: '#888', fontStyle: 'italic' }}>Select a race from the sidebar to begin</div>
          )}
        </div>

        {/* === TELEMETRY SECTION (Pinned below header if active) === */}
        {/* We keep this outside the scrollable area so it's always visible */}
        <div style={{ background: '#f5f7fa', flexShrink: 0 }}> 
            {loading && <div style={{padding: '10px 25px', color: '#666', fontSize: '12px'}}>Fetching Data...</div>}
            
            {telemetryData && (
              <div style={{ padding: '20px 25px 0 25px' }}>
                <Telemetry 
                  data={telemetryData} 
                  driver1={selectedDriver} 
                  driver2={comparisonDriver} 
                  driversList={selectedRaceResults || []}
                  onComparisonChange={loadComparison}
                />
              </div>
            )}
        </div>

        {/* === BOTTOM SECTION (Scrollable Table) === */}
        {/* This div takes up all remaining space and scrolls internally */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 25px' }}>
          <ResultsTable 
            results={selectedRaceResults} 
            sessionType={sessionType} 
            selectedDriver={selectedDriver} 
            onDriverClick={loadDriverTelemetry} 
          />
          {/* Add some padding at bottom so the last row isn't stuck to the edge */}
          <div style={{ height: '40px' }}></div>
        </div>

      </div>
    </div>
  );
}

export default App;