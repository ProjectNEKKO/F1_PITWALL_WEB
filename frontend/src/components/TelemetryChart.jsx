import React from 'react';
// FIX: Removed Defs, LinearGradient, Stop from this import list
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

function TelemetryChart({ data, deltaData, driver1, driver2, color1, color2 }) {
  if (!data) return null;

  const c1 = color1 || "#e10600"; 
  const c2 = color2 || "#2b6ef9"; 

  // --- 1. CALCULATE GRADIENT OFFSET ---
  const getGradientOffset = () => {
    if (!deltaData || deltaData.length === 0) return 0;
    
    const dataMax = Math.max(...deltaData.map((i) => i.Delta));
    const dataMin = Math.min(...deltaData.map((i) => i.Delta));
  
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
  
    return dataMax / (dataMax - dataMin);
  };
  
  const off = getGradientOffset();
  // -------------------------------------

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
        <div style={{ background: 'rgba(0, 0, 0, 0.9)', padding: '10px', borderRadius: '5px', color: 'white', fontSize: '12px', border: '1px solid #444', minWidth: '150px' }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', borderBottom: '1px solid #555', paddingBottom: '3px' }}>
            Dist: {(label/1000).toFixed(2)}km
          </p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }}></div>
              <span style={{ color: '#ccc' }}>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>
                 {entry.name === 'Delta' ? parseFloat(entry.value).toFixed(3) + 's' : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ background: 'white', padding: '0', borderRadius: '0 0 10px 10px' }}>
      
      {/* 0. TIME DELTA (With Split Colors!) */}
      {deltaData && driver2 && (
        <div style={{ width: '100%', height: 140, marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '20px' }}>
               <h4 style={{margin: '0 0 5px 10px', fontSize: '11px', color: '#888', textTransform: 'uppercase'}}>
                  Time Delta (s)
               </h4>
               <span style={{ fontSize: '10px', color: '#666' }}>
                  <span style={{color: c2}}>▲ {driver2} Faster</span> | <span style={{color: c1}}>▼ {driver1} Faster</span>
               </span>
            </div>
            <ResponsiveContainer>
            <LineChart data={deltaData} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                {/* SVG Definitions for the Gradient */}
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={off} stopColor={c2} stopOpacity={1} />
                    <stop offset={off} stopColor={c1} stopOpacity={1} />
                  </linearGradient>
                </defs>
                
                {commonGrid}
                {commonXAxis(true)}
                <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                <YAxis domain={['auto', 'auto']} width={40} tick={{fontSize: 10}} />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Apply the gradient */}
                <Line type="monotone" dataKey="Delta" name="Delta" stroke="url(#splitColor)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
            </ResponsiveContainer>
        </div>
      )}

      {/* 1. SPEED */}
      <div style={{ width: '100%', height: 200, marginBottom: '10px' }}>
        <h4 style={{margin: '0 0 5px 10px', fontSize: '11px', color: '#888', textTransform: 'uppercase'}}>Speed (km/h)</h4>
        <ResponsiveContainer>
          <LineChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            {commonGrid}
            {commonXAxis(true)}
            <YAxis domain={[0, 360]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle"/>
            <Line type="monotone" dataKey="Speed" name={driver1} stroke={c1} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            {driver2 && <Line type="monotone" dataKey="Speed2" name={driver2} stroke={c2} strokeWidth={2} dot={false} strokeDasharray="3 3" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. THROTTLE */}
      <div style={{ width: '100%', height: 100, marginBottom: '10px' }}>
        <h4 style={{margin: '0 0 5px 10px', fontSize: '11px', color: '#888', textTransform: 'uppercase'}}>Throttle (%)</h4>
        <ResponsiveContainer>
          <LineChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            {commonGrid}
            {commonXAxis(true)}
            <YAxis domain={[0, 105]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Line type="step" dataKey="Throttle" name="Throttle" stroke={c1} strokeWidth={1.5} dot={false} />
            {driver2 && <Line type="step" dataKey="Throttle2" name="Throttle" stroke={c2} strokeWidth={1.5} dot={false} strokeDasharray="3 3" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 3. BRAKE */}
      <div style={{ width: '100%', height: 60, marginBottom: '10px' }}>
        <h4 style={{margin: '0 0 5px 10px', fontSize: '11px', color: '#888', textTransform: 'uppercase'}}>Brake</h4>
        <ResponsiveContainer>
          <LineChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            {commonGrid}
            {commonXAxis(true)}
            <YAxis domain={[0, 1.2]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Line type="step" dataKey="Brake" name="Brake" stroke={c1} strokeWidth={2} dot={false} />
            {driver2 && <Line type="step" dataKey="Brake2" name="Brake" stroke={c2} strokeWidth={2} dot={false} strokeDasharray="3 3" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 4. GEAR */}
      <div style={{ width: '100%', height: 100 }}>
        <h4 style={{margin: '0 0 5px 10px', fontSize: '11px', color: '#888', textTransform: 'uppercase'}}>Gear (1-8)</h4>
        <ResponsiveContainer>
          <LineChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            {commonGrid}
            {commonXAxis(false)}
            <YAxis domain={[0, 9]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Line type="stepAfter" dataKey="Gear" name="Gear" stroke={c1} strokeWidth={1.5} dot={false} />
            {driver2 && <Line type="stepAfter" dataKey="Gear2" name="Gear" stroke={c2} strokeWidth={1.5} dot={false} strokeDasharray="3 3" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default TelemetryChart;