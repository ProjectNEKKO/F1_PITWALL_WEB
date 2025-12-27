import React from 'react';

function TyreStrategy({ strategy }) {
  if (!strategy) return null;

  // Official F1 Tyre Colors
  const getTyreColor = (compound) => {
    switch (compound?.toUpperCase()) {
      case 'SOFT': return '#ff3333';   // Red
      case 'MEDIUM': return '#ffe600'; // Yellow
      case 'HARD': return '#ffffff';   // White
      case 'INTERMEDIATE': return '#39b54a'; // Green
      case 'WET': return '#005aff';    // Blue
      default: return '#888';
    }
  };

  // Calculate total laps to scale the bars correctly
  const totalLaps = strategy.reduce((acc, s) => acc + s.laps_count, 0);

  return (
    <div style={{ marginBottom: '15px', padding: '10px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Tyre Strategy</h4>
      
      {/* The Timeline Bar */}
      <div style={{ display: 'flex', height: '25px', width: '100%', borderRadius: '4px', overflow: 'hidden', background: '#333' }}>
        {strategy.map((stint, index) => (
          <div 
            key={index}
            style={{ 
              width: `${(stint.laps_count / totalLaps) * 100}%`, // Proportional width
              background: getTyreColor(stint.compound),
              borderRight: '2px solid #222', // Separator line
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'black',
              fontSize: '10px',
              fontWeight: 'bold',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}
            title={`Stint ${stint.stint}: ${stint.compound} (Laps ${stint.start_lap}-${stint.end_lap})`}
          >
            {stint.compound ? stint.compound[0] : "?"} {/* Shows 'S', 'M', 'H' */}
          </div>
        ))}
      </div>
      
      {/* Legend below bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '10px', color: '#888' }}>
        <span>Lap 1</span>
        <span>Lap {totalLaps}</span>
      </div>
    </div>
  );
}

export default TyreStrategy;