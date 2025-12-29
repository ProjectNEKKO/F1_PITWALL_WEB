import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalNav from './components/GlobalNav';

// 👇 1. IMPORT THE REAL DASHBOARD HERE
import Dashboard from './pages/Dashboard'; 
import Analysis from './pages/Analysis';

// placeholders for other pages are fine for now
const Standings = () => <div style={{padding: 50}}><h1>Standings</h1><p>Coming Soon</p></div>;
const Settings = () => <div style={{padding: 50}}><h1>Settings</h1><p>Coming Soon</p></div>;

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        
        <GlobalNav />
        
        <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: '#f8f9fa' }}>
           <Routes>
             {/* 👇 2. ENSURE THIS POINTS TO THE IMPORTED COMPONENT */}
             <Route path="/" element={<Dashboard />} />
             <Route path="/analysis" element={<Analysis />} />
             <Route path="/standings" element={<Standings />} />
             <Route path="/settings" element={<Settings />} />
           </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;