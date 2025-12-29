import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GlobalNav from './components/GlobalNav';
import Analysis from './pages/Analysis';
// remove "import Dashboard" if you don't have the file yet

// 1. Define Placeholders directly here (Rename them if needed, but this is fine)
const Dashboard = () => <div style={{padding: 50}}><h1>Dashboard</h1><p>Coming Soon</p></div>;
const Standings = () => <div style={{padding: 50}}><h1>Standings</h1><p>Coming Soon</p></div>;
const Settings = () => <div style={{padding: 50}}><h1>Settings</h1><p>Coming Soon</p></div>;

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        
        {/* Sidebar */}
        <GlobalNav />
        
        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: '#f8f9fa' }}>
           <Routes>
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