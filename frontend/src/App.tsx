import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import MapView from './pages/MapView';
import DeskList from './pages/DeskList';
import Rooms from './pages/Rooms';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ActiveSession from './pages/ActiveSession';
import CheckinSuccess from './pages/CheckinSuccess';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />

        {/* Staff pages with sidebar layout */}
        <Route element={<Layout />}>
          <Route path="/map" element={<MapView />} />
          <Route path="/list" element={<DeskList />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Student pages (standalone) */}
        <Route path="/session" element={<ActiveSession />} />
        <Route path="/checkin-success" element={<CheckinSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;
