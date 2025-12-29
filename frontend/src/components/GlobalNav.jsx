
import React, { useState } from 'react';
import { 
  LayoutDashboard, Activity, Trophy, Settings, 
  ChevronRight, ChevronLeft, LogOut, 
  Radio 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './GlobalNav.css';

function GlobalNav() {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleSidebar = () => setIsExpanded(!isExpanded);
  const linkClass = ({ isActive }) => isActive ? "nav-link active" : "nav-link";

  return (
    <nav className={`global-nav ${isExpanded ? 'expanded' : 'collapsed'}`}>
      
      {/* 1. HEADER */}
      <div className="nav-header">
        <div className="nav-logo-container" onClick={toggleSidebar}>
           <div className="nav-logo">
              <Radio size={24} strokeWidth={2.5} />
           </div>
        </div>
        
        <div className="logo-text">PitWall</div>
        
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* 2. OVERVIEW */}
      <div className="nav-section">
        {isExpanded && <div className="section-label">OVERVIEW</div>}
        
        <NavLink to="/" className={linkClass} title={!isExpanded ? "Dashboard" : ""}>
          <div className="nav-icon"><LayoutDashboard size={22} strokeWidth={1.5} /></div>
          <span className="nav-text">Dashboard</span>
        </NavLink>

        <NavLink to="/analysis" className={linkClass} title={!isExpanded ? "Telemetry" : ""}>
          <div className="nav-icon"><Activity size={22} strokeWidth={1.5} /></div>
          <span className="nav-text">Telemetry</span>
        </NavLink>

        <NavLink to="/standings" className={linkClass} title={!isExpanded ? "Standings" : ""}>
          <div className="nav-icon"><Trophy size={22} strokeWidth={1.5} /></div>
          <span className="nav-text">Standings</span>
        </NavLink>
      </div>

      {/* 3. SYSTEM */}
      <div className="nav-footer">
        {isExpanded && <div className="section-label">SYSTEM</div>}
        
        <NavLink to="/settings" className={linkClass} title={!isExpanded ? "Settings" : ""}>
          <div className="nav-icon"><Settings size={22} strokeWidth={1.5} /></div>
          <span className="nav-text">Settings</span>
        </NavLink>
        
        <div className="nav-link" style={{cursor: 'pointer'}} title={!isExpanded ? "Logout" : ""}>
           <div className="nav-icon"><LogOut size={22} strokeWidth={1.5} /></div>
           <span className="nav-text">Logout</span>
        </div>
      </div>

    </nav>
  );
}

export default GlobalNav;