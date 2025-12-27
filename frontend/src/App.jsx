import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalNav from './components/GlobalNav';
import Analysis from './pages/Analysis';

// Placeholder pages for now
const Dashboard = () => <h1 style={{padding: 50}}>Dashboard Coming Soon</h1>;
const Standings = () => <h1 style={{padding: 50}}>Standings Coming Soon</h1>;

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Arial, sans-serif' }}>
        
        {/* 1. Permanent Global Nav (Far Left) */}
        <GlobalNav />

        {/* 2. Dynamic Content Area */}
        <div style={{ flex: 1, height: '100vh', overflow: 'hidden', background: '#f5f7fa' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/standings" element={<Standings />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;