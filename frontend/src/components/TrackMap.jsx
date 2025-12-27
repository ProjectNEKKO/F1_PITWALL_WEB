import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

function TrackMap({ data, driver }) {
  if (!data) return null;

  // Helper to color the track based on speed (Simple Heatmap)
  // Low speed (corners) = Blue, High speed (straights) = Red
  const getColor = (speed) => {
    if (speed < 100) return '#0000ff'; // Slow (Blue)
    if (speed < 200) return '#00ff00'; // Medium (Green)
    return '#ff0000'; // Fast (Red)
  };

  return (
    <div style={{ height: '300px', background: 'white', borderRadius: '10px', padding: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <h4 style={{ margin: '0 0 10px 0', textAlign: 'center', color: '#666' }}>Track Layout ({driver})</h4>
      
      <ResponsiveContainer width="100%" height="90%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          {/* Hide Axes for a cleaner map look */}
          <XAxis type="number" dataKey="x" hide domain={['auto', 'auto']} />
          <YAxis type="number" dataKey="y" hide domain={['auto', 'auto']} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              if (payload && payload.length) {
                return (
                  <div style={{ background: '#333', color: '#fff', padding: '5px', borderRadius: '3px', fontSize: '12px' }}>
                    Speed: {payload[0].payload.speed} km/h
                  </div>
                );
              }
              return null;
            }}
          />
          <Scatter name="Track" data={data} line={{ strokeWidth: 2 }} shape="circle">
            {/* Map over data to color each point */}
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.speed)} r={2} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrackMap;