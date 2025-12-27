import React from 'react';

function Sidebar({ races, selectedYear, onYearChange, selectedRound, onRaceSelect }) {
  const years = Array.from({ length: 8 }, (_, i) => 2025 - i);

  return (
    <div style={{ 
      width: '220px', // <--- Much slimmer
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      borderRight: '1px solid #e0e0e0', 
      background: '#f8f9fa' 
    }}>
      
      {/* YEAR SELECTOR (Fixed at top) */}
      <div style={{ padding: '15px', borderBottom: '1px solid #eee', background: 'white' }}>
        <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', letterSpacing: '1px' }}>SEASON</label>
        <select 
          value={selectedYear} 
          onChange={(e) => onYearChange(Number(e.target.value))}
          style={{ width: '100%', padding: '6px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* RACE LIST (Scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {races.map((race) => (
          <div 
            key={race.RoundNumber} 
            onClick={() => onRaceSelect(race.RoundNumber)}
            style={{ 
              padding: '10px 15px', 
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              background: selectedRound === race.RoundNumber ? '#e10600' : 'transparent',
              color: selectedRound === race.RoundNumber ? 'white' : '#333',
              fontSize: '13px',
              transition: 'background 0.2s'
            }}
          >
            <div style={{ opacity: 0.7, fontSize: '10px', marginBottom: '2px' }}>R{race.RoundNumber}</div>
            <div style={{ fontWeight: 'bold' }}>{race.EventName.replace(" Grand Prix", "")}</div> {/* Shorten Name */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;