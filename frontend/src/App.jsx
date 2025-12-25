import { useState, useEffect } from 'react'

function App() {
  const [races, setRaces] = useState([])
  const [selectedRaceResults, setSelectedRaceResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingResults, setLoadingResults] = useState(false)
  const year = 2024 

  // 1. Fetch Schedule on Load
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/schedule/${year}`)
      .then(res => res.json())
      .then(data => {
        setRaces(data.races || [])
        setLoading(false)
      })
      .catch(err => console.error(err))
  }, [])

  // 2. Handle Click Event
  const handleRaceClick = (roundNumber) => {
    setLoadingResults(true)
    setSelectedRaceResults(null) 
    
    fetch(`http://127.0.0.1:8000/api/qualifying/${year}/${roundNumber}`)
      .then(res => res.json())
      .then(data => {
        setSelectedRaceResults(data.results)
        setLoadingResults(false)
      })
      .catch(err => {
        alert("Error loading race: " + err.message)
        setLoadingResults(false)
      })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* LEFT SIDE: The Schedule List */}
      <div style={{ width: '40%', borderRight: '2px solid #ddd', overflowY: 'auto', padding: '10px' }}>
        <h2>F1 {year} Schedule</h2>
        {loading && <p>Loading schedule...</p>}
        
        {races.map((race) => (
          <div 
            key={race.RoundNumber} 
            style={{ 
              padding: '15px', 
              borderBottom: '1px solid #eee', 
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            onClick={() => handleRaceClick(race.RoundNumber)}
          >
            <div>
              <strong>Round {race.RoundNumber}</strong>
              <div style={{ fontSize: '0.9em', color: '#555' }}>{race.EventName}</div>
            </div>
            <button style={{ padding: '5px 10px', background: '#e10600', color: 'white', border: 'none', borderRadius: '4px' }}>
              {"View >"}
            </button>
          </div>
        ))}
      </div>

      {/* RIGHT SIDE: The Results Panel */}
      <div style={{ width: '60%', padding: '20px', background: '#f9f9f9', overflowY: 'auto' }}>
        
        {!selectedRaceResults && !loadingResults && (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#777' }}>
            <h3>Select a race to view details</h3>
          </div>
        )}

        {loadingResults && (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h3>🏎️ Downloading Telemetry Data...</h3>
            <p>Please wait, this handles a lot of data!</p>
          </div>
        )}

        {selectedRaceResults && (
          <div>
            <h2 style={{ borderBottom: '2px solid #e10600', paddingBottom: '10px' }}>Qualifying Results</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#333', color: 'white' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Pos</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Driver</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Team</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {selectedRaceResults.map((driver) => (
                  <tr key={driver.Driver} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{driver.Position}</td>
                    <td style={{ padding: '10px' }}><strong>{driver.Driver}</strong></td>
                    <td style={{ padding: '10px' }}>{driver.Team}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{driver.LapTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default App