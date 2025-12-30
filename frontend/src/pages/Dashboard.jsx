import React, { useEffect, useState } from 'react';
import { getSchedule } from '../services/api';
import { Calendar, MapPin, Flag, ArrowRight, Clock, Trophy, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

import { TRACK_MAPS } from '../utils/trackImages';

function Dashboard() {
  const [nextRace, setNextRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [raceStatus, setRaceStatus] = useState('UPCOMING'); 
  const [seasonDisplay, setSeasonDisplay] = useState(new Date().getFullYear());

  // 1. SMART DATE PARSER
  const getEventDate = (race) => {
    if (!race) return null;
    
    let dateStr = "";
    // Format A: 2026 Data (Single ISO String)
    if (race.EventDate) {
        dateStr = race.EventDate.includes('T') ? race.EventDate : `${race.EventDate}T08:00:00`;
    } 
    // Format B: 2025 Data (Split Date/Time)
    else if (race.RaceDate) {
        dateStr = `${race.RaceDate}T${race.RaceTime || '14:00:00'}`;
    }

    if (!dateStr) return null;

    // Force "Z" (UTC) if missing to ensure global consistency
    if (!dateStr.endsWith('Z')) {
        dateStr += 'Z';
    }

    return new Date(dateStr);
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    // 1. Check Current Season
    getSchedule(currentYear).then(data => {
      const now = new Date();
      let upcoming = null;

      if (data && data.races) {
         upcoming = data.races.find(r => {
             const d = getEventDate(r);
             // Add 2 hours buffer so it doesn't disappear immediately
             return d && (d.getTime() + 7200000) > now.getTime(); 
        });
      }

      if (upcoming) {
          setNextRace(upcoming);
          setSeasonDisplay(currentYear);
          setRaceStatus('UPCOMING');
          setLoading(false);
      } 
      else {
          // 2. Check Next Season (2026)
          getSchedule(currentYear + 1).then(nextData => {
              if (nextData && nextData.races && nextData.races.length > 0) {
                  setNextRace(nextData.races[0]);
                  setSeasonDisplay(currentYear + 1);
                  setRaceStatus('UPCOMING'); 
              } else {
                  if (data && data.races) {
                      setNextRace(data.races[data.races.length - 1]);
                      setRaceStatus('COMPLETED');
                  }
              }
              setLoading(false);
          });
      }
    });
  }, []);

  // 2. COUNTDOWN LOOP
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
      
      {/* HERO SECTION */}
      <div className="hero-card">
        
        {/* LEFT SIDE CONTENT */}
        <div className="hero-content">
          <div className={`hero-badge ${raceStatus === 'LIVE' ? 'live-badge' : ''}`}>
             {getBadgeText()}
          </div>
          
          <h1 className="hero-title">
              {nextRace?.EventName?.replace("Grand Prix", "").toUpperCase()}
          </h1>
          
          <div className="hero-details">
            <div className="detail-item">
              <Calendar size={18} /> {formatDate()}
            </div>
            <div className="detail-item">
              <MapPin size={18} /> {nextRace?.Country}
            </div>
            {!nextRace?.EventName?.includes('Testing') && (
                 <div className="detail-item"><Trophy size={18} /> Round {nextRace?.RoundNumber}</div>
            )}
          </div>

          {/* DYNAMIC COUNTDOWN / STATUS */}
          {raceStatus === 'UPCOMING' && (
             <div className="countdown-box">
                <div className="count-unit">
                    <span className="count-val">{countdown.days}</span>
                    <span className="count-label">DAYS</span>
                </div>
                <div className="count-sep">:</div>
                <div className="count-unit">
                    <span className="count-val">{countdown.hours}</span>
                    <span className="count-label">HRS</span>
                </div>
                <div className="count-sep">:</div>
                <div className="count-unit">
                    <span className="count-val">{countdown.mins}</span>
                    <span className="count-label">MIN</span>
                </div>
                <div className="count-sep">:</div>
                <div className="count-unit">
                    <span className="count-val">{countdown.secs}</span>
                    <span className="count-label">SEC</span>
                </div>
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
        
        {/* RIGHT SIDE STATS (New Placement) */}
        <div className="track-stats-right">
            <div className="stat-row">
               <span className="stat-label">LENGTH</span> 5.412 KM
            </div>
            <div className="stat-row">
               <span className="stat-label">TURNS</span> 15
            </div>
            <div className="stat-row">
               <span className="stat-label">DRS</span> 3 ZONES
            </div>
        </div>

        {/* BACKGROUND TRACK OVERLAY */}
        {currentTrackImage && (
          <div 
              className="track-overlay" 
              style={{ backgroundImage: `url(${currentTrackImage})` }}
          ></div>
        )}

      </div>

      {/* QUICK ACTIONS */}
      <div className="dashboard-grid">
        <Link to="/analysis" className="action-card">
          <div className="card-icon-box blue"><Clock size={24} color="white" /></div>
          <div className="card-info">
            <h3>Telemetry Analysis</h3>
            <p>Compare driver traces and sector times.</p>
          </div>
          <div className="card-arrow"><ArrowRight size={20}/></div>
        </Link>

        <Link to="/standings" className="action-card">
          <div className="card-icon-box red"><Trophy size={24} color="white" /></div>
          <div className="card-info">
            <h3>Championship</h3>
            <p>Current driver and constructor standings.</p>
          </div>
          <div className="card-arrow"><ArrowRight size={20}/></div>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;