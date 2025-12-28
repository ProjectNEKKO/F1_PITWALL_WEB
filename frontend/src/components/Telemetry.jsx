import React from 'react';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { getTeamColor } from '../utils/f1Teams'; 
import './Telemetry.css'; 

// --- 1. MAIN WRAPPER (Calculates Colors) ---
function Telemetry({ data, deltaData, driver1, driver2, driversList }) {
  
  const resolveColor = (driverCode) => {
    if (!driversList || !driverCode) return null;
    const driverInfo = driversList.find(d => d.Driver === driverCode);
    return driverInfo ? getTeamColor(driverInfo.Team) : null;
  };

  // Fallbacks: If resolveColor returns null, use Red/Blue
  const color1 = resolveColor(driver1) || '#e10600';
  const color2 = resolveColor(driver2) || '#2b6ef9';

  return (
    <div className="telemetry-container">
      <TelemetryChart 
         data={data}
         deltaData={deltaData}
         driver1={driver1} 
         driver2={driver2} 
         color1={color1} 
         color2={color2} 
      />
    </div>
  );
}

// --- 2. CHART LOGIC (Renders Graphs) ---
function TelemetryChart({ data, deltaData, driver1, driver2, color1, color2 }) {
  if (!data) return null;

  // Gradient Logic for Delta Chart
  const getGradientOffset = () => {
    if (!deltaData || deltaData.length === 0) return 0;
    const dataMax = Math.max(...deltaData.map((i) => i.Delta));
    const dataMin = Math.min(...deltaData.map((i) => i.Delta));
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    return dataMax / (dataMax - dataMin);
  };
  const off = getGradientOffset();

  // Shared Props
  const commonGrid = <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />;
  const commonXAxis = (hideLabel = true) => (
    <XAxis 
      dataKey="Distance" 
      type="number" 
      domain={['auto', 'auto']}
      unit="m" 
      tickFormatter={(val) => (val / 1000).toFixed(1) + 'km'} 
      stroke="#999"
      fontSize={10}
      tickLine={false}
      tick={!hideLabel} 
      height={hideLabel ? 0 : 30} 
    />
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">
             DIST: {(label/1000).toFixed(2)} KM
          </div>
          {payload.map((entry, index) => (
            <div key={index} className="tooltip-item">
              <div style={{display:'flex', alignItems:'center'}}>
                 <span className="tooltip-dot" style={{ backgroundColor: entry.color }}></span>
                 <span style={{ color: '#aaa', marginRight: '5px' }}>{entry.name}:</span>
              </div>
              <span className="tooltip-value">
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
    <>
      <svg style={{ height: 0, width: 0, position: 'absolute' }}>
        <defs>
          <linearGradient id="colorDriver1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color1} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color1} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorDriver2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color2} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color2} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
            <stop offset={off} stopColor={color2} stopOpacity={1} />
            <stop offset={off} stopColor={color1} stopOpacity={1} />
          </linearGradient>
        </defs>
      </svg>

      {/* 1. TIME DELTA */}
      {deltaData && driver2 && (
        <div className="chart-section delta">
            <div className="chart-header">
               <h4 className="chart-title">Time Delta (s)</h4>
               <div className="delta-legend">
                  <span style={{color: color2}}>▲ {driver2} Faster</span> 
                  <span style={{color: '#ddd'}}>|</span>
                  <span style={{color: color1}}>▼ {driver1} Faster</span>
               </div>
            </div>
            {/* WRAPPER DIV TO FIX SQUISHING */}
            <div style={{ width: '100%', height: '100%' }}> 
                <ResponsiveContainer>
                    <LineChart data={deltaData} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                        {commonGrid}
                        {commonXAxis(true)}
                        <ReferenceLine y={0} stroke="#444" strokeDasharray="3 3" />
                        <YAxis domain={['auto', 'auto']} width={40} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#666', strokeWidth: 1 }} />
                        <Line type="monotone" dataKey="Delta" name="Delta" stroke="url(#splitColor)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}

      {/* 2. SPEED */}
      <div className="chart-section speed">
        <div className="chart-header">
           <h4 className="chart-title">Speed (km/h)</h4>
        </div>
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
            <AreaChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                {commonGrid}
                {commonXAxis(true)}
                <YAxis domain={[0, 360]} hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#666', strokeWidth: 1 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: '700', textTransform:'uppercase'}}/>
                <Area type="monotone" dataKey="Speed" name={driver1} stroke={color1} strokeWidth={2.5} fillOpacity={1} fill="url(#colorDriver1)" activeDot={{ r: 5, strokeWidth: 0 }} />
                {driver2 && <Line type="monotone" dataKey="Speed2" name={driver2} stroke={color2} strokeWidth={2.5} dot={false} strokeDasharray="4 4" />}
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 3. THROTTLE */}
      <div className="chart-section throttle">
        <div className="chart-header">
           <h4 className="chart-title">Throttle (%)</h4>
        </div>
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
            <AreaChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                {commonGrid}
                {commonXAxis(true)}
                <YAxis domain={[0, 105]} hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#666', strokeWidth: 1 }} />
                <Area type="step" dataKey="Throttle" name="Throttle" stroke={color1} strokeWidth={2} fillOpacity={1} fill="url(#colorDriver1)" />
                {driver2 && <Line type="step" dataKey="Throttle2" name="Throttle" stroke={color2} strokeWidth={2} dot={false} strokeDasharray="4 4" />}
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 4. BRAKE */}
      <div className="chart-section brake">
        <div className="chart-header">
           <h4 className="chart-title">Brake</h4>
        </div>
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
            <LineChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                {commonGrid}
                {commonXAxis(true)}
                <YAxis domain={[0, 1.2]} hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#666', strokeWidth: 1 }} />
                <Line type="step" dataKey="Brake" name="Brake" stroke={color1} strokeWidth={2} dot={false} />
                {driver2 && <Line type="step" dataKey="Brake2" name="Brake" stroke={color2} strokeWidth={2} dot={false} strokeDasharray="4 4" />}
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 5. GEAR */}
      <div className="chart-section gear">
        <div className="chart-header">
           <h4 className="chart-title">Gear</h4>
        </div>
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
            <LineChart data={data} syncId="f1Telemetry" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                {commonGrid}
                {commonXAxis(false)}
                <YAxis domain={[0, 9]} hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#666', strokeWidth: 1 }} />
                <Line type="stepAfter" dataKey="Gear" name="Gear" stroke={color1} strokeWidth={2} dot={false} />
                {driver2 && <Line type="stepAfter" dataKey="Gear2" name="Gear" stroke={color2} strokeWidth={2} dot={false} strokeDasharray="4 4" />}
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

export default Telemetry;