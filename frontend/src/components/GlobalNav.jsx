import React from 'react';
import { LayoutDashboard, Activity, Trophy, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

function GlobalNav() {
  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    marginBottom: '20px',
    color: isActive ? '#fff' : '#6c757d',
    background: isActive ? '#e10600' : 'transparent', // Red when active
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{
      width: '70px',
      height: '100vh',
      background: '#1a1a1a', // Dark theme sidebar
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '25px',
      borderRight: '1px solid #333',
      zIndex: 1000
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '40px', fontWeight: '900', color: 'white', fontSize: '18px' }}>F1</div>

      {/* Nav Links */}
      <NavLink to="/" style={linkStyle} title="Dashboard">
        <LayoutDashboard size={20} />
      </NavLink>

      <NavLink to="/analysis" style={linkStyle} title="Telemetry Tool">
        <Activity size={20} />
      </NavLink>

      <NavLink to="/standings" style={linkStyle} title="Standings">
        <Trophy size={20} />
      </NavLink>

      {/* Settings at bottom */}
      <div style={{ marginTop: 'auto', marginBottom: '20px' }}>
        <NavLink to="/settings" style={linkStyle}>
          <Settings size={20} />
        </NavLink>
      </div>
    </div>
  );
}

export default GlobalNav;