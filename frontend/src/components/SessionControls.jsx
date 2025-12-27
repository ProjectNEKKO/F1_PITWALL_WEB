import React from 'react';

function SessionControls({ sessionType, onSessionChange }) {
  const sessions = ['FP1', 'FP2', 'FP3', 'Q', 'S', 'R'];

  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      {sessions.map((type) => (
        <button 
          key={type}
          onClick={() => onSessionChange(type)}
          style={{
            padding: '6px 12px',
            cursor: 'pointer',
            background: sessionType === type ? '#e10600' : '#ddd',
            color: sessionType === type ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          {type}
        </button>
      ))}
    </div>
  );
}

export default SessionControls;