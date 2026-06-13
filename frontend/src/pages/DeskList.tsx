import { API_BASE_URL } from '../config';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Desk {
  id: number;
  number: number;
  status: 'FREE' | 'OCCUPIED' | 'AWAY' | 'ABANDONED';
  current_session_id: number | null;
}

export default function DeskList() {
  const navigate = useNavigate();
  const [desks, setDesks] = useState<Desk[]>([]);

  const fetchDesks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/desks`);
      const data = await res.json();
      setDesks(data);
    } catch (err) {
      console.error('Failed to fetch desks', err);
      // Use mock data if backend is not available
      setDesks(generateMockDesks());
    }
  };

  // Generate mock desks for demo
  const generateMockDesks = (): Desk[] => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      number: i + 1,
      status: i === 1 ? 'OCCUPIED' : i === 3 ? 'AWAY' : i === 6 ? 'ABANDONED' : 'FREE',
      current_session_id: i === 1 || i === 3 || i === 6 ? 1000 + i : null,
    }));
  };

  useEffect(() => {
    // Try to fetch from backend, fallback to mock data
    fetchDesks();
    const interval = setInterval(fetchDesks, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async (deskId: number) => {
    try {
      await fetch(`${API_BASE_URL}/api/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId }),
      });
      fetchDesks();
    } catch (err) {
      console.error('Failed to reset desk', err);
    }
  };

  const deskLabel = (num: number) => {
    if (num <= 4) return `A${(11 + num).toString().padStart(2, '0')}`;
    return `B${(num - 4).toString().padStart(2, '0')}`;
  };

  const abandonedCount = desks.filter(d => d.status === 'ABANDONED').length;
  const awayCount = desks.filter(d => d.status === 'AWAY').length;
  const occupiedCount = desks.filter(d => d.status === 'OCCUPIED').length;
  const totalDesks = desks.length || 1;
  const occupancy = Math.round(((occupiedCount + awayCount + abandonedCount) / totalDesks) * 100);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FREE': return { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant', dot: 'bg-outline', label: 'Available' };
      case 'OCCUPIED': return { bg: 'bg-[#dcfce7]', text: 'text-[#166534]', dot: 'bg-[#166534]', label: 'Occupied' };
      case 'AWAY': return { bg: 'bg-[#fef9c3]', text: 'text-[#854d0e]', dot: 'bg-[#854d0e]', label: 'Away' };
      case 'ABANDONED': return { bg: 'bg-[#f3e8ff]', text: 'text-[#6b21a8]', dot: 'bg-[#6b21a8]', label: 'Abandoned' };
      default: return { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant', dot: 'bg-outline', label: status };
    }
  };

  return (
    <main className="flex-1 md:ml-72 p-6 md:p-8 mx-auto mb-20 md:mb-0 overflow-y-auto bg-gradient-to-br from-indigo-50/20 via-white to-purple-50/20">
      {/* Back Button - Casual Style */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary hover:text-purple-600 transition-all mb-8 group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-semibold">Back to Map</span>
      </button>

      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-2">Desk Overview</h1>
        <p className="text-on-surface-variant">Real-time status of all desks in Main Hall</p>
      </div>

      {/* Summary Cards - More Natural */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Occupancy Card */}
        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Occupancy</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-indigo-600">{occupancy}%</span>
                <span className="text-sm text-gray-500">{occupiedCount + awayCount + abandonedCount}/{totalDesks}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-600">assessment</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${occupancy}%` }}
            />
          </div>
        </div>

        {/* Abandoned Card */}
        <div className={`bg-white border-2 rounded-2xl p-6 hover:shadow-lg transition-shadow ${abandonedCount > 0 ? 'border-rose-200 bg-rose-50/30' : 'border-gray-100'}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-2">Needs Attention</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-rose-600">{abandonedCount}</span>
                <span className="text-sm text-gray-500">desks</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${abandonedCount > 0 ? 'bg-rose-100 animate-pulse' : 'bg-gray-100'}`}>
              <span className={`material-symbols-outlined ${abandonedCount > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                {abandonedCount > 0 ? 'error' : 'check_circle'}
              </span>
            </div>
          </div>
          {abandonedCount > 0 && (
            <button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              Review Flagged
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
          {abandonedCount === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">All good! 👍</p>
          )}
        </div>

        {/* Away Card */}
        <div className="bg-white border-2 border-amber-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Away</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-amber-600">{awayCount}</span>
                <span className="text-sm text-gray-500">students</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600">schedule</span>
            </div>
          </div>
          <div className="flex gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-amber-700">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              {Math.ceil(awayCount * 0.66)} quick
            </span>
            <span className="flex items-center gap-1.5 text-orange-700">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              {Math.floor(awayCount * 0.34)} long
            </span>
          </div>
        </div>
      </div>

      {/* Table Section - Natural Feel */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b-2 border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">All Desks</h2>
            <p className="text-sm text-gray-500 mt-0.5">Live status updates</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">tune</span>
              <span className="hidden sm:inline">Filter</span>
            </button>
            <div className="relative flex-1 md:flex-none">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input
                className="w-full md:w-64 pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-100 outline-none transition-all"
                placeholder="Search..."
                type="text"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-100 bg-gray-50">
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Desk</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Session ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Last Seen</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {desks.map((desk) => {
                const badge = getStatusBadge(desk.status);
                return (
                  <tr
                    key={desk.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      desk.status === 'ABANDONED' ? 'bg-rose-50/30' : 
                      desk.status === 'AWAY' ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          desk.status === 'FREE' ? 'bg-emerald-100 text-emerald-700' :
                          desk.status === 'OCCUPIED' ? 'bg-indigo-100 text-indigo-700' :
                          desk.status === 'AWAY' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {deskLabel(desk.number).split('-')[1]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Floor 2 - {deskLabel(desk.number)}</p>
                          <p className="text-xs text-gray-500">Zone A</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-xs ${
                        desk.status === 'FREE' ? 'bg-emerald-100 text-emerald-700' :
                        desk.status === 'OCCUPIED' ? 'bg-indigo-100 text-indigo-700' :
                        desk.status === 'AWAY' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          desk.status === 'FREE' ? 'bg-emerald-500' :
                          desk.status === 'OCCUPIED' ? 'bg-indigo-500' :
                          desk.status === 'AWAY' ? 'bg-amber-500' :
                          'bg-rose-500 animate-pulse'
                        }`} />
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">
                      {desk.current_session_id ? `#${desk.current_session_id.toString().padStart(4, '0')}` : '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm ${desk.status === 'ABANDONED' ? 'text-rose-600 font-medium' : 'text-gray-600'}`}>
                      {desk.status === 'FREE' ? '-' : 
                       desk.status === 'ABANDONED' ? '45m ago' : 
                       desk.status === 'AWAY' ? '18m ago' : 
                       '2m ago'}
                    </td>
                    <td className="px-6 py-4">
                      {desk.status === 'AWAY' && (
                        <span className="font-mono text-sm text-amber-700 flex items-center gap-1.5 font-medium">
                          <span className="material-symbols-outlined text-base">timer</span>
                          12:05
                        </span>
                      )}
                      {desk.status === 'ABANDONED' && (
                        <span className="font-mono text-sm text-rose-700 flex items-center gap-1.5 font-medium">
                          <span className="material-symbols-outlined text-base">warning</span>
                          15:00
                        </span>
                      )}
                      {(desk.status === 'FREE' || desk.status === 'OCCUPIED') && (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {desk.status === 'ABANDONED' && (
                        <div className="flex justify-end gap-2">
                          <button className="px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                            Remind
                          </button>
                          <button 
                            onClick={() => handleReset(desk.id)} 
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                      {desk.status === 'AWAY' && (
                        <button className="px-3 py-1.5 border-2 border-amber-200 bg-amber-50 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors">
                          Nudge
                        </button>
                      )}
                      {(desk.status === 'OCCUPIED' || desk.status === 'FREE') && (
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Options">
                          <span className="material-symbols-outlined text-gray-400">more_horiz</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 flex justify-between items-center border-t-2 border-gray-100 bg-gray-50">
          <span className="text-sm text-gray-600">{desks.length} {desks.length === 1 ? 'desk' : 'desks'} total</span>
          <div className="flex gap-2">
            <button className="p-2 border-2 border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-2 border-2 border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


