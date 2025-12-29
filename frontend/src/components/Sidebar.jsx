import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'; 
import './Sidebar.css';

function Sidebar({ races, selectedYear, onYearChange, selectedRound, onRaceSelect }) {
  
  // State to control the custom dropdown
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
    setIsDropdownOpen(false); // Close menu after selection
  };

  return (
    <div className="sidebar-container">
      
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="year-label">SEASON ARCHIVE</div>
        
        {/* --- CUSTOM DROPDOWN COMPONENT --- */}
        <div className="custom-dropdown">
            
            {/* The "Button" you click */}
            <div 
              className={`dropdown-trigger ${isDropdownOpen ? 'open' : ''}`} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{selectedYear} Season</span>
              {isDropdownOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </div>

            {/* The "List" that pops up */}
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
        {/* -------------------------------- */}

      </div>

      {/* RACE LIST (Kept the same, it was good) */}
      <div className="race-list-container">
        {races.length === 0 ? (
           <div className="empty-state">Loading Calendar...</div>
        ) : (
           <ul className="race-list">
             {races.map((race) => (
               <li 
                 key={race.RoundNumber}
                 className={`race-item ${selectedRound === race.RoundNumber ? 'active' : ''}`}
                 onClick={() => onRaceSelect(race.RoundNumber)}
               >
                 <div className="race-item-content">
                    <span className="round-badge">Round {race.RoundNumber}</span>
                    <span className="race-name">
                        {race.EventName.replace("Grand Prix", "").trim()}
                    </span>
                 </div>
               </li>
             ))}
           </ul>
        )}
      </div>
    </div>
  );
}

export default Sidebar;