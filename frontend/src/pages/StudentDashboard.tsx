import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { currentUser } from '../data/mockStudent';

interface Desk {
  id: number;
  number: number;
  status: 'FREE' | 'OCCUPIED' | 'AWAY' | 'ABANDONED';
  current_session_id: number | null;
}

export default function StudentDashboard() {
  const [desks, setDesks] = useState<Desk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesks();
    const interval = setInterval(fetchDesks, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDesks = async () => {
    try {
      const res = await fetch(`\${API_BASE_URL}/api/desks`);
      const data = await res.json();
      setDesks(data);
    } catch (err) {
      console.error('Failed to fetch desks', err);
      // Use mock data if backend unavailable
      setDesks(generateMockDesks());
    } finally {
      setLoading(false);
    }
  };

  const generateMockDesks = (): Desk[] => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      number: i + 1,
      status: i === 1 ? 'OCCUPIED' : i === 3 ? 'AWAY' : i === 6 ? 'ABANDONED' : 'FREE',
      current_session_id: i === 1 || i === 3 || i === 6 ? 1000 + i : null,
    }));
  };

  const availableCount = desks.filter(d => d.status === 'FREE').length;
  const occupiedCount = desks.filter(d => d.status === 'OCCUPIED').length;
  const totalDesks = desks.length || 1;
  const occupancyRate = Math.round((occupiedCount / totalDesks) * 100);

  return (
    <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {currentUser.name}. Here's your study session overview.
            </p>
          </div>
          <Link
            to="/student/profile"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold text-center hover:opacity-90 transition-all shadow-lg flex items-center gap-2 w-fit"
          >
            <span className="material-symbols-outlined text-lg">account_circle</span>
            My Profile
          </Link>
        </div>

        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-white p-8 shadow-xl border border-slate-600 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-3">
                Welcome Back, {currentUser.name}!
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">event_seat</span>
                  <span>Current Desk: <span className="font-bold">{currentUser.activeDesk}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                  <span>Total Study Hours: <span className="font-bold">{currentUser.totalHours}h</span></span>
                </div>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border border-white/30">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </div>

        {/* Live Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-2xl">event_seat</span>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Available Now</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{loading ? '...' : availableCount}</p>
            <p className="text-sm text-gray-600">desks ready to use</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-2xl">timer</span>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Your Session</span>
            </div>
            <p className="text-4xl font-bold text-slate-700 mb-1">Active</p>
            <p className="text-sm text-gray-600">1h 24m elapsed</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-2xl">groups</span>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Occupancy</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{loading ? '...' : occupancyRate}%</p>
            <p className="text-sm text-gray-600">{occupiedCount} / {totalDesks} in use</p>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Link
              to="/student/checkin"
              className="group p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:border-slate-300 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-3xl">qr_code_scanner</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Check In
              </h3>
              <p className="text-sm text-gray-600">
                Start a new study session at any desk
              </p>
            </Link>

            <Link
              to="/student/seats"
              className="group p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:border-slate-300 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-3xl">search</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Find Seats
              </h3>
              <p className="text-sm text-gray-600">
                Browse {availableCount} available desks right now
              </p>
            </Link>

            <Link
              to="/session"
              className="group p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:border-slate-300 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-3xl">timer</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                My Session
              </h3>
              <p className="text-sm text-gray-600">
                View and manage your current session
              </p>
            </Link>

          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">history</span>
            Recent Activity
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-white text-lg">login</span>
                </div>
                <span className="font-medium text-gray-900">Checked into Desk A-12</span>
              </div>
              <span className="text-sm text-gray-600">Today, 9:15 AM</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-white text-lg">check_circle</span>
                </div>
                <span className="font-medium text-gray-900">Completed 2h 15m session</span>
              </div>
              <span className="text-sm text-gray-600">Yesterday</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-white text-lg">bookmark</span>
                </div>
                <span className="font-medium text-gray-900">Reserved Desk B-07</span>
              </div>
              <span className="text-sm text-gray-600">2 days ago</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}



