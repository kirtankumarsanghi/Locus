import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StaffAnalyticsData {
  overview: {
    totalDesks: number;
    freeDesks: number;
    occupiedDesks: number;
    awayDesks: number;
    abandonedDesks: number;
    activeSessions: number;
    occupancyRate: number;
  };
  peakHours: Array<{ hour: string; count: number }>;
  deskUtilization: Array<{ label: string; sessionCount: number; totalHours: number }>;
  hourlyPattern: Array<{ hour: string; sessions: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
const STATUS_COLORS: Record<string, string> = {
  FREE: '#10b981',
  OCCUPIED: '#3b82f6',
  AWAY: '#f59e0b',
  ABANDONED: '#ef4444'
};

export default function StaffAnalytics() {
  const [analytics, setAnalytics] = useState<StaffAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/analytics/staff`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: string, format: 'csv' | 'excel') => {
    try {
      const url = format === 'csv'
        ? `${API_BASE_URL}/api/export/csv/${type}`
        : `${API_BASE_URL}/api/export/excel/${type}`;
      
      const extension = format === 'csv' ? 'csv' : 'xlsx';
      
      const res = await fetch(url);
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${type}_${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 md:ml-64 mb-20 md:mb-0 overflow-y-auto bg-gray-50">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!analytics) return null;

  return (
    <main className="flex-1 md:ml-64 mb-20 md:mb-0 overflow-y-auto bg-gray-50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">Real-time operational insights</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('all-sessions', 'csv')}
              className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              CSV
            </button>
            <button
              onClick={() => handleExport('staff-analytics', 'excel')}
              className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Excel
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-2xl">event_seat</span>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Occupancy</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{analytics.overview.occupancyRate}%</p>
            <p className="text-sm text-gray-600">{analytics.overview.occupiedDesks + analytics.overview.awayDesks} / {analytics.overview.totalDesks} in use</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-2xl">groups</span>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Active</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{analytics.overview.activeSessions}</p>
            <p className="text-sm text-gray-600">active sessions</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-2xl">check_circle</span>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Available</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{analytics.overview.freeDesks}</p>
            <p className="text-sm text-gray-600">desks ready</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-2xl">error</span>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Abandoned</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{analytics.overview.abandonedDesks}</p>
            <p className="text-sm text-gray-600">need attention</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Desk Status Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700">donut_small</span>
              Desk Status Distribution
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.status}: ${props.count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Usage Pattern */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700">schedule</span>
              Hourly Usage Pattern
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.hourlyPattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">trending_up</span>
            Peak Hours (Last 7 Days)
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Desk Utilization Table */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">table_chart</span>
            Desk Utilization (Last 30 Days)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Desk</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Sessions</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Total Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {analytics.deskUtilization.slice(0, 10).map((desk, idx) => {
                  const maxSessions = Math.max(...analytics.deskUtilization.map(d => d.sessionCount));
                  const utilizationPercent = maxSessions > 0 ? (desk.sessionCount / maxSessions) * 100 : 0;

                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{desk.label}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{desk.sessionCount}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{desk.totalHours}h</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-slate-600 to-slate-400 rounded-full"
                              style={{ width: `${utilizationPercent}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                            {Math.round(utilizationPercent)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
