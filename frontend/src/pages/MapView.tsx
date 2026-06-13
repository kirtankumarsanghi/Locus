import { API_BASE_URL } from '../config';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

interface DeskDetail {
  desk: Desk;
  session: Session | null;
}

export default function MapView() {
  const navigate = useNavigate();
  const [desks, setDesks] = useState<Desk[]>([]);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [selectedDeskDetail, setSelectedDeskDetail] = useState<DeskDetail | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const fetchDesks = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/desks`);
      if (res.ok) {
        const data = await res.json();
        setDesks(data);
        // If a desk is selected, update its data
        if (selectedDesk) {
          const updated = data.find((d: Desk) => d.id === selectedDesk.id);
          if (updated) setSelectedDesk(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch desks', err);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  }, [selectedDesk]);

  // Fetch desk detail when a desk is selected
  const fetchDeskDetail = useCallback(async (deskId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/desks/${deskId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDeskDetail(data);
      }
    } catch (err) {
      console.error('Failed to fetch desk detail', err);
    }
  }, []);

  useEffect(() => {
    fetchDesks();
    const interval = setInterval(() => fetchDesks(), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedDesk) {
      fetchDeskDetail(selectedDesk.id);
    } else {
      setSelectedDeskDetail(null);
    }
  }, [selectedDesk, fetchDeskDetail]);

  const handleReset = async (deskId: number) => {
    if (!confirm('Are you sure you want to reset this desk? This will end any active session.')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId }),
      });
      
      if (res.ok) {
        setDesks(prevDesks => 
          prevDesks.map(desk => 
            desk.id === deskId 
              ? { ...desk, status: 'FREE' as const, current_session_id: null }
              : desk
          )
        );
        setSelectedDesk(null);
        setSelectedDeskDetail(null);
        alert('Desk reset successfully!');
        fetchDesks();
      } else {
        alert('Failed to reset desk. Please try again.');
      }
    } catch (err) {
      console.error('Failed to reset desk', err);
      alert('Network error. Please check your connection.');
    }
  };

  const handleEndSession = async (deskId: number) => {
    if (!confirm('End this session and free up the desk?')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/end-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId }),
      });
      
      if (res.ok) {
        setDesks(prevDesks => 
          prevDesks.map(desk => 
            desk.id === deskId 
              ? { ...desk, status: 'FREE' as const, current_session_id: null }
              : desk
          )
        );
        setSelectedDesk(null);
        setSelectedDeskDetail(null);
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

  const handleFlagIssue = (_deskId: number) => {
    const label = selectedDesk ? deskLabel(selectedDesk.number) : 'Unknown';
    const issue = prompt(`Describe the issue with Desk ${label}:`);
    if (issue) {
      alert(`Issue flagged for Desk ${label}: "${issue}"\n\nStaff will be notified.`);
    }
  };

  // Map panning with touch support
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!mapRef.current) return;
    setIsPanning(true);
    panStart.current = {
      x: e.pageX - mapRef.current.offsetLeft,
      y: e.pageY - mapRef.current.offsetTop,
      scrollLeft: mapRef.current.scrollLeft,
      scrollTop: mapRef.current.scrollTop,
    };
  };
  
  const handleMouseUp = () => setIsPanning(false);
  const handleMouseLeave = () => setIsPanning(false);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !mapRef.current) return;
    e.preventDefault();
    const x = e.pageX - mapRef.current.offsetLeft;
    const y = e.pageY - mapRef.current.offsetTop;
    mapRef.current.scrollLeft = panStart.current.scrollLeft - (x - panStart.current.x) * 1.5;
    mapRef.current.scrollTop = panStart.current.scrollTop - (y - panStart.current.y) * 1.5;
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!mapRef.current || e.touches.length === 0) return;
    setIsPanning(true);
    const touch = e.touches[0];
    panStart.current = {
      x: touch.pageX - mapRef.current.offsetLeft,
      y: touch.pageY - mapRef.current.offsetTop,
      scrollLeft: mapRef.current.scrollLeft,
      scrollTop: mapRef.current.scrollTop,
    };
  };

  const handleTouchEnd = () => setIsPanning(false);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || !mapRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const x = touch.pageX - mapRef.current.offsetLeft;
    const y = touch.pageY - mapRef.current.offsetTop;
    mapRef.current.scrollLeft = panStart.current.scrollLeft - (x - panStart.current.x) * 1.5;
    mapRef.current.scrollTop = panStart.current.scrollTop - (y - panStart.current.y) * 1.5;
  };

  const deskLabel = (num: number) => {
    if (num <= 4) return `A-${(11 + num).toString().padStart(2, '0')}`;
    return `B-${(num - 4).toString().padStart(2, '0')}`;
  };

  // Compute duration from a timestamp string
  const formatDuration = (isoStr: string | null | undefined) => {
    if (!isoStr) return '-';
    const start = new Date(isoStr + 'Z'); // SQLite stores UTC without Z
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    if (diffMs < 0) return '0m';
    const totalMin = Math.floor(diffMs / 60000);
    if (totalMin < 60) return `${totalMin}m`;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m}m`;
  };

  const formatTime = (isoStr: string | null | undefined) => {
    if (!isoStr) return '-';
    const d = new Date(isoStr + 'Z');
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const abandonedCount = desks.filter(d => d.status === 'ABANDONED').length;
  const awayCount = desks.filter(d => d.status === 'AWAY').length;
  const freeCount = desks.filter(d => d.status === 'FREE').length;
  const totalDesks = desks.length || 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FREE': return { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant', dot: 'bg-outline', label: 'Available' };
      case 'OCCUPIED': return { bg: 'bg-[#dcfce7]', text: 'text-[#166534]', dot: 'bg-[#166534]', label: 'Occupied' };
      case 'AWAY': return { bg: 'bg-[#fef9c3]', text: 'text-[#854d0e]', dot: 'bg-[#854d0e]', label: 'Away' };
      case 'ABANDONED': return { bg: 'bg-[#f3e8ff]', text: 'text-[#6b21a8]', dot: 'bg-[#6b21a8]', label: 'Abandoned' };
      default: return { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant', dot: 'bg-outline', label: status };
    }
  };

  const getDeskClasses = (desk: Desk) => {
    const base = 'w-28 h-28 border-2 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 relative group';
    switch (desk.status) {
      case 'FREE': 
        return `${base} bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300 hover:border-emerald-400 shadow-lg hover:shadow-emerald-200/50`;
      case 'OCCUPIED': 
        return `${base} bg-gradient-to-br from-rose-50 to-red-50 border-rose-300 ring-2 ring-primary/30 shadow-xl hover:shadow-rose-200/50`;
      case 'AWAY': 
        return `${base} bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 hover:border-amber-400 shadow-lg hover:shadow-amber-200/50`;
      case 'ABANDONED': 
        return `${base} bg-gradient-to-br from-violet-50 to-purple-50 border-violet-300 ring-2 ring-violet-400/40 shadow-xl hover:shadow-violet-200/50 animate-pulse`;
      default: 
        return `${base} bg-surface-container-highest border-outline-variant`;
    }
  };

  const getDeskTextClass = (status: string) => {
    switch (status) {
      case 'FREE': return 'text-emerald-700 font-bold';
      case 'OCCUPIED': return 'text-rose-700 font-bold';
      case 'AWAY': return 'text-amber-700 font-bold';
      case 'ABANDONED': return 'text-violet-700 font-bold';
      default: return 'text-on-surface-variant';
    }
  };

  // Get the session for the selected desk from the detail
  const session = selectedDeskDetail?.session || null;

  return (
    <main className="flex-1 flex flex-col md:flex-row md:ml-64 relative bg-transparent overflow-hidden">
      {/* Enhanced Contextual Alert Banner */}
      {(abandonedCount > 0 || awayCount > 0) && (
        <div className="fixed top-20 left-0 md:left-64 right-0 md:right-96 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-3 flex justify-between items-center z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-lg">warning</span>
            </div>
            <div>
              <p className="font-semibold text-xs text-amber-900 uppercase tracking-wide">Attention Required</p>
              <p className="text-sm text-amber-800 font-medium">
                {abandonedCount > 0 
                  ? `${abandonedCount} desk${abandonedCount === 1 ? '' : 's'} flagged as abandoned` 
                  : `${awayCount} desk${awayCount === 1 ? '' : 's'} require verification`}
              </p>
            </div>
          </div>
          <Link 
            to="/list" 
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            Review All
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* Enhanced Back to Landing Button */}
      <div className={`fixed ${(abandonedCount > 0 || awayCount > 0) ? 'top-[136px]' : 'top-24'} left-6 md:left-[17rem] z-30 transition-all duration-300`}>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-white text-slate-700 hover:text-slate-900 transition-all px-3 py-2 rounded-xl shadow-sm border border-gray-200 hover:border-slate-400 hover:shadow-md group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-white text-base">home</span>
          </div>
          <span className="font-semibold text-sm hidden md:inline text-gray-800">Home</span>
        </button>
      </div>

      {/* Interactive Map Container */}
      <div
        ref={mapRef}
        className={`flex-1 relative overflow-auto p-6 ${(abandonedCount > 0 || awayCount > 0) ? 'pt-24' : 'pt-6'} transition-all duration-300 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'} bg-gray-50`}
        id="map-container"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div
          className="min-w-[900px] min-h-[700px] bg-white border border-gray-200 rounded-2xl p-8 relative shadow-sm"
        >
          {/* Main Hall Header with Stats */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-xl">home</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Main Hall</h3>
                <p className="text-sm text-gray-500">Quiet Zone A · Floor 2</p>
              </div>
            </div>

            {/* Inline Stats Badges */}
            <div className="flex gap-3 items-center">
              <button
                onClick={() => fetchDesks(true)}
                disabled={isRefreshing}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm hover:border-slate-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Refresh desk status"
              >
                <span className={`material-symbols-outlined text-slate-700 text-lg ${isRefreshing ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold text-emerald-700">{freeCount} Available</span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-sm font-semibold text-rose-700">{desks.filter(d => d.status === 'OCCUPIED').length} In Use</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desk Grid with Better Layout */}
          <div className="absolute top-28 left-8 right-8 grid grid-cols-4 gap-6 justify-items-center">
            {desks.map((desk, idx) => (
              <div
                key={desk.id}
                onClick={() => setSelectedDesk(desk)}
                className={`${getDeskClasses(desk)} ${idx >= 4 ? 'mt-4' : ''}`}
                role="button"
                aria-label={`Desk ${deskLabel(desk.number)} - ${desk.status}`}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDesk(desk);
                  }
                }}
              >
                {/* Desk Icon */}
                <div className="absolute -top-3 -right-3">
                  <span className={`material-symbols-outlined text-2xl ${getDeskTextClass(desk.status)}`}>
                    {desk.status === 'FREE' ? 'event_seat' : desk.status === 'ABANDONED' ? 'error' : 'person'}
                  </span>
                </div>

                {/* Desk Label */}
                <span className={`font-mono-timer text-xl ${getDeskTextClass(desk.status)} tracking-tight`}>
                  {deskLabel(desk.number)}
                </span>

                {/* Status Info */}
                {desk.status === 'OCCUPIED' && (
                  <div className={`flex items-center gap-1 mt-2 px-3 py-1 bg-rose-100 rounded-full ${getDeskTextClass(desk.status)}`}>
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    <span className="font-label-bold text-[11px]">{formatDuration(desk.updated_at)}</span>
                  </div>
                )}
                {desk.status === 'AWAY' && (
                  <div className={`flex items-center gap-1 mt-2 px-3 py-1 bg-amber-100 rounded-full ${getDeskTextClass(desk.status)}`}>
                    <span className="material-symbols-outlined text-[12px]">hourglass_empty</span>
                    <span className="font-label-bold text-[11px]">Away {formatDuration(desk.updated_at)}</span>
                  </div>
                )}
                {desk.status === 'ABANDONED' && (
                  <div className={`flex items-center gap-1 mt-2 px-3 py-1 bg-violet-100 rounded-full ${getDeskTextClass(desk.status)}`}>
                    <span className="material-symbols-outlined text-[12px]">warning</span>
                    <span className="font-label-bold text-[11px]">Flagged</span>
                  </div>
                )}
                {desk.status === 'FREE' && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-500/10 rounded-2xl">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Click to select</span>
                  </div>
                )}

                {/* Selected Indicator */}
                {selectedDesk?.id === desk.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Floating Legend */}
        <div className="absolute bottom-6 left-6 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Legend</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-400 to-green-500 shadow-sm"></div>
              <span className="text-sm text-gray-700 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-rose-400 to-red-500 shadow-sm"></div>
              <span className="text-sm text-gray-700 font-medium">Occupied</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-400 to-yellow-500 shadow-sm"></div>
              <span className="text-sm text-gray-700 font-medium">Away</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-violet-400 to-purple-500 shadow-sm"></div>
              <span className="text-sm text-gray-700 font-medium">Abandoned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Sidebar (Right Panel) */}
      <aside className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col z-20 shadow-sm">
        {/* Floor Stats - Enhanced */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-label-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Available Now</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-lg text-5xl font-black text-slate-700">{freeCount}</span>
                  <span className="text-2xl text-gray-400 font-medium">/ {totalDesks}</span>
                </div>
              </div>
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    stroke="#334155" 
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - freeCount / totalDesks)}`}
                    className="transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-700">{Math.round((freeCount / totalDesks) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Desk Details - Enhanced */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col">
          {selectedDesk ? (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${
                      selectedDesk.status === 'FREE' ? 'bg-gradient-to-br from-emerald-400 to-green-500' :
                      selectedDesk.status === 'OCCUPIED' ? 'bg-gradient-to-br from-rose-400 to-red-500' :
                      selectedDesk.status === 'AWAY' ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                      'bg-gradient-to-br from-violet-400 to-purple-500'
                    } flex items-center justify-center shadow-md`}>
                      <span className="material-symbols-outlined text-white text-sm">event_seat</span>
                    </div>
                    <h4 className="font-headline-md text-2xl text-on-surface font-bold">{deskLabel(selectedDesk.number)}</h4>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm font-label-bold text-xs uppercase ${getStatusBadge(selectedDesk.status).bg} ${getStatusBadge(selectedDesk.status).text} border-2 ${
                    selectedDesk.status === 'FREE' ? 'border-emerald-200' :
                    selectedDesk.status === 'OCCUPIED' ? 'border-rose-200' :
                    selectedDesk.status === 'AWAY' ? 'border-amber-200' :
                    'border-violet-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${getStatusBadge(selectedDesk.status).dot} animate-pulse`}></span>
                    {getStatusBadge(selectedDesk.status).label}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedDesk(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-gray-400">close</span>
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-body-sm text-body-sm text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">badge</span>
                    Student ID
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-bold">
                    {session?.student_id || '-'}
                  </span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-body-sm text-body-sm text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    Session Started
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-bold">
                    {session ? formatTime(session.start_time) : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-body-sm text-body-sm text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                    Duration
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-bold">
                    {session ? formatDuration(session.start_time) : '-'}
                  </span>
                </div>
                {session?.away_start_time && (
                  <div className="flex justify-between py-2 px-3 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="font-body-sm text-body-sm text-amber-700 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">directions_walk</span>
                      Away Since
                    </span>
                    <span className="font-body-sm text-body-sm text-amber-800 font-bold">
                      {formatTime(session.away_start_time)} ({formatDuration(session.away_start_time)})
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-body-sm text-body-sm text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Zone / Floor
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-bold">
                    Zone {selectedDesk.zone} · Floor {selectedDesk.floor}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {selectedDesk.status === 'ABANDONED' ? (
                  <>
                    <button 
                      onClick={() => handleFlagIssue(selectedDesk.id)} 
                      className="flex-1 bg-white border-2 border-gray-200 text-primary py-2.5 rounded-xl font-label-bold text-label-bold hover:bg-gray-50 transition-all"
                    >
                      Flag Issue
                    </button>
                    <button 
                      onClick={() => handleReset(selectedDesk.id)} 
                      className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 text-white py-2.5 rounded-xl font-label-bold text-label-bold hover:opacity-90 transition-all shadow-lg"
                    >
                      Reset Now
                    </button>
                  </>
                ) : selectedDesk.status !== 'FREE' ? (
                  <>
                    <button 
                      onClick={() => handleFlagIssue(selectedDesk.id)} 
                      className="flex-1 bg-white border-2 border-gray-200 text-slate-700 py-2.5 rounded-xl font-label-bold text-label-bold hover:bg-gray-50 transition-all"
                    >
                      Flag Issue
                    </button>
                    <button 
                      onClick={() => handleEndSession(selectedDesk.id)} 
                      className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 text-white py-2.5 rounded-xl font-label-bold text-label-bold hover:opacity-90 transition-all shadow-lg"
                    >
                      End Session
                    </button>
                  </>
                ) : (
                  <p className="flex-1 text-center text-sm text-gray-500 py-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="font-semibold text-emerald-700">This desk is available</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 mb-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-primary/10">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '64px' }}>touch_app</span>
              </div>
              <h3 className="font-headline-md text-xl text-gray-800 font-bold mb-2">Select a desk on the map</h3>
              <p className="font-body-sm text-sm text-gray-500">Click any desk to view details</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="p-6 border-t border-gray-200 mt-auto">
          <Link 
            to="/list" 
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 text-white py-4 rounded-2xl font-label-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            <span className="material-symbols-outlined text-xl">list_alt</span>
            View All Desks
          </Link>
          <p className="text-center text-xs text-gray-500 mt-3">See detailed desk list with search & filters</p>
        </div>
      </aside>
    </main>
  );
}
