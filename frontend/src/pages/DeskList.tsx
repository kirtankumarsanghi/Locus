import { API_BASE_URL } from '../config';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Session {
  id: number;
  desk_id: number;
  student_id: string;
  status: string;
  start_time: string;
  away_start_time: string | null;
  last_check_in_time: string;
  end_time: string | null;
}

interface Desk {
  id: number;
  number: number;
  label: string;
  zone: string;
  floor: number;
  status: 'FREE' | 'OCCUPIED' | 'AWAY' | 'ABANDONED';
  current_session_id: number | null;
  updated_at: string;
}

export default function DeskList() {
  const navigate = useNavigate();
  const [desks, setDesks] = useState<Desk[]>([]);
  const [sessions, setSessions] = useState<Record<number, Session>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDesks, setSelectedDesks] = useState<Set<number>>(new Set());

  const fetchDesks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/desks`);
      if (res.ok) {
        const data: Desk[] = await res.json();
        setDesks(data);
        
        // Fetch session detail for each occupied/away/abandoned desk
        const sessionMap: Record<number, Session> = {};
        await Promise.all(
          data
            .filter(d => d.current_session_id !== null)
            .map(async (d) => {
              try {
                const detailRes = await fetch(`${API_BASE_URL}/api/desks/${d.id}`);
                if (detailRes.ok) {
                  const detail = await detailRes.json();
                  if (detail.session) {
                    sessionMap[d.id] = detail.session;
                  }
                }
              } catch { /* ignore individual failures */ }
            })
        );
        setSessions(sessionMap);
      }
    } catch (err) {
      console.error('Failed to fetch desks', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesks();
    const interval = setInterval(fetchDesks, 5000);
    return () => clearInterval(interval);
  }, [fetchDesks]);

  const handleReset = async (deskId: number) => {
    if (!confirm('Reset this desk to FREE? Any active session will be ended.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId }),
      });
      if (res.ok) {
        alert('Desk reset successfully!');
        fetchDesks();
      } else {
        alert('Failed to reset desk.');
      }
    } catch (err) {
      console.error('Failed to reset desk', err);
      alert('Network error.');
    }
  };

  const handleEndSession = async (deskId: number) => {
    if (!confirm('End this session and free up the desk?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/end-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId }),
      });
      if (res.ok) {
        alert('Session ended successfully!');
        fetchDesks();
      } else {
        alert('Failed to end session.');
      }
    } catch (err) {
      console.error('Failed to end session', err);
      alert('Network error.');
    }
  };

  const toggleSelect = (deskId: number) => {
    const newSet = new Set(selectedDesks);
    if (newSet.has(deskId)) newSet.delete(deskId);
    else newSet.add(deskId);
    setSelectedDesks(newSet);
  };

  const handleBulkReset = async () => {
    if (!confirm(`Reset ${selectedDesks.size} selected desks?`)) return;
    for (const deskId of selectedDesks) {
      try {
        await fetch(`${API_BASE_URL}/api/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deskId }),
        });
      } catch (e) { console.error(e); }
    }
    setSelectedDesks(new Set());
    fetchDesks();
  };

  const handleBulkEndSession = async () => {
    if (!confirm(`End sessions for ${selectedDesks.size} selected desks?`)) return;
    for (const deskId of selectedDesks) {
      try {
        await fetch(`${API_BASE_URL}/api/end-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deskId }),
        });
      } catch (e) { console.error(e); }
    }
    setSelectedDesks(new Set());
    fetchDesks();
  };

  const deskLabel = (num: number) => {
    if (num <= 4) return `A-${(11 + num).toString().padStart(2, '0')}`;
    return `B-${(num - 4).toString().padStart(2, '0')}`;
  };

  // Compute duration from a timestamp
  const formatDuration = (isoStr: string | null | undefined) => {
    if (!isoStr) return '-';
    const start = new Date(isoStr + 'Z');
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    if (diffMs < 0) return '0m';
    const totalMin = Math.floor(diffMs / 60000);
    if (totalMin < 60) return `${totalMin}m`;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m}m`;
  };

  const formatLastSeen = (desk: Desk) => {
    if (desk.status === 'FREE') return '-';
    const session = sessions[desk.id];
    if (!session) return '-';
    
    const checkTime = session.away_start_time || session.last_check_in_time;
    return formatDuration(checkTime) + ' ago';
  };

  const getTimerDisplay = (desk: Desk) => {
    if (desk.status === 'AWAY') {
      const session = sessions[desk.id];
      if (session?.away_start_time) {
        return formatDuration(session.away_start_time);
      }
      return '-';
    }
    if (desk.status === 'ABANDONED') {
      return formatDuration(desk.updated_at);
    }
    return null;
  };

  // Filter and search
  const filteredDesks = desks.filter((desk) => {
    const label = deskLabel(desk.number);
    const matchesSearch = label.toLowerCase().includes(search.toLowerCase()) || 
                          (sessions[desk.id]?.student_id || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || desk.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedDesks.size === filteredDesks.length && filteredDesks.length > 0) {
      setSelectedDesks(new Set());
    } else {
      setSelectedDesks(new Set(filteredDesks.map(d => d.id)));
    }
  };

  const abandonedCount = desks.filter(d => d.status === 'ABANDONED').length;
  const awayCount = desks.filter(d => d.status === 'AWAY').length;
  const occupiedCount = desks.filter(d => d.status === 'OCCUPIED').length;
  const totalDesks = desks.length || 1;
  const occupancy = Math.round(((occupiedCount + awayCount + abandonedCount) / totalDesks) * 100);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FREE': return { label: 'Available' };
      case 'OCCUPIED': return { label: 'Occupied' };
      case 'AWAY': return { label: 'Away' };
      case 'ABANDONED': return { label: 'Abandoned' };
      default: return { label: status };
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-6 md:p-8 mx-auto mb-20 md:mb-0 overflow-y-auto bg-gradient-to-br from-indigo-50/20 via-white to-purple-50/20">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading desk data...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-8 mx-auto mb-20 md:mb-0 overflow-y-auto bg-gradient-to-br from-indigo-50/20 via-white to-purple-50/20">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
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

      {/* Summary Cards */}
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
            <button 
              onClick={() => setStatusFilter('ABANDONED')}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
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
          <button 
            onClick={() => setStatusFilter(statusFilter === 'AWAY' ? 'All' : 'AWAY')}
            className={`w-full py-2.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
              statusFilter === 'AWAY' 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            {statusFilter === 'AWAY' ? 'Show All' : 'Filter Away'}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b-2 border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">All Desks</h2>
            <p className="text-sm text-gray-500 mt-0.5">Live status updates · {filteredDesks.length} shown</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            {selectedDesks.size > 0 && (
              <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                <span className="text-sm font-semibold text-indigo-700">{selectedDesks.size} selected</span>
                <button onClick={handleBulkEndSession} className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors">End Sessions</button>
                <button onClick={handleBulkReset} className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors">Reset Desks</button>
              </div>
            )}
            <div className="flex gap-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`px-4 py-2 border-2 rounded-xl font-medium hover:border-indigo-200 hover:bg-indigo-50 transition-all flex items-center gap-2 ${
                  statusFilter !== 'All' ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-lg">tune</span>
                <span className="hidden sm:inline">{statusFilter === 'All' ? 'Filter' : statusFilter}</span>
                {statusFilter !== 'All' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                )}
              </button>
              {showFilterMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-44 overflow-hidden">
                  {['All', 'FREE', 'OCCUPIED', 'AWAY', 'ABANDONED'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setStatusFilter(opt); setShowFilterMenu(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${
                        statusFilter === opt ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                      }`}
                    >
                      {opt === 'All' ? '🔵 All Desks' : 
                       opt === 'FREE' ? '🟢 Available' : 
                       opt === 'OCCUPIED' ? '🔴 Occupied' : 
                       opt === 'AWAY' ? '🟡 Away' : '🟣 Abandoned'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative flex-1 md:flex-none">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
              <input
                className="w-full md:w-64 pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-100 outline-none transition-all"
                placeholder="Search desk or student..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-100 bg-gray-50">
                <th className="px-6 py-4 w-12">
                  <input type="checkbox" 
                         checked={selectedDesks.size > 0 && selectedDesks.size === filteredDesks.length}
                         onChange={toggleSelectAll}
                         className="w-4 h-4 rounded text-indigo-600 border-gray-300" />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Desk</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Last Seen</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDesks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
                      <p className="font-medium">No desks match your filters</p>
                      <button onClick={() => { setSearch(''); setStatusFilter('All'); }} className="text-indigo-600 text-sm font-semibold hover:underline">
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredDesks.map((desk) => {
                const badge = getStatusBadge(desk.status);
                const session = sessions[desk.id];
                const timer = getTimerDisplay(desk);
                return (
                  <tr
                    key={desk.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      desk.status === 'ABANDONED' ? 'bg-rose-50/30' : 
                      desk.status === 'AWAY' ? 'bg-amber-50/20' : ''
                    } ${selectedDesks.has(desk.id) ? 'bg-indigo-50/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input type="checkbox" 
                             checked={selectedDesks.has(desk.id)}
                             onChange={() => toggleSelect(desk.id)}
                             className="w-4 h-4 rounded text-indigo-600 border-gray-300" />
                    </td>
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
                          <p className="font-semibold text-gray-900">Floor {desk.floor} - {deskLabel(desk.number)}</p>
                          <p className="text-xs text-gray-500">Zone {desk.zone}</p>
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
                      {session?.student_id || '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm ${desk.status === 'ABANDONED' ? 'text-rose-600 font-medium' : 'text-gray-600'}`}>
                      {formatLastSeen(desk)}
                    </td>
                    <td className="px-6 py-4">
                      {desk.status === 'AWAY' && timer && (
                        <span className="font-mono text-sm text-amber-700 flex items-center gap-1.5 font-medium">
                          <span className="material-symbols-outlined text-base">timer</span>
                          {timer}
                        </span>
                      )}
                      {desk.status === 'ABANDONED' && timer && (
                        <span className="font-mono text-sm text-rose-700 flex items-center gap-1.5 font-medium">
                          <span className="material-symbols-outlined text-base">warning</span>
                          {timer}
                        </span>
                      )}
                      {(desk.status === 'FREE' || desk.status === 'OCCUPIED') && (
                        <span className="text-gray-400">
                          {desk.status === 'OCCUPIED' && session 
                            ? formatDuration(session.start_time) 
                            : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {desk.status === 'ABANDONED' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleReset(desk.id)} 
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                      {desk.status === 'AWAY' && (
                        <button 
                          onClick={() => handleEndSession(desk.id)}
                          className="px-3 py-1.5 border-2 border-amber-200 bg-amber-50 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          End Session
                        </button>
                      )}
                      {desk.status === 'OCCUPIED' && (
                        <button 
                          onClick={() => handleEndSession(desk.id)}
                          className="px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                        >
                          End Session
                        </button>
                      )}
                      {desk.status === 'FREE' && (
                        <span className="text-xs text-gray-400">—</span>
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
          <span className="text-sm text-gray-600">{filteredDesks.length} of {desks.length} {desks.length === 1 ? 'desk' : 'desks'}</span>
          <button
            onClick={() => fetchDesks()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh
          </button>
        </div>
      </div>
      </div>
    </main>
  );
}
