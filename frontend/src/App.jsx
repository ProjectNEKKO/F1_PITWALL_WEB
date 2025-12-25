import { useState, useEffect } from 'react'

function App() {
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const year = 2024 

  useEffect(() => {
    // This connects to your Python Backend
    fetch(`http://127.0.0.1:8000/api/schedule/${year}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        setRaces(data.races)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, []) // Empty array means "run this only once when page loads"

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>F1 Schedule {year}</h1>
      
      {/* 1. Show Loading State */}
      {loading && <p>Loading race data from Python...</p>}

      {/* 2. Show Error State */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* 3. Show Data (The List) */}
      {!loading && !error && (
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th>Round</th>
              <th>Event Name</th>
              <th>Location</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {races.map((race) => (
              <tr key={race.RoundNumber}>
                <td>{race.RoundNumber}</td>
                <td>{race.EventName}</td>
                <td>{race.Location}, {race.Country}</td>
                <td>{new Date(race.EventDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App