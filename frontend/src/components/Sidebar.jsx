import React from 'react';
import './Sidebar.css'; // <--- Import CSS

function Sidebar({ races, selectedYear, onYearChange, selectedRound, onRaceSelect }) {
  return (
    <div className="sidebar-container">
      {/* Header / Year Selector */}
      <div className="sidebar-header">
        <div className="year-label">Season</div>
        <select 
          className="year-select"
          value={selectedYear} 
          onChange={(e) => onYearChange(e.target.value)}
        >
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
      </div>

      {/* Race List */}
      <ul className="race-list">
        {races.map((race) => (
          <li 
            key={race.RoundNumber}
            className={`race-item ${selectedRound === race.RoundNumber ? 'active' : ''}`}
            onClick={() => onRaceSelect(race.RoundNumber)}
          >
            <span className="round-badge">R{race.RoundNumber}</span>
            <span className="race-name">
                {race.EventName.replace("Grand Prix", "").trim()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;