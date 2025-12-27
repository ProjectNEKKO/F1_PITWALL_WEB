import React from 'react';

function ResultsTable({ results, sessionType, selectedDriver, onDriverClick }) {
  if (!results) return null;

  return (
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
        {results.map((row, index) => (
          <tr 
              key={index} 
              onClick={() => onDriverClick(row.Driver)}
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
  );
}

export default ResultsTable;