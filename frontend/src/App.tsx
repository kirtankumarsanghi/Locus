import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';
import ConnectionStatus from './components/ConnectionStatus';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Help from './pages/Help';
import MapView from './pages/MapView';
import DeskList from './pages/DeskList';
import Rooms from './pages/Rooms';
import StudentRooms from './pages/StudentRooms';

import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import ActiveSession from './pages/ActiveSession';
import CheckinSuccess from './pages/CheckinSuccess';
import StudentDashboard from './pages/StudentDashboard';
import SeatFinder from './pages/SeatFinder';
import StudentProfile from './pages/StudentProfile';
import CheckIn from './pages/CheckIn';
import StudentAnalytics from './pages/StudentAnalytics';
import StaffAnalytics from './pages/StaffAnalytics';
import AdminAnalytics from './pages/AdminAnalytics';
import SmartDashboard from './pages/SmartDashboard';

import AdminUsers from './pages/AdminUsers';
import AdminStudents from './pages/AdminStudents';
import AdminStaff from './pages/AdminStaff';
import AdminDesks from './pages/AdminDesks';
import AdminRooms from './pages/AdminRooms';
import AdminActivity from './pages/AdminActivity';
import AdminNotifications from './pages/AdminNotifications';
import AdminSettings from './pages/AdminSettings';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ConnectionStatus />
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/help" element={<Help />} />

            {/* Admin Portal (ADMIN only) */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/students" element={<AdminStudents />} />
                <Route path="/admin/staff" element={<AdminStaff />} />
                <Route path="/admin/desks" element={<AdminDesks />} />
                <Route path="/admin/rooms" element={<AdminRooms />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/activity" element={<AdminActivity />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Staff Portal (STAFF only) */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF']} />}>
              <Route element={<Layout />}>
                <Route path="/map" element={<MapView />} />
                <Route path="/list" element={<DeskList />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/analytics" element={<StaffAnalytics />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Student pages with student layout */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route element={<StudentLayout />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/seats" element={<SeatFinder />} />
                <Route path="/student/rooms" element={<StudentRooms />} />
                <Route path="/student/analytics" element={<StudentAnalytics />} />
                <Route path="/student/smart" element={<SmartDashboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/checkin" element={<CheckIn />} />
              </Route>
              {/* Standalone student pages */}
              <Route path="/session" element={<ActiveSession />} />
              <Route path="/checkin-success" element={<CheckinSuccess />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
