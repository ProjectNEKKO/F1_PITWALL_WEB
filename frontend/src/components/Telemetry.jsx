import React from 'react';
import TelemetryChart from './TelemetryChart';
import { getTeamColor } from '../utils/f1Teams'; 

// 1. ADD 'deltaData' HERE vvv
function Telemetry({ data, deltaData, driver1, driver2, driversList, onComparisonChange }) {
  
  const resolveColor = (driverCode) => {
    if (!driversList || !driverCode) return '#ff0000';
    const driverInfo = driversList.find(d => d.Driver === driverCode);
    return getTeamColor(driverInfo?.Team);
  };

  const color1 = resolveColor(driver1);
  const color2 = resolveColor(driver2);

  return (
    <div>
      <TelemetryChart 
         data={data}
         deltaData={deltaData} // 2. PASS IT DOWN HERE vvv
         driver1={driver1} 
         driver2={driver2} 
         color1={color1} 
         color2={color2} 
      />
    </div>
  );
}

export default Telemetry;