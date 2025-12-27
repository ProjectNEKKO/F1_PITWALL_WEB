import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function TelemetryChart({ data, driver1, driver2 }) {
  if (!data) return null;

  const colorDriver1 = "#e10600";
  const colorDriver2 = "#2b6ef9"; 

  const commonGrid = <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />;
  const commonXAxis = (hideLabel = true) => (
    <XAxis 
      dataKey="Distance" 
      type="number" 
      domain={['auto', 'auto']}
      unit="m" 
      tickFormatter={(val) => (val / 1000).toFixed(1) + 'km'} 
      stroke="#999"
      fontSize={12}
      tick={!hideLabel} 
      height={hideLabel ? 0 : 30} 
    />
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(0, 0, 0, 0.8)', padding: '10px', borderRadius: '5px', color: 'white', fontSize: '12px', border: '1px solid #444' }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', borderBottom: '1px solid #555', paddingBottom: '3px' }}>
            Dist: {(label/1000).toFixed(2)}km
          </p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }}></div>
              <span style={{ color: '#ccc' }}>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '0 0 10px 10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      
      {/* 1. SPEED */}
      <div style={{ width: '100%', height: 200, marginBottom: '10px' }}>
        <h4 style={{margin: '0 0 0 10px', fontSize: '11px', color: '#888', textTransform: 'uppercase'}}>Speed (km/h)</h4>
        <ResponsiveContainer>
          <LineChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            {commonGrid}
            {commonXAxis(true)}
            <YAxis domain={[0, 360]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle"/>
            <Line type="monotone" dataKey="Speed" name={driver1} stroke={colorDriver1} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            {driver2 && <Line type="monotone" dataKey="Speed2" name={driver2} stroke={colorDriver2} strokeWidth={2} dot={false} strokeDasharray="3 3" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. THROTTLE */}
      <div style={{ width: '100%', height: 100, marginBottom: '10px' }}>
        <h4 style={{margin: '0 0 0 10px', fontSize: '11px', color: '#888', textTransform: 'uppercase'}}>Throttle (%)</h4>
        <ResponsiveContainer>
          <LineChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            {commonGrid}
            {commonXAxis(true)}
            <YAxis domain={[0, 105]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Line type="step" dataKey="Throttle" name="Throttle" stroke={colorDriver1} strokeWidth={1.5} dot={false} />
            {driver2 && <Line type="step" dataKey="Throttle2" name="Throttle" stroke={colorDriver2} strokeWidth={1.5} dot={false} strokeDasharray="3 3" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3. BRAKE */}
      <div style={{ width: '100%', height: 60, marginBottom: '10px' }}>
        <h4 style={{margin: '0 0 0 10px', fontSize: '11px', color: '#888', textTransform: 'uppercase'}}>Brake</h4>
        <ResponsiveContainer>
          <LineChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            {commonGrid}
            {commonXAxis(true)}
            <YAxis domain={[0, 1.2]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Line type="step" dataKey="Brake" name="Brake" stroke={colorDriver1} strokeWidth={2} dot={false} />
            {driver2 && <Line type="step" dataKey="Brake2" name="Brake" stroke={colorDriver2} strokeWidth={2} dot={false} strokeDasharray="3 3" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 4. GEAR (NEW!) */}
      <div style={{ width: '100%', height: 100 }}>
        <h4 style={{margin: '0 0 0 10px', fontSize: '11px', color: '#888', textTransform: 'uppercase'}}>Gear (1-8)</h4>
        <ResponsiveContainer>
          <LineChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            {commonGrid}
            {commonXAxis(false)}
            {/* Domain 0-9 to keep 8 gears visible */}
            <YAxis domain={[0, 9]} hide />
            <Tooltip content={<CustomTooltip />} />
            {/* Use type="stepAfter" for sharp gear changes */}
            <Line type="stepAfter" dataKey="Gear" name="Gear" stroke={colorDriver1} strokeWidth={1.5} dot={false} />
            {driver2 && <Line type="stepAfter" dataKey="Gear2" name="Gear" stroke={colorDriver2} strokeWidth={1.5} dot={false} strokeDasharray="3 3" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default TelemetryChart;