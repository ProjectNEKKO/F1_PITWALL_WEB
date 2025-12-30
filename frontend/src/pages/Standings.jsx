import React, { useEffect, useState, useRef } from 'react';
import { getDriverStandings, getConstructorStandings } from '../services/api';
import { ChevronLeft, ChevronDown, Check } from 'lucide-react'; // Added Check icon
import { Link } from 'react-router-dom';
import './Standings.css';

function Standings() {
  const [view, setView] = useState('drivers'); 
  const [year, setYear] = useState(new Date().getFullYear()); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 👇 NEW: State for the custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
              setIsDropdownOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: currentYear - 2019}, (_, i) => currentYear - i);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
        let result;
        if (view === 'drivers') {
            result = await getDriverStandings(year); 
        } else {
            result = await getConstructorStandings(year);
        }
        setData(result || []);
        setLoading(false);
    };
    fetchData();
  }, [view, year]);

  const getTeamColor = (constructorId) => {
      const colors = {
          red_bull: '#3671C6', ferrari: '#F91536', mercedes: '#6CD3BF',
          mclaren: '#F58020', aston_martin: '#229971', alpine: '#0093CC',
          williams: '#64C4FF', rb: '#6692FF', sauber: '#52E252', haas: '#B6BABD'
      };
      return colors[constructorId] || '#999';
  };

  if (loading) return <div className="standings-loading">Updating Leaderboard...</div>;

  const podium = data.slice(0, 3);
  const restField = data.slice(3);

  return (
    <div className="standings-container">
        {/* HEADER */}
        <div className="standings-header">
            <div className="header-left">
                <Link to="/" className="back-btn"><ChevronLeft size={24}/></Link>
                <h1>Championship Standings</h1>
            </div>
            
            <div className="header-controls">
                
                {/* 👇 CUSTOM DROPDOWN COMPONENT */}
                <div className="custom-dropdown" ref={dropdownRef}>
                    <button 
                        className={`dropdown-trigger ${isDropdownOpen ? 'open' : ''}`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <span>{year} Season</span>
                        <ChevronDown size={16} className={`arrow ${isDropdownOpen ? 'rotate' : ''}`}/>
                    </button>

                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            {years.map(y => (
                                <div 
                                    key={y} 
                                    className={`dropdown-item ${y == year ? 'selected' : ''}`}
                                    onClick={() => { setYear(y); setIsDropdownOpen(false); }}
                                >
                                    {y}
                                    {y == year && <Check size={14} color="#e10600"/>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* 👆 END CUSTOM DROPDOWN */}

                <div className="toggle-box">
                    <button 
                        className={`toggle-btn ${view === 'drivers' ? 'active' : ''}`}
                        onClick={() => setView('drivers')}
                    >
                        Drivers
                    </button>
                    <button 
                        className={`toggle-btn ${view === 'constructors' ? 'active' : ''}`}
                        onClick={() => setView('constructors')}
                    >
                        Constructors
                    </button>
                </div>
            </div>
        </div>

        {/* ... (Rest of your JSX remains exactly the same) ... */}
        {data.length === 0 ? (
             <div className="no-data-message">
                <h2>No Data Found for {year}</h2>
                <button className="retry-btn" onClick={() => setYear(year - 1)}>
                    Load {year - 1} Season
                </button>
            </div>
        ) : (
            <>
                <div className="podium-grid">
                    {podium.map((item, index) => {
                        const teamId = view === 'drivers' ? item.Constructors[0]?.constructorId : item.Constructor.constructorId;
                        const name = view === 'drivers' ? `${item.Driver.givenName} ${item.Driver.familyName}` : item.Constructor.name;
                        const points = item.points;
                        const position = index + 1;

                        return (
                            <div key={index} className={`podium-card rank-${position}`}>
                                <div className="rank-badge">{position}</div>
                                <div className="podium-info">
                                    <h3 className="podium-name">{name}</h3>
                                    <p className="podium-team" style={{color: getTeamColor(teamId)}}>
                                        {view === 'drivers' ? item.Constructors[0].name : ''}
                                    </p>
                                    <div className="podium-points">{points} <span>PTS</span></div>
                                </div>
                                <div className="team-accent" style={{background: getTeamColor(teamId)}}></div>
                            </div>
                        );
                    })}
                </div>

                <div className="list-grid">
                    {restField.map((item) => {
                        const teamId = view === 'drivers' ? item.Constructors[0]?.constructorId : item.Constructor.constructorId;
                        const name = view === 'drivers' ? `${item.Driver.givenName} ${item.Driver.familyName}` : item.Constructor.name;
                        return (
                            <div key={item.position} className="list-row">
                                <div className="list-rank">{item.position}</div>
                                <div className="list-color" style={{background: getTeamColor(teamId)}}></div>
                                <div className="list-name">
                                    {name}
                                    {view === 'drivers' && <span className="list-team-label">{item.Constructors[0].name}</span>}
                                </div>
                                <div className="list-points">{item.points} PTS</div>
                            </div>
                        );
                    })}
                </div>
            </>
        )}
    </div>
  );
}

export default Standings;