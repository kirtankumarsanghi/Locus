import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealTimeDesks } from '../hooks/useRealTimeDesks';
import { API_BASE_URL } from '../config';

interface Desk {
  id: number;
  number: number;
  label: string;
  zone: string;
  floor: number;
  status: 'FREE' | 'OCCUPIED' | 'AWAY' | 'ABANDONED';
  current_session_id: number | null;
}

interface Session {
  start_time: string;
  away_start_time: string | null;
}

export default function SeatFinder() {
  const { desks, loading } = useRealTimeDesks();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [floorFilter, setFloorFilter] = useState('All');
  const [sessionData, setSessionData] = useState<Record<number, Session>>({});
  const navigate = useNavigate();

  // Fetch session details for occupied desks
  useEffect(() => {
    const occupiedDesks = desks.filter(d => d.current_session_id && d.status !== 'FREE');
    occupiedDesks.forEach(desk => {
      if (desk.current_session_id && !sessionData[desk.id]) {
        fetchSessionTime(desk.id, desk.current_session_id);
      }
    });
  }, [desks]);

  const fetchSessionTime = async (deskId: number, sessionId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionData(prev => ({
          ...prev,
          [deskId]: data
        }));
      }
    } catch (err) {
      console.error('Failed to fetch session time', err);
    }
  };

  const filteredDesks = desks.filter((desk) => {
    const matchesSearch = desk.label.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || desk.status === statusFilter;
    const matchesZone = zoneFilter === 'All' || desk.zone === zoneFilter;
    const matchesFloor = floorFilter === 'All' || desk.floor.toString() === floorFilter;
    return matchesSearch && matchesStatus && matchesZone && matchesFloor;
  });

  const availableDesks = filteredDesks.filter(d => d.status === 'FREE');
  const zones = Array.from(new Set(desks.map(d => d.zone)));
  const floors = Array.from(new Set(desks.map(d => d.floor))).sort();

  const getElapsedTime = (deskId: number, status: string) => {
    const session = sessionData[deskId];
    if (!session) return null;

    const timeToUse = status === 'AWAY' && session.away_start_time 
      ? session.away_start_time 
      : session.start_time;
    
    const elapsed = Math.floor((Date.now() - new Date(timeToUse).getTime()) / (1000 * 60));
    
    if (elapsed < 60) return `${elapsed}m`;
    const hours = Math.floor(elapsed / 60);
    const mins = elapsed % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FREE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'OCCUPIED': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'AWAY': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ABANDONED': return 'bg-violet-100 text-violet-700 border-violet-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'FREE': return 'Available';
      case 'OCCUPIED': return 'Occupied';
      case 'AWAY': return 'Away';
      case 'ABANDONED': return 'Abandoned';
      default: return status;
    }
  };

  const handleReserve = (desk: Desk) => {
    if (desk.status !== 'FREE') return;
    navigate('/student/checkin', { state: { prefillDesk: desk.label } });
  };

  return (
    <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Find Available Seats
          </h1>
          <p className="mt-2 text-gray-600">
            Browse and reserve desks in real-time
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-xl">event_seat</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : availableDesks.length}</p>
                <p className="text-xs text-gray-600">Available Now</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-xl">refresh</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Auto-updating</p>
                <p className="text-xs text-gray-600">Live status every 5s</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-xl">search</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredDesks.length}</p>
                <p className="text-xs text-gray-600">Results Found</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Search desk number (e.g., A-12)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="FREE">Available Only</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="AWAY">Away</option>
              <option value="ABANDONED">Abandoned</option>
            </select>

            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all cursor-pointer"
            >
              <option value="All">All Zones</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>

            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all cursor-pointer"
            >
              <option value="All">All Floors</option>
              {floors.map(floor => (
                <option key={floor} value={floor}>Floor {floor}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setZoneFilter('All');
                setFloorFilter('All');
              }}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 font-medium transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">clear_all</span>
              Clear
            </button>
          </div>
        </div>

        {/* Desk Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading desks...</p>
            </div>
          </div>
        ) : filteredDesks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">search_off</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No desks found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDesks.map((desk) => {
              const elapsedTime = getElapsedTime(desk.id, desk.status);
              
              return (
              <div
                key={desk.id}
                className={`bg-white border-2 rounded-2xl p-6 shadow-sm transition-all ${
                  desk.status === 'FREE' 
                    ? 'hover:shadow-lg hover:-translate-y-1 border-emerald-200 hover:border-emerald-300 cursor-pointer' 
                    : 'border-gray-200'
                }`}
                onClick={() => desk.status === 'FREE' && handleReserve(desk)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {desk.label}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {desk.zone} · Floor {desk.floor}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    desk.status === 'FREE' ? 'bg-gradient-to-br from-emerald-400 to-green-500' :
                    desk.status === 'OCCUPIED' ? 'bg-gradient-to-br from-rose-400 to-red-500' :
                    desk.status === 'AWAY' ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                    'bg-gradient-to-br from-violet-400 to-purple-500'
                  }`}>
                    <span className="material-symbols-outlined text-white text-2xl">
                      {desk.status === 'FREE' ? 'event_seat' : 'person'}
                    </span>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${getStatusColor(desk.status)}`}>
                  <span className={`w-2 h-2 rounded-full bg-current ${desk.status === 'FREE' ? 'animate-pulse' : ''}`}></span>
                  {getStatusLabel(desk.status)}
                </div>

                {desk.status === 'FREE' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReserve(desk);
                    }}
                    className="w-full mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">bookmark_add</span>
                    Check In Here
                  </button>
                )}

                {desk.status === 'OCCUPIED' && (
                  <div className="mt-4 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium text-center flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    In Use {elapsedTime ? `· ${elapsedTime}` : ''}
                  </div>
                )}

                {desk.status === 'AWAY' && (
                  <div className="mt-4 px-4 py-2.5 rounded-xl bg-amber-50 text-amber-700 font-medium text-center flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">hourglass_empty</span>
                    Away {elapsedTime ? `· ${elapsedTime}` : ''}
                  </div>
                )}

                {desk.status === 'ABANDONED' && (
                  <div className="mt-4 px-4 py-2.5 rounded-xl bg-violet-50 text-violet-700 font-medium text-center flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">warning</span>
                    Needs Reset
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}

      </div>
    </div>
  );
}

