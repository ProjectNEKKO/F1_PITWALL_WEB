import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { getTeamColor } from '../utils/f1Teams';
import './TrackMap.css';

function TrackMap({ data, driver, height, driversList }) {
  if (!data || data.length === 0) {
      return (
        <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontStyle: 'italic'}}>
            Loading Track Data...
        </div>
      );
  }

  // 1. Resolve Team Color
  let trackColor = '#333'; // Default dark grey
  if (driversList && driver) {
      const driverInfo = driversList.find(d => d.Driver === driver);
      if (driverInfo) {
          trackColor = getTeamColor(driverInfo.Team);
      }
  }

  // 2. Prepare Data
  const mapData = data.map(pt => ({
      x: pt.x,
      y: pt.y,
      speed: pt.speed
  }));

  return (
    <div className="track-map-container" style={{ height: height || 300 }}>
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 60, right: 20, bottom: 20, left: 20 }}>
                {/* Hide Axes completely for the "GPS" look */}
                <XAxis type="number" dataKey="x" hide domain={['auto', 'auto']} />
                <YAxis type="number" dataKey="y" hide domain={['auto', 'auto']} />
                
                <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div style={{ 
                                    background: 'rgba(0,0,0,0.85)', 
                                    color: 'white', 
                                    padding: '6px 12px', 
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontFamily: 'Consolas, monospace',
                                    border: '1px solid #555'
                                }}>
                                    <span style={{color: '#aaa'}}>Speed:</span> <b>{payload[0].payload.speed} km/h</b>
                                </div>
                            );
                        }
                        return null;
                    }}
                />

                {/* THE MAIN TRACK LINE */}
                <Scatter 
                    name="Track" 
                    data={mapData} 
                    fill={trackColor}
                    line={{ stroke: trackColor, strokeWidth: 5 }} 
                    shape="circle"
                    legendType="none"
                >
                    {/* Make the individual dots invisible so it looks like a smooth line */}
                    {mapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fillOpacity={0} /> 
                    ))}
                </Scatter>

                {/* START/FINISH LINE MARKER (Green Dot at Index 0) */}
                <Scatter 
                    data={[mapData[0]]} 
                    fill="#2ecc71" 
                    line={false} 
                    shape="circle" 
                    legendType="none"
                    zIndex={10}
                >
                     <Cell fill="#2ecc71" stroke="#fff" strokeWidth={2} />
                </Scatter>

            </ScatterChart>
        </ResponsiveContainer>
        
        <div className="map-overlay-hint">
            {driver} • {driversList?.find(d => d.Driver === driver)?.Team || 'F1'}
        </div>
    </div>
  );
}

export default TrackMap;