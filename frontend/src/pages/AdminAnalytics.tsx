import { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { BarChart3, Users, Clock, MonitorSpeaker, BookOpen, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analytics`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <Breadcrumb />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Advanced Analytics
        </h1>
        <p className="text-gray-500 mt-1">Deep insights into library utilization and user behavior.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.students.total + data.staff.total}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{data.students.total} Students, {data.staff.total} Staff</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <MonitorSpeaker className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Desks</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.desks.total}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{data.desks.occupancyRate}% Average Occupancy</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Sessions</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.sessions.total}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Avg: {Math.round(data.sessions.avgDuration)} mins/session</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Bookings</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.rooms.totalBookings}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{data.rooms.approvedBookings} Approved, {data.rooms.pendingBookings} Pending</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desk Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Desk Utilization</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Occupied ({data.desks.occupied})</span>
                <span className="text-gray-500">{data.desks.total > 0 ? Math.round((data.desks.occupied / data.desks.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${data.desks.total > 0 ? (data.desks.occupied / data.desks.total) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Free ({data.desks.free})</span>
                <span className="text-gray-500">{data.desks.total > 0 ? Math.round((data.desks.free / data.desks.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${data.desks.total > 0 ? (data.desks.free / data.desks.total) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Away ({data.desks.away})</span>
                <span className="text-gray-500">{data.desks.total > 0 ? Math.round((data.desks.away / data.desks.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${data.desks.total > 0 ? (data.desks.away / data.desks.total) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 flex items-center gap-1">
                  Abandoned ({data.desks.abandoned})
                  {data.desks.abandonedRate > 10 && <AlertCircle className="w-4 h-4 text-rose-500" />}
                </span>
                <span className="text-gray-500">{data.desks.abandonedRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${data.desks.abandonedRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Peak Hours Analysis */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Peak Hours (Top 5)</h2>
          {data.sessions.peakHours?.length > 0 ? (
            <div className="flex items-end gap-2 h-48 mt-4">
              {data.sessions.peakHours.map((ph: any) => {
                const max = Math.max(...data.sessions.peakHours.map((p: any) => p.count));
                const height = max > 0 ? (ph.count / max) * 100 : 0;
                return (
                  <div key={ph.hour} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative group flex justify-center h-full items-end">
                      <div 
                        className="w-full max-w-[40px] bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-colors"
                        style={{ height: `${height}%` }}
                      ></div>
                      {/* Tooltip */}
                      <div className="absolute -top-10 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {ph.count} sessions
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{ph.hour}:00</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 pb-10">
              Not enough data yet.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Popular Desks */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Most Popular Desks</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Desk</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.mostUsedDesks?.length > 0 ? (
                  data.mostUsedDesks.map((d: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{d.label}</div>
                            <div className="text-xs text-gray-500">ID: {d.number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {d.count}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-500">No desk usage data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Room Utilization */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Room Utilization</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.rooms.utilization?.length > 0 ? (
                  data.rooms.utilization.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{r.name}</div>
                        <div className="text-xs text-gray-500">Capacity: {r.capacity}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                          {r.booking_count}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-500">No room bookings available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
