import React from 'react';
import './TyreStrategy.css'; 

function TyreStrategy({ strategy }) {
  if (!strategy || strategy.length === 0) {
    return <div style={{color: '#999', fontSize: '13px', fontStyle: 'italic', padding: '10px'}}>No tyre data available</div>;
  }

  // 1. Calculations
  const totalLaps = strategy.reduce((acc, stint) => acc + stint.laps_count, 0);

  // 2. Colors
  const getCompoundColor = (compound) => {
    switch (compound) {
      case 'SOFT': return '#ff3b30';   // Brighter Red
      case 'MEDIUM': return '#ffcc00'; // Richer Yellow
      case 'HARD': return '#f2f2f7';   // Clean White/Grey
      case 'INTERMEDIATE': return '#34c759'; 
      case 'WET': return '#007aff';    
      default: return '#8e8e93';
    }
  };

  const getTextColor = (compound) => {
    return compound === 'HARD' || compound === 'MEDIUM' ? '#1c1c1e' : 'white';
  };

  // 3. Generate Ruler Ticks (0, 10, 20...)
  const ticks = [];
  for (let i = 0; i <= totalLaps; i += 10) {
    ticks.push(i);
  }
  // Always include the finish line
  if (ticks[ticks.length - 1] !== totalLaps) {
      ticks.push(totalLaps);
  }

  return (
    <div className="strategy-container">
      
      <div className="strategy-header">
        <div className="strategy-title">Tyre History</div>
        <div className="total-laps">{totalLaps} Laps Total</div>
      </div>
      
      {/* Visual Track Wrapper */}
      <div className="track-wrapper">
          
          {/* The Bar itself */}
          <div className="strategy-track">
            {strategy.map((stint, index) => {
              const widthPct = (stint.laps_count / totalLaps) * 100;
              const textColor = getTextColor(stint.compound);
              const letter = stint.compound.charAt(0);
              
              return (
                <div 
                  key={index}
                  className="stint-block"
                  style={{ 
                    width: `${widthPct}%`, 
                    backgroundColor: getCompoundColor(stint.compound),
                    color: textColor,
                    animationDelay: `${index * 0.1}s` // Staggered animation
                  }}
                  title={`Stint ${stint.stint}: ${stint.compound} (${stint.laps_count} Laps)`}
                >
                  {widthPct > 12 ? (
                     <span style={{ whiteSpace: 'nowrap' }}>
                        {letter} <span style={{ opacity: 0.7, fontWeight: 500, fontSize: '11px' }}>L{stint.laps_count}</span>
                     </span>
                  ) : widthPct > 5 ? (
                     letter
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* The Ruler below */}
          <div className="ruler-container">
              {ticks.map(lap => (
                  <div 
                    key={lap} 
                    style={{ left: `${(lap / totalLaps) * 100}%`, position: 'absolute', bottom: 0 }}
                  >
                      <div className="ruler-tick"></div>
                      <div className="ruler-label">{lap}</div>
                  </div>
              ))}
          </div>
      </div>

      {/* Styled Legend */}
      <div className="strategy-legend">
        {['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'].map(c => (
            strategy.some(s => s.compound === c) && (
                <div key={c} className="legend-badge">
                    <span className="legend-circle" style={{background: getCompoundColor(c)}}></span>
                    {c}
                </div>
            )
        ))}
      </div>
    </div>
  );
}

export default TyreStrategy;