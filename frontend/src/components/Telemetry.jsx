import React from 'react';
import TelemetryChart from './TelemetryChart'; // Ensure TelemetryChart.jsx is moved to /components

function Telemetry({ data, driver1, driver2, driversList, onComparisonChange }) {
  if (!data) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'white', 
          padding: '15px 20px', 
          borderRadius: '10px 10px 0 0',
          borderBottom: '1px solid #eee'
      }}>
          <h3 style={{ margin: 0 }}>
              Telemetry: <span style={{color: '#e10600'}}>{driver1}</span> 
              {driver2 && <span style={{color: '#2b6ef9'}}> vs {driver2}</span>}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{fontSize: '13px', color: '#666', fontWeight: 'bold'}}>COMPARE:</span>
              <select 
                  onChange={(e) => onComparisonChange(e.target.value)}
                  value={driver2 || ""}
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}
              >
                  <option value="">-- Solo View --</option>
                  {driversList
                      .filter(r => r.Driver !== driver1)
                      .map(r => (
                          <option key={r.Driver} value={r.Driver}>{r.Driver}</option>
                      ))
                  }
              </select>
          </div>
      </div>

      <TelemetryChart 
          data={data} 
          driver1={driver1} 
          driver2={driver2} 
      />
    </div>
  );
}

export default Telemetry;