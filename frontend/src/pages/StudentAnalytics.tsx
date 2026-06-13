import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  dailyHours: Array<{ date: string; hours: number }>;
  weeklyHours: Array<{ week: string; hours: number }>;
  monthlyHours: Array<{ month: string; hours: number }>;
  sessionHistory: any[];
  studyStreak: number;
  favoriteDesk: { label: string; count: number } | null;
  favoriteRoom: { name: string; count: number } | null;
  totalHours: number;
}

export default function StudentAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeView, setTimeView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    if (user?.student_id) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user?.student_id) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/analytics/student/${user.student_id}`);
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

  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    if (!user?.student_id) return;

    try {
      let url: string;
      let extension: string;

      if (format === 'csv') {
        url = `${API_BASE_URL}/api/export/csv/student-sessions?studentId=${user.student_id}`;
        extension = 'csv';
      } else if (format === 'json') {
        url = `${API_BASE_URL}/api/export/json/student-analytics?studentId=${user.student_id}`;
        extension = 'json';
      } else {
        url = `${API_BASE_URL}/api/export/excel/student-analytics?studentId=${user.student_id}`;
        extension = 'xlsx';
      }

      const res = await fetch(url);
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `analytics_${user.student_id}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const getTimeData = () => {
    if (!analytics) return [];
    switch (timeView) {
      case 'daily':
        return analytics.dailyHours.slice(-30);
      case 'weekly':
        return analytics.weeklyHours.slice(-12);
      case 'monthly':
        return analytics.monthlyHours.slice(-12);
      default:
        return [];
    }
  };

  const getSessionsByDay = () => {
    if (!analytics) return [];
    const dayCounts: Record<string, number> = {};
    analytics.sessionHistory.forEach(session => {
      const dayOfWeek = new Date(session.start_time).toLocaleDateString('en-US', { weekday: 'short' });
      dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
    });

    const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayOrder.map(day => ({ day, sessions: dayCounts[day] || 0 }));
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">analytics</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">Start checking in to see your analytics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Analytics</h1>
            <p className="mt-2 text-gray-600">Track your study patterns and progress</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              JSON
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-white text-2xl">schedule</span>
            </div>
            <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">Total Study Hours</h3>
            <p className="text-4xl font-bold text-slate-700">{analytics.totalHours}h</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-white text-2xl">local_fire_department</span>
            </div>
            <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">Study Streak</h3>
            <p className="text-4xl font-bold text-gray-900">{analytics.studyStreak}</p>
            <p className="text-sm text-gray-600">consecutive days</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-white text-2xl">event_seat</span>
            </div>
            <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">Favorite Desk</h3>
            <p className="text-2xl font-bold text-gray-900">{analytics.favoriteDesk?.label || 'N/A'}</p>
            <p className="text-sm text-gray-600">{analytics.favoriteDesk?.count || 0} sessions</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-white text-2xl">meeting_room</span>
            </div>
            <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">Favorite Room</h3>
            <p className="text-lg font-bold text-gray-900">{analytics.favoriteRoom?.name || 'N/A'}</p>
            <p className="text-sm text-gray-600">{analytics.favoriteRoom?.count || 0} sessions</p>
          </div>
        </div>

        {/* Study Hours Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700">trending_up</span>
              Study Hours Trend
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeView('daily')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeView === 'daily'
                    ? 'bg-slate-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeView('weekly')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeView === 'weekly'
                    ? 'bg-slate-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeView('monthly')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeView === 'monthly'
                    ? 'bg-slate-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTimeData() as any}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey={timeView === 'daily' ? 'date' : timeView === 'weekly' ? 'week' : 'month'}
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
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
                dataKey="hours"
                stroke="#475569"
                strokeWidth={3}
                dot={{ fill: '#475569', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions by Day of Week */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">calendar_month</span>
            Sessions by Day of Week
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getSessionsByDay()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Bar dataKey="sessions" fill="#475569" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">history</span>
            Recent Sessions
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Desk</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Room</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.sessionHistory.slice(0, 10).map((session, idx) => {
                  const duration = session.end_time
                    ? Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60))
                    : null;

                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(session.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{session.desk_label}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{session.room_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : 'In progress'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          session.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
