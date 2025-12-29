import React from 'react';
import { getTeamColor } from '../utils/f1Teams';
import './ResultsTable.css'; 

function ResultsTable({ results, sessionType, selectedDriver, onDriverClick }) {
  if (!results || results.length === 0) {
      return <div style={{padding: '20px', textAlign: 'center', color: '#888'}}>No results data available.</div>;
  }

  // Helper: Check if this is ANY kind of Qualifying (Standard Q or Sprint SQ)
  const isQualifying = sessionType === 'Q' || sessionType === 'SQ';

  const getRaceTime = (item) => {
    return item.Time || item.time || item.Status || item.status || "+1 Lap";
  };

  return (
    <div className="table-container">
      <table className="results-table">
        <thead>
          <tr>
            <th style={{width: '50px', textAlign: 'center'}}>Pos</th>
            <th style={{width: '50px', textAlign: 'center'}}>No</th>
            <th>Driver</th>
            <th>Team</th>
            
            {/* CONDITIONAL HEADERS: Show 3 columns for Q, else split Time/Laps/Pts for Race */}
            {isQualifying ? (
                <>
                    <th>Q1</th>
                    <th>Q2</th>
                    <th>Q3</th>
                    <th style={{textAlign: 'right'}}>Laps</th>
                </>
            ) : (
                <>
                    <th>Time/Status</th>
                    <th style={{width: '60px', textAlign: 'center'}}>Laps</th>
                    <th style={{width: '60px', textAlign: 'center'}}>Pts</th>
                </>
            )}
          </tr>
        </thead>
        <tbody>
          {results.map((item, index) => {
            const pos = item.Position || item.position || index + 1;
            const num = item.DriverNumber || item.driver_number || "";
            const name = item.FullName || item.full_name || item.BroadcastName || item.Driver || item.Abbreviation || "Unknown"; 
            const team = item.TeamName || item.team_name || item.Team || "Unknown Team";
            const points = item.Points || item.points || 0;
            const laps = item.Laps || item.laps || 0;
            
            const driverId = item.Driver || item.Abbreviation || item.code || "UNK";

            return (
                <tr 
                    key={index} 
                    onClick={() => onDriverClick && onDriverClick(driverId)}
                    className={selectedDriver === driverId ? 'active-row' : ''}
                >
                <td style={{textAlign: 'center'}}>{pos}</td>
                <td style={{textAlign: 'center', color: getTeamColor(team), fontWeight: 'bold'}}>{num}</td>
                
                <td className="driver-cell">{String(name).toUpperCase()}</td>
                
                <td>
                    <span className="team-dot" style={{backgroundColor: getTeamColor(team)}}></span>
                    {team}
                </td>

                {/* CONDITIONAL DATA CELLS */}
                {isQualifying ? (
                    <>
                        <td style={{fontFamily: 'monospace', fontSize: '12px', color: '#666'}}>
                            {item.Q1 || item.q1 || "--"}
                        </td>
                        <td style={{fontFamily: 'monospace', fontSize: '12px', color: '#666'}}>
                            {item.Q2 || item.q2 || "--"}
                        </td>
                        <td style={{fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold', color: '#333'}}>
                            {item.Q3 || item.q3 || "--"}
                        </td>
                        <td style={{textAlign: 'right', fontWeight: 'bold'}}>
                            {laps}
                        </td>
                    </>
                ) : (
                    <>
                        {/* RACE COLUMNS: Time | Laps | Points */}
                        <td style={{fontFamily: 'monospace', fontSize: '12px'}}>
                            {getRaceTime(item)}
                        </td>
                        <td style={{textAlign: 'center', color: '#666'}}>
                            {laps}
                        </td>
                        <td style={{textAlign: 'center', fontWeight: 'bold'}}>
                            {points}
                        </td>
                    </>
                )}
                </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable;