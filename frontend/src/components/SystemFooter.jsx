import React from 'react';
import { Activity, Server, Wifi } from 'lucide-react';
import './SystemFooter.css';

const SystemFooter = () => {
  return (
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
  );
};

export default SystemFooter;