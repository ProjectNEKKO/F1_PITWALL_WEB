import React from 'react';
import './TyreStrategy.css'; // <--- Import the CSS

function TyreStrategy({ strategy }) {
  if (!strategy || strategy.length === 0) return null;

  const lastStint = strategy[strategy.length - 1];
  const totalLaps = lastStint.end_lap || lastStint.total_laps || 57;

  // Helper to get the right class name
  const getTyreClass = (name) => {
    switch (name?.toUpperCase()) {
      case 'SOFT': return 'tyre-soft';
      case 'MEDIUM': return 'tyre-medium';
      case 'HARD': return 'tyre-hard';
      case 'INTERMEDIATE': return 'tyre-inter';
      case 'WET': return 'tyre-wet';
      default: return 'tyre-unknown';
    }
  };

  return (
    <div className="strategy-container">
      <h4 className="strategy-title">Tyre History & Pit Stops</h4>

      <div className="timeline-bar">
        {strategy.map((stint, index) => {
            const compoundName = stint.compound || "Unknown";
            const lapStart = stint.start_lap || 0;
            const lapEnd = stint.end_lap || (lapStart + 1);
            const stintLength = stint.laps_count || (lapEnd - lapStart);
            const widthPct = Math.max((stintLength / totalLaps) * 100, 2);

            const isFirst = index === 0;
            const isLast = index === strategy.length - 1;
            
            // Dynamic inline style for width & rounded corners only
            const dynamicStyle = {
                width: `${widthPct}%`,
                borderRight: !isLast ? '2px solid white' : 'none',
                borderRadius: `${isFirst ? '6px' : '0'} ${isLast ? '6px' : '0'} ${isLast ? '6px' : '0'} ${isFirst ? '6px' : '0'}`
            };

            return (
              <div 
                key={index} 
                className={`stint-block ${getTyreClass(compoundName)}`}
                style={dynamicStyle}
                title={`Stint ${index+1}: ${compoundName} (${stintLength} Laps)`}
              >
                <span>{compoundName[0]}</span>
                
                {index < strategy.length - 1 && (
                    <div className="pit-label">
                       L{Math.round(lapEnd)}
                    </div>
                )}
              </div>
            );
        })}
      </div>
    </div>
  );
}

export default TyreStrategy;