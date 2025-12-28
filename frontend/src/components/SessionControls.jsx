import React from 'react';
import './SessionControls.css'; 

function SessionControls({ sessionType, onSessionChange, raceData }) {
  
  // 1. Default: Standard Weekend (FP1, FP2, FP3, Quali, Race)
  let sessions = ['FP1', 'FP2', 'FP3', 'Q', 'R'];

  // 2. Logic: Check for ANY type of sprint tag
  // We added 'sprint_qualifying' because that is what FastF1 is sending for 2024
  if (raceData && (
      raceData.EventFormat === 'sprint' || 
      raceData.EventFormat === 'sprint_shootout' ||
      raceData.EventFormat === 'sprint_qualifying' // <--- ADDED THIS!
  )) {
      // Sprint Format: FP1 -> Sprint Quali (SQ) -> Sprint (S) -> Quali (Q) -> Race (R)
      sessions = ['FP1', 'SQ', 'S', 'Q', 'R']; 
  }

  return (
    <div className="controls-container">
      {sessions.map((s) => (
        <button
          key={s}
          className={`session-btn ${sessionType === s ? 'active' : ''} ${s === 'R' ? 'race-btn' : ''}`}
          onClick={() => onSessionChange(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export default SessionControls;