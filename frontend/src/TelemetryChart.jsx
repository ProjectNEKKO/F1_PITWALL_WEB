import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function TelemetryChart({ data, driver1, driver2 }) {
  if (!data) return null;

  // Common settings for all charts
  const commonXAxis = (
    <XAxis 
      dataKey="Distance" 
      type="number" 
      domain={['auto', 'auto']}
      unit="m" 
      tickFormatter={(val) => (val / 1000).toFixed(1) + 'km'} 
      stroke="#666"
      fontSize={12}
      tick={false} // Hide numbers on top charts to save space
    />
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#333', padding: '10px', borderRadius: '5px', color: 'white', fontSize: '12px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Dist: {(label/1000).toFixed(2)}km</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>
          Telemetry: <span style={{color: '#e10600'}}>{driver1}</span> 
          {driver2 && <span style={{color: '#0057e7'}}> vs {driver2}</span>}
        </h3>
      </div>

      {/* 1. SPEED CHART (Big) */}
      <div style={{ width: '100%', height: 250 }}>
        <h4 style={{margin: '0 0 5px 10px', fontSize: '12px', color: '#666'}}>SPEED (km/h)</h4>
        <ResponsiveContainer>
          <LineChart data={data} syncId="f1Telemetry">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            {commonXAxis}
            <YAxis domain={[0, 360]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="plainline"/>
            
            <Line type="monotone" dataKey="Speed" name={driver1} stroke="#e10600" strokeWidth={2} dot={false} />
            {driver2 && <Line type="monotone" dataKey="Speed2" name={driver2} stroke="#0057e7" strokeWidth={2} dot={false} strokeDasharray="4 4" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. THROTTLE CHART (Medium) */}
      <div style={{ width: '100%', height: 120, marginTop: '-10px' }}>
        <h4 style={{margin: '0 0 5px 10px', fontSize: '12px', color: '#666'}}>THROTTLE (%)</h4>
        <ResponsiveContainer>
          <LineChart data={data} syncId="f1Telemetry">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            {commonXAxis}
            <YAxis domain={[0, 100]} hide />
            <Tooltip content={<CustomTooltip />} />
            
            <Line type="step" dataKey="Throttle" name={`${driver1} Throttle`} stroke="#e10600" strokeWidth={2} dot={false} />
            {driver2 && <Line type="step" dataKey="Throttle2" name={`${driver2} Throttle`} stroke="#0057e7" strokeWidth={2} dot={false} strokeDasharray="4 4" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3. BRAKE CHART (Small) */}
      <div style={{ width: '100%', height: 80, marginTop: '-10px' }}>
        <h4 style={{margin: '0 0 5px 10px', fontSize: '12px', color: '#666'}}>BRAKE (On/Off)</h4>
        <ResponsiveContainer>
          <AreaChart data={data} syncId="f1Telemetry">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            
            {/* Show Axis labels only on the bottom chart */}
            <XAxis 
              dataKey="Distance" 
              type="number" 
              domain={['auto', 'auto']}
              unit="m" 
              tickFormatter={(val) => (val / 1000).toFixed(1) + 'km'} 
              stroke="#666"
              fontSize={12}
            />
            
            <YAxis domain={[0, 1]} hide />
            <Tooltip content={<CustomTooltip />} />
            
            <Area type="step" dataKey="Brake" name={`${driver1} Brake`} stroke="#e10600" fill="#e10600" fillOpacity={0.3} />
            {driver2 && <Area type="step" dataKey="Brake2" name={`${driver2} Brake`} stroke="#0057e7" fill="#0057e7" fillOpacity={0.3} />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TelemetryChart;