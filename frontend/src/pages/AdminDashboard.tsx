import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    totalStudents: 0, 
    totalStaff: 0, 
    activeSessions: 0, 
    totalDesks: 0,
    freeDesks: 0,
    occupiedDesks: 0,
    occupancyRate: 0,
    todayBookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`);
      const data = await res.json();
      // The API returns {stats, peakHours, mostUsedRooms, etc.}
      // We need to extract just the stats object
      setStats(data.stats || data);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-slate-700">admin_panel_settings</span>
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 text-lg">
            Welcome back, {user?.name}. System overview and quick actions.
          </p>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">download</span>
              Export Report
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm mb-4">
                <span className="material-symbols-outlined text-white text-2xl">group</span>
              </div>
              <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-1">Total Users</h3>
              <p className="text-4xl font-bold text-gray-900">{stats.totalStudents + stats.totalStaff}</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm mb-4">
                <span className="material-symbols-outlined text-white text-2xl">event_seat</span>
              </div>
              <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-1">Total Desks</h3>
              <p className="text-4xl font-bold text-gray-900">{stats.totalDesks}</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-sm mb-4">
                <span className="material-symbols-outlined text-white text-2xl">meeting_room</span>
              </div>
              <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-1">Today's Bookings</h3>
              <p className="text-4xl font-bold text-gray-900">{stats.todayBookings}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm mb-4">
                <span className="material-symbols-outlined text-white text-2xl">local_fire_department</span>
              </div>
              <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-1">Active Sessions</h3>
              <p className="text-4xl font-bold text-gray-900">{stats.activeSessions}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/admin/users" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-slate-400 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <span className="material-symbols-outlined text-slate-700">manage_accounts</span>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-slate-700 transition-colors">arrow_forward</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Manage Users</h3>
              <p className="text-gray-600 text-sm">View, edit, or remove students and staff members.</p>
            </Link>

            <Link to="/admin/desks" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-slate-400 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <span className="material-symbols-outlined text-slate-700">desk</span>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-slate-700 transition-colors">arrow_forward</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Manage Desks</h3>
              <p className="text-gray-600 text-sm">Add or configure library desks and zones.</p>
            </Link>

            <Link to="/admin/analytics" className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-slate-400 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <span className="material-symbols-outlined text-slate-700">insights</span>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-slate-700 transition-colors">arrow_forward</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">System Analytics</h3>
              <p className="text-gray-600 text-sm">View comprehensive usage statistics and reports.</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
