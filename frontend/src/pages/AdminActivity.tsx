import { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { API_BASE_URL } from '../config';

interface ActivityLog {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_role: string | null;
  action: string;
  entity_type: string;
  entity_id: number;
  details: string;
  created_at: string;
}

export default function AdminActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = filterAction 
        ? `${API_BASE_URL}/api/admin/activity?action=${filterAction}`
        : `${API_BASE_URL}/api/admin/activity`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return 'login';
    if (action.includes('CREATED')) return 'add_circle';
    if (action.includes('DELETED')) return 'delete';
    if (action.includes('UPDATED')) return 'edit';
    if (action.includes('CHECKIN')) return 'how_to_reg';
    if (action.includes('CHECKOUT')) return 'logout';
    if (action.includes('AWAY')) return 'directions_walk';
    return 'info';
  };

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN') || action.includes('CHECKIN')) return 'text-emerald-600 bg-emerald-100';
    if (action.includes('CREATED')) return 'text-blue-600 bg-blue-100';
    if (action.includes('DELETED') || action.includes('CHECKOUT')) return 'text-rose-600 bg-rose-100';
    if (action.includes('AWAY')) return 'text-amber-600 bg-amber-100';
    return 'text-slate-600 bg-slate-100';
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Breadcrumb />
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Activity Log</h1>
          <p className="text-gray-600 text-lg">Monitor all actions and events across the platform.</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none text-gray-700 bg-white shadow-sm"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Logins</option>
            <option value="CHECKIN">Check-ins</option>
            <option value="CHECKOUT">Check-outs</option>
            <option value="AWAY">Away Status</option>
            <option value="USER_CREATED">User Creations</option>
            <option value="ROOM_CREATED">Room Creations</option>
            <option value="DESK_CREATED">Desk Creations</option>
          </select>
          <button 
            onClick={fetchLogs}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-2 rounded-xl"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-slate-700 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Action</th>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Details</th>
                  <th className="p-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      No activity logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActionColor(log.action)}`}>
                            <span className="material-symbols-outlined text-sm">{getActionIcon(log.action)}</span>
                          </div>
                          <span className="font-bold text-gray-900">{log.action.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {log.user_name ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{log.user_name}</span>
                            <span className="text-xs text-gray-500">{log.user_role}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">System</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-700 max-w-md truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="p-4 text-gray-500 text-sm whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
