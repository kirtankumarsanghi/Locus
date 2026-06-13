import { API_BASE_URL } from '../config';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface AnalyticsData {
  desks: {
    total: number;
    free: number;
    occupied: number;
    away: number;
    abandoned: number;
    occupancyRate: number;
  };
  sessions: {
    total: number;
    active: number;
  };
}

interface Desk {
  id: number;
  number: number;
  label: string;
  zone: string;
  floor: number;
  status: string;
  current_session_id: number | null;
  updated_at: string;
}

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, desksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/analytics`),
        fetch(`${API_BASE_URL}/api/desks`),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
      if (desksRes.ok) {
        const data = await desksRes.json();
        setDesks(data);
      }
      setError('');
    } catch (err) {
      console.error('Failed to fetch analytics', err);
      setError('Unable to connect to backend. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  const deskLabel = (num: number) => {
    if (num <= 4) return `A-${(11 + num).toString().padStart(2, '0')}`;
    return `B-${(num - 4).toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <main className="flex-1 md:ml-64 mb-20 md:mb-0 overflow-y-auto bg-gray-50">
        <div className="p-6 md:p-8 max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading analytics...</p>
          </div>
        </div>
      </main>
    );
  }

  const totalSessions = analytics?.sessions.total || 0;
  const activeSessions = analytics?.sessions.active || 0;
  const totalDesks = analytics?.desks.total || 0;
  const freeDesks = analytics?.desks.free || 0;
  const occupiedDesks = analytics?.desks.occupied || 0;
  const awayDesks = analytics?.desks.away || 0;
  const abandonedDesks = analytics?.desks.abandoned || 0;
  const occupancyRate = analytics?.desks.occupancyRate || 0;
  const abandonmentRate = totalDesks > 0 ? Math.round((abandonedDesks / totalDesks) * 100) : 0;

  // Compute desk usage ranking from current desks data 
  const occupiedDesksList = desks
    .filter(d => d.status !== 'FREE')
    .map(d => ({
      label: deskLabel(d.number),
      zone: d.zone,
      status: d.status,
    }));

  return (
    <main className="flex-1 md:ml-64 mb-20 md:mb-0 overflow-y-auto bg-gray-50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-all mb-6 group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-semibold">Back</span>
      </button>

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
          <p className="text-gray-600 text-lg">Live data from the backend 📊</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-slate-700 font-semibold text-sm hover:shadow-md transition-all"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-red-600">error</span>
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Total Sessions</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-700">{totalSessions}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{activeSessions} currently active</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-xl">event_seat</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-slate-700 to-slate-800 h-full rounded-full transition-all duration-500" 
              style={{ width: totalSessions > 0 ? `${Math.min((activeSessions / totalSessions) * 100, 100)}%` : '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{totalSessions > 0 ? Math.round((activeSessions / totalSessions) * 100) : 0}% still active</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">Occupancy Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-600">{occupancyRate}%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{occupiedDesks + awayDesks} of {totalDesks} in use</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-xl">trending_up</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">Availability</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-amber-600">{freeDesks}</span>
                <span className="text-sm font-medium text-gray-500">desks free</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">of {totalDesks} total</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-xl">chair</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              {freeDesks} free
            </div>
            <div className="flex items-center gap-1.5 text-amber-700">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              {awayDesks} away
            </div>
          </div>
        </div>
      </div>

      {/* Live Status Breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Live Desk Status</h2>
            <p className="text-sm text-gray-500 mt-1">Current distribution across all desks</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-xl">check_circle</span>
            </div>
            <p className="text-3xl font-bold text-emerald-700">{freeDesks}</p>
            <p className="text-xs font-semibold text-emerald-600 uppercase mt-1">Available</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-xl">person</span>
            </div>
            <p className="text-3xl font-bold text-indigo-700">{occupiedDesks}</p>
            <p className="text-xs font-semibold text-indigo-600 uppercase mt-1">Occupied</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-xl">schedule</span>
            </div>
            <p className="text-3xl font-bold text-amber-700">{awayDesks}</p>
            <p className="text-xs font-semibold text-amber-600 uppercase mt-1">Away</p>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-xl">error</span>
            </div>
            <p className="text-3xl font-bold text-rose-700">{abandonedDesks}</p>
            <p className="text-xs font-semibold text-rose-600 uppercase mt-1">Abandoned</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Active Desks - Left Column */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Currently Active Desks</h2>
              <p className="text-sm text-gray-500 mt-1">{occupiedDesksList.length} desks in use right now</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-lg">monitor</span>
            </div>
          </div>
          <div className="space-y-3">
            {occupiedDesksList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">weekend</span>
                <p className="font-medium">All desks are currently free</p>
                <p className="text-sm text-gray-400 mt-1">No active sessions right now</p>
              </div>
            ) : occupiedDesksList.map((desk, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-md ${
                  desk.status === 'OCCUPIED' ? 'bg-gradient-to-br from-indigo-400 to-blue-500' :
                  desk.status === 'AWAY' ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                  'bg-gradient-to-br from-rose-400 to-red-500'
                }`}>
                  <span className="material-symbols-outlined text-lg">
                    {desk.status === 'OCCUPIED' ? 'person' : desk.status === 'AWAY' ? 'schedule' : 'error'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">Desk {desk.label}</p>
                  <p className="text-xs text-gray-500">Zone {desk.zone}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    desk.status === 'OCCUPIED' ? 'bg-indigo-100 text-indigo-700' :
                    desk.status === 'AWAY' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      desk.status === 'OCCUPIED' ? 'bg-indigo-500' :
                      desk.status === 'AWAY' ? 'bg-amber-500' :
                      'bg-rose-500 animate-pulse'
                    }`}></div>
                    {desk.status === 'OCCUPIED' ? 'In Use' : desk.status === 'AWAY' ? 'Away' : 'Abandoned'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Overview - Right Column */}
        <div className="space-y-6">
          {/* Abandonment */}
          <div className={`border-2 rounded-2xl p-6 hover:shadow-lg transition-all ${
            abandonedDesks > 0 
              ? 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-200' 
              : 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Abandonment Rate</h3>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${abandonedDesks > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {abandonmentRate}%
                  </span>
                  <span className="text-sm text-gray-600">current</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                abandonedDesks > 0 
                  ? 'bg-gradient-to-br from-rose-500 to-red-600' 
                  : 'bg-gradient-to-br from-emerald-500 to-green-600'
              }`}>
                <span className="material-symbols-outlined text-white text-xl">
                  {abandonedDesks > 0 ? 'error' : 'check_circle'}
                </span>
              </div>
            </div>
            <div className={`rounded-lg p-3 border ${
              abandonedDesks > 0 ? 'bg-white/60 border-rose-200' : 'bg-white/60 border-emerald-200'
            }`}>
              <p className="text-sm text-gray-700">
                {abandonedDesks > 0 
                  ? <><span className="font-bold text-rose-700">{abandonedDesks} desk{abandonedDesks > 1 ? 's' : ''}</span> currently flagged as abandoned</>
                  : <><span className="font-bold text-emerald-700">No desks</span> abandoned — everything looks great! ✨</>
                }
              </p>
            </div>
          </div>

          {/* Session Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Session Summary</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-700">{totalSessions}</span>
                  <span className="text-sm text-gray-600">total sessions recorded</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-xl">analytics</span>
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-3 border border-slate-200">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-slate-700">{activeSessions} active</span> · {totalSessions - activeSessions} completed
              </p>
            </div>
          </div>

          {/* Quick Insight */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-2xl">lightbulb</span>
                <h3 className="font-bold text-lg">Quick Insight</h3>
              </div>
              <p className="text-white/90 leading-relaxed">
                {freeDesks === totalDesks 
                  ? "All desks are currently available. A great time for maintenance or rearrangement!"
                  : abandonedDesks > 0
                  ? `${abandonedDesks} desk${abandonedDesks > 1 ? 's are' : ' is'} abandoned. Consider sending staff to reclaim ${abandonedDesks > 1 ? 'them' : 'it'}.`
                  : occupancyRate > 75
                  ? `High occupancy at ${occupancyRate}%! Consider opening additional zones to prevent overcrowding.`
                  : `Current occupancy is ${occupancyRate}%. Operations are running smoothly.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
