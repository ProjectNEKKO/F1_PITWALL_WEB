import { useState, useEffect } from 'react'
import TelemetryChart from './TelemetryChart'

function App() {
  const [selectedYear, setSelectedYear] = useState(2024)
  const [races, setRaces] = useState([])
  const [selectedRound, setSelectedRound] = useState(null)
  const [selectedRaceResults, setSelectedRaceResults] = useState(null)
  const [sessionType, setSessionType] = useState('R') 
  const [loading, setLoading] = useState(false)
  
  // Telemetry State
  const [telemetryData, setTelemetryData] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [comparisonDriver, setComparisonDriver] = useState(null) // <--- New State
  const [loadingTelemetry, setLoadingTelemetry] = useState(false)

  // 1. Fetch Schedule
  useEffect(() => {
    setLoading(true)
    setRaces([])
    setSelectedRaceResults(null)
    setTelemetryData(null)
    setSelectedDriver(null)
    setComparisonDriver(null)

    fetch(`http://127.0.0.1:8000/api/schedule/${selectedYear}`)
      .then(res => res.json())
      .then(data => {
        setRaces(data.races || [])
        setLoading(false)
      })
  }, [selectedYear])

  // 2. Load Session
  const loadSession = (round, type) => {
    setSelectedRaceResults(null)
    setTelemetryData(null)
    setSelectedDriver(null)
    setComparisonDriver(null)
    setSelectedRound(round)
    setSessionType(type)

    fetch(`http://127.0.0.1:8000/api/session/${selectedYear}/${round}/${type}`)
      .then(res => res.json())
      .then(data => {
        if(data.error) alert(data.error)
        else setSelectedRaceResults(data.results)
      })
  }

  // 3. Load Main Driver Telemetry
  const loadTelemetry = (driver) => {
    if (selectedDriver === driver) return;
    
    setLoadingTelemetry(true)
    setSelectedDriver(driver)
    setComparisonDriver(null) // Reset comparison when switching main driver
    setTelemetryData(null)

    fetch(`http://127.0.0.1:8000/api/telemetry/${selectedYear}/${selectedRound}/${sessionType}/${driver}`)
      .then(res => res.json())
      .then(data => {
        if(data.error) {
            alert(data.error)
            setSelectedDriver(null)
        } else {
            setTelemetryData(data.telemetry)
        }
        setLoadingTelemetry(false)
      })
  }

  // 4. Load Comparison Driver (Merge Logic)
  const loadComparison = (driver2) => {
    if (!driver2 || driver2 === selectedDriver) {
        setComparisonDriver(null)
        loadTelemetry(selectedDriver)
        return
    }

    setLoadingTelemetry(true)
    setComparisonDriver(driver2)

    fetch(`http://127.0.0.1:8000/api/telemetry/${selectedYear}/${selectedRound}/${sessionType}/${driver2}`)
      .then(res => res.json())
      .then(newResult => {
        
        // --- UPDATED MERGE LOGIC ---
        // Now we merge Speed, Throttle, AND Brake
        const mergedData = telemetryData.map((point, index) => {
            const point2 = newResult.telemetry[index]
            
            return {
                ...point, // Driver 1 Data
                Speed2: point2 ? point2.Speed : null,       // Driver 2 Speed
                Throttle2: point2 ? point2.Throttle : null, // Driver 2 Throttle
                Brake2: point2 ? point2.Brake : null        // Driver 2 Brake
            }
        })

        setTelemetryData(mergedData)
        setLoadingTelemetry(false)
      })
  }

  const years = Array.from({ length: 8 }, (_, i) => 2025 - i)

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* LEFT: Schedule */}
      <div style={{ width: '350px', borderRight: '2px solid #ddd', overflowY: 'auto', padding: '10px', background: '#f4f4f4' }}>
        <div style={{ marginBottom: '20px', padding: '10px', background: 'white', borderRadius: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>SEASON</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {races.map((race) => (
          <div 
            key={race.RoundNumber} 
            onClick={() => loadSession(race.RoundNumber, 'R')}
            style={{ 
              padding: '12px', 
              marginBottom: '8px',
              background: selectedRound === race.RoundNumber ? '#e10600' : 'white',
              color: selectedRound === race.RoundNumber ? 'white' : 'black',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <strong>{race.EventName}</strong>
          </div>
        ))}
      </div>

      {/* RIGHT: Results & Chart */}
      <div style={{ flex: 1, padding: '20px', background: '#f9f9f9', overflowY: 'auto' }}>
        
        {/* Header */}
        {selectedRound && (
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{margin: 0}}>Results <span style={{fontSize: '0.6em', color: '#666'}}>Round {selectedRound}</span></h2>
                    <p style={{margin: '5px 0 0 0', fontSize: '12px', color: '#888'}}>
                        Click any row to view telemetry
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    {['FP1', 'FP2', 'FP3', 'Q', 'S', 'R'].map((type) => (
                        <button 
                            key={type}
                            onClick={() => loadSession(selectedRound, type)}
                            style={{
                                padding: '6px 12px',
                                cursor: 'pointer',
                                background: sessionType === type ? '#e10600' : '#ddd',
                                color: sessionType === type ? 'white' : 'black',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* 1. TELEMETRY CHART AREA */}
        {loadingTelemetry && <div style={{padding: '20px', textAlign: 'center'}}>Loading data...</div>}
        
        {telemetryData && (
            <div style={{ marginBottom: '20px' }}>
                
                {/* COMPARE DROPDOWN */}
                <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                    <span style={{fontSize: '14px', marginRight: '10px', fontWeight: 'bold'}}>Compare {selectedDriver} with: </span>
                    <select 
                        onChange={(e) => loadComparison(e.target.value)}
                        value={comparisonDriver || ""}
                        style={{ padding: '5px', borderRadius: '4px' }}
                    >
                        <option value="">-- None --</option>
                        {selectedRaceResults
                            .filter(r => r.Driver !== selectedDriver) // Remove current driver from list
                            .map(r => (
                                <option key={r.Driver} value={r.Driver}>{r.Driver}</option>
                            ))
                        }
                    </select>
                </div>

                <TelemetryChart 
                    data={telemetryData} 
                    driver1={selectedDriver} 
                    driver2={comparisonDriver} 
                />
            </div>
        )}

        {/* 2. TABLE */}
        {selectedRaceResults && (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', fontSize: '13px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#15151e', color: '#949498', textAlign: 'left', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Pos</th>
                <th style={{ padding: '12px' }}>No</th>
                <th style={{ padding: '12px' }}>Driver</th>
                <th style={{ padding: '12px' }}>Team</th>
                
                {sessionType === 'Q' ? (
                  <>
                    <th style={{ padding: '12px' }}>Q1</th>
                    <th style={{ padding: '12px' }}>Q2</th>
                    <th style={{ padding: '12px' }}>Q3</th>
                  </>
                ) : (
                  <th style={{ padding: '12px' }}>Time / Gap</th>
                )}

                <th style={{ padding: '12px' }}>Laps</th>
                
                {['R', 'S'].includes(sessionType) && (
                    <th style={{ padding: '12px' }}>Pts</th>
                )}
              </tr>
            </thead>
            <tbody>
              {selectedRaceResults.map((row, index) => (
                <tr 
                    key={index} 
                    onClick={() => loadTelemetry(row.Driver)}
                    style={{ 
                        borderBottom: '1px solid #eee', 
                        height: '45px', 
                        cursor: 'pointer',
                        background: selectedDriver === row.Driver ? '#ffecec' : (index % 2 === 0 ? 'white' : '#fafafa')
                    }}
                >
                  <td style={{ padding: '0 12px', fontWeight: 'bold' }}>{row.Position}</td>
                  <td style={{ padding: '0 12px', color: '#e10600', fontWeight: 'bold' }}>{row.DriverNumber}</td>
                  <td style={{ padding: '0 12px', fontWeight: 'bold' }}>{row.Driver}</td>
                  <td style={{ padding: '0 12px', color: '#666' }}>{row.Team}</td>
                  
                  {sessionType === 'Q' ? (
                    <>
                      <td style={{ padding: '0 12px', fontFamily: 'monospace', color: '#666' }}>{row.Q1}</td>
                      <td style={{ padding: '0 12px', fontFamily: 'monospace', color: '#666' }}>{row.Q2}</td>
                      <td style={{ padding: '0 12px', fontFamily: 'monospace', color: 'black', fontWeight: 'bold' }}>{row.Q3}</td>
                    </>
                  ) : (
                    <td style={{ padding: '0 12px', fontFamily: 'monospace' }}>{row.Time}</td>
                  )}

                  <td style={{ padding: '0 12px' }}>{row.Laps}</td>
                  
                  {['R', 'S'].includes(sessionType) && (
                      <td style={{ padding: '0 12px', fontWeight: 'bold' }}>{row.Points}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default App