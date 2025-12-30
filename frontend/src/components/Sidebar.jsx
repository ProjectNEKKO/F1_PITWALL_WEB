// frontend/src/components/Sidebar.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Flag } from 'lucide-react'; 
import './Sidebar.css';

function Sidebar({ races, selectedYear, onYearChange, selectedRound, onRaceSelect }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Dynamic Year Generator
  const currentYear = new Date().getFullYear();
  const startYear = 2018; 
  const years = Array.from(
    { length: currentYear - startYear + 1 }, 
    (_, i) => currentYear - i
  );

  const handleYearSelect = (year) => {
    onYearChange(year);
    setIsDropdownOpen(false);
  };

  return (
    <div className="sidebar-container">
      
      {/* HEADER & CONTROLS */}
      <div className="sidebar-header">
        <div className="year-label">SEASON ARCHIVE</div>
        
        <div className="custom-dropdown">
            <div 
              className={`dropdown-trigger ${isDropdownOpen ? 'open' : ''}`} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{selectedYear} Season</span>
              {isDropdownOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </div>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                {years.map(year => (
                  <div 
                    key={year} 
                    className={`dropdown-item ${selectedYear === year ? 'selected' : ''}`}
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                    {selectedYear === year && <div className="dot"></div>}
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* RACE LIST */}
      <div className="race-list-container">
        {races.length === 0 ? (
           <div className="empty-state">
              <div className="loader-spinner"></div>
              <span>Fetching Calendar...</span>
           </div>
        ) : (
           <ul className="race-list">
             {races
               // 👇 THIS FILTER REMOVES PRE-SEASON TESTING (Round 0)
               .filter(race => {
                   // Ensure RoundNumber exists and is greater than 0
                   // Also ensure name doesn't imply testing
                   const round = Number(race.RoundNumber);
                   return round > 0 && !race.EventName.includes("Testing");
               })
               .map((race) => {
               const isActive = selectedRound === race.RoundNumber;
               return (
                <li 
                  key={race.RoundNumber}
                  className={`race-item ${isActive ? 'active' : ''}`}
                  onClick={() => onRaceSelect(race.RoundNumber)}
                >
                  {/* Active Indicator Bar */}
                  <div className="active-bar"></div>

                    <div className="race-item-content">
                      <div className="race-meta">
                          <span className="round-badge">ROUND {race.RoundNumber}</span>
                          {isActive && <span className="active-tag">SELECTED</span>}
                      </div>
                      
                      <span className="race-name">
                        {/* Safety check for EventName */}
                        {(race.EventName || race.raceName || "Unknown GP").replace("Grand Prix", "").trim()}
                      </span>
                      
                      {/* SMART LOCATION LOGIC */}
                      <div className="race-location">
                          <MapPin size={12} style={{marginRight: 4}}/>
                          {(() => {
                              // STRATEGY 1: FastF1 / OpenF1 Style (Flat properties)
                              if (race.Location || race.Country) {
                                  return `${race.Location || ''}, ${race.Country || ''}`;
                              }
                              // STRATEGY 2: Ergast API Style (Nested Circuit object)
                              if (race.Circuit?.Location) {
                                  return `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`;
                              }
                              // STRATEGY 3: Fallback
                              return "Location TBC";
                          })()}
                      </div>
                      
                  </div>
                  
                  {/* Subtle Chevron for hover effect */}
                  <div className="race-arrow">
                    <Flag size={14} />
                  </div>
                </li>
               );
             })}
           </ul>
        )}
      </div>
    </div>
  );
}

export default Sidebar;