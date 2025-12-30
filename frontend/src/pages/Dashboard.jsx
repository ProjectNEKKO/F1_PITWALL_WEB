import React, { useEffect, useState } from 'react';
// 👇 NEW IMPORT: getDriverStandings
import { getSchedule, getDriverStandings } from '../services/api'; 
import { Calendar, MapPin, Flag, ArrowRight, Clock, Trophy, PlayCircle, Activity, Server, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

import { TRACK_MAPS } from '../utils/trackImages';

function Dashboard() {
  const [nextRace, setNextRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [raceStatus, setRaceStatus] = useState('UPCOMING'); 
  const [seasonDisplay, setSeasonDisplay] = useState(new Date().getFullYear());
  
  // 👇 NEW STATE: Top 5 Drivers
  const [topDrivers, setTopDrivers] = useState([]);

  // ... (Your existing Date Logic - UNCHANGED) ...
  const getEventDate = (race) => {
    if (!race) return null;
    let dateStr = "";
    if (race.EventDate) {
        dateStr = race.EventDate.includes('T') ? race.EventDate : `${race.EventDate}T08:00:00`;
    } else if (race.RaceDate) {
        dateStr = `${race.RaceDate}T${race.RaceTime || '14:00:00'}`;
    }
    if (!dateStr) return null;
    if (!dateStr.endsWith('Z')) dateStr += 'Z';
    return new Date(dateStr);
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    // 1. SCHEDULE FETCH (UNCHANGED)
    getSchedule(currentYear).then(data => {
      const now = new Date();
      let upcoming = null;

      if (data && data.races) {
         upcoming = data.races.find(r => {
             const d = getEventDate(r);
             return d && (d.getTime() + 7200000) > now.getTime(); 
        });
      }

      if (upcoming) {
          setNextRace(upcoming);
          setSeasonDisplay(currentYear);
          setRaceStatus('UPCOMING');
      } else {
           getSchedule(currentYear + 1).then(nextData => {
              if (nextData && nextData.races && nextData.races.length > 0) {
                  setNextRace(nextData.races[0]);
                  setSeasonDisplay(currentYear + 1);
              }
           });
      }
      setLoading(false);
    });

    // 👇 2. NEW: FETCH TOP 5 DRIVERS
    getDriverStandings('current').then(data => {
        if (data && data.length > 0) {
            setTopDrivers(data.slice(0, 5)); 
        }
    });

  }, []);

  // ... (Countdown Logic - UNCHANGED) ...
  useEffect(() => {
    if (!nextRace || raceStatus === 'COMPLETED') return;
    const interval = setInterval(() => {
      const targetDate = getEventDate(nextRace);
      if (!targetDate) return;
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60),
        });
        setRaceStatus('UPCOMING');
      } else if (diff > -7200000) { 
        setRaceStatus('LIVE');
      } else {
        setRaceStatus('COMPLETED');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRace, raceStatus]);

  const formatDate = () => {
      const d = getEventDate(nextRace);
      if (!d || isNaN(d.getTime())) return "TBA";
      return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getBadgeText = () => {
      if (raceStatus === 'LIVE') return "🔴 LIVE NOW";
      if (seasonDisplay > new Date().getFullYear()) return `${seasonDisplay} SEASON OPENER`;
      if (raceStatus === 'UPCOMING') return "UPCOMING GRAND PRIX";
      return "SEASON FINALE";
  };

  const currentTrackImage = nextRace && TRACK_MAPS[nextRace.Location] 
    ? TRACK_MAPS[nextRace.Location] 
    : null;

  if (loading) return <div className="dashboard-loading">Loading Mission Control...</div>;

  return (
    <div className="dashboard-container">
      
      {/* ========================================= */}
      {/* 🛑 HERO CARD SECTION (UNTOUCHED) 🛑       */}
      {/* ========================================= */}
      <div className="hero-card">
        <div className="hero-content">
          <div className={`hero-badge ${raceStatus === 'LIVE' ? 'live-badge' : ''}`}>
              {getBadgeText()}
          </div>
          <h1 className="hero-title">
              {nextRace?.EventName?.replace("Grand Prix", "").toUpperCase()}
          </h1>
          <div className="hero-details">
            <div className="detail-item"><Calendar size={18} /> {formatDate()}</div>
            <div className="detail-item"><MapPin size={18} /> {nextRace?.Country}</div>
            {!nextRace?.EventName?.includes('Testing') && (
                 <div className="detail-item"><Trophy size={18} /> Round {nextRace?.RoundNumber}</div>
            )}
          </div>

          {raceStatus === 'UPCOMING' && (
             <div className="countdown-box">
                <div className="count-unit"><span className="count-val">{countdown.days}</span><span className="count-label">DAYS</span></div>
                <div className="count-sep">:</div>
                <div className="count-unit"><span className="count-val">{countdown.hours}</span><span className="count-label">HRS</span></div>
                <div className="count-sep">:</div>
                <div className="count-unit"><span className="count-val">{countdown.mins}</span><span className="count-label">MIN</span></div>
                <div className="count-sep">:</div>
                <div className="count-unit"><span className="count-val">{countdown.secs}</span><span className="count-label">SEC</span></div>
             </div>
          )}

          {raceStatus === 'LIVE' && (
             <div className="countdown-box live-box">
                 <PlayCircle size={24} style={{marginRight: 10}}/> 
                 <span style={{fontWeight: 700, fontSize: '20px'}}>SESSION IN PROGRESS</span>
             </div>
          )}

          {raceStatus === 'COMPLETED' && (
             <div className="countdown-box" style={{background: 'rgba(255,255,255,0.2)'}}>
                 <Flag size={20} style={{marginRight: 10}}/> 
                 <span style={{fontWeight: 700, fontSize: '18px'}}>RACE COMPLETED</span>
             </div>
          )}
        </div>
        
        <div className="track-stats-right">
            <div className="stat-row"><span className="stat-label">LENGTH</span> 5.412 KM</div>
            <div className="stat-row"><span className="stat-label">TURNS</span> 15</div>
            <div className="stat-row"><span className="stat-label">DRS</span> 3 ZONES</div>
        </div>

        {currentTrackImage && (
          <div className="track-overlay" style={{ backgroundImage: `url(${currentTrackImage})` }}></div>
        )}
      </div>
      {/* ========================================= */}
      {/* 🛑 END HERO CARD SECTION 🛑               */}
      {/* ========================================= */}


      {/* 👇 NEW: UPDATED DASHBOARD GRID */}
      <div className="dashboard-grid">
        
        {/* WIDGET 1: TELEMETRY (Enhanced Link) */}
        <Link to="/analysis" className="action-card telemetry-card">
          <div className="card-header-row">
             <div className="card-icon-box blue"><Activity size={24} color="white" /></div>
             <div className="card-arrow"><ArrowRight size={20}/></div>
          </div>
          <div className="card-content">
            <h3>Telemetry Hub</h3>
            <p>Access sector times, speed traces, and tire degradation data.</p>
            <div className="mini-tag">Analyzing {seasonDisplay} Data</div>
          </div>
        </Link>

        {/* WIDGET 2: LIVE LEADERBOARD (Replaces the generic Championship button) */}
        <div className="action-card leaderboard-widget">
          <div className="widget-header">
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <Trophy size={20} color="#e10600" />
                  
                  {/* 👇 FIXED LOGIC: */}
                  {/* If we are in Pre-Season (Round 0) or the very first race (Round 1), 
                      the API returns LAST YEAR'S standings. So we subtract 1. */}
                  <h3>
                    {nextRace && nextRace.RoundNumber <= 1 
                        ? seasonDisplay - 1 
                        : seasonDisplay
                    } STANDINGS
                  </h3>
              </div>
              <Link to="/standings" className="view-all-link">View All <ArrowRight size={14}/></Link>
          </div>
          
          <div className="mini-table">
              {topDrivers.map((d, i) => {
                  let rankClass = '';
                  if (i === 0) rankClass = 'top-1';
                  else if (i === 1) rankClass = 'top-2';
                  else if (i === 2) rankClass = 'top-3';

                  return (
                      <div key={d.Driver.driverId} className={`mini-row ${rankClass}`}>
                          <span className="mini-pos">{i+1}</span>
                          <span className="mini-name">{d.Driver.code}</span>
                          <span className="mini-team">{d.Constructors[0].name}</span>
                          <span className="mini-pts">{d.points} <span className="pts-label">PTS</span></span>
                      </div>
                  );
              })}
              {topDrivers.length === 0 && <div className="mini-empty">No Standings Data Yet</div>}
          </div>
        </div>

      </div>

      {/* 👇 NEW: SYSTEM STATUS FOOTER */}
      <div className="system-footer">
          <div className="sys-item">
              <Server size={12} className="sys-icon success"/> 
              <span>SYSTEM: <strong>ONLINE</strong></span>
          </div>
          <div className="sys-item">
              <Wifi size={12} className="sys-icon"/> 
              <span>LATENCY: <strong>24ms</strong></span>
          </div>
          <div className="sys-item">
              <Activity size={12} className="sys-icon"/> 
              <span>DATA SOURCE: <strong>ERGAST / OPENF1</strong></span>
          </div>
          <div className="sys-item right">
              <span>V2.4.0 (STABLE)</span>
          </div>
      </div>

    </div>
  );
}

export default Dashboard;