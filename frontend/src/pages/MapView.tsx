import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Desk {
  id: number;
  number: number;
  status: 'FREE' | 'OCCUPIED' | 'AWAY' | 'ABANDONED';
  current_session_id: number | null;
}

export default function MapView() {
  const navigate = useNavigate();
  const [desks, setDesks] = useState<Desk[]>([]);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const fetchDesks = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/desks');
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
    // Removed unused _statuses variable
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
      await fetch('http://localhost:4000/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskId }),
      });
      fetchDesks();
    } catch (err) {
      console.error('Failed to reset desk', err);
    }
  };

  // Map panning
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

  const deskLabel = (num: number) => {
    if (num <= 4) return `A-${(11 + num).toString().padStart(2, '0')}`;
    return `B-${(num - 4).toString().padStart(2, '0')}`;
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
          className="flex items-center gap-2 bg-white text-primary hover:text-purple-600 transition-all px-3 py-2 rounded-xl shadow-sm border border-gray-200 hover:border-primary/40 hover:shadow-md group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
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
      >
        <div
          className="min-w-[900px] min-h-[700px] bg-white border border-gray-200 rounded-2xl p-8 relative shadow-sm"
        >
          {/* Main Hall Header with Stats */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-xl">home</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Main Hall</h3>
                <p className="text-sm text-gray-500">Quiet Zone A · Floor 2</p>
              </div>
            </div>

            {/* Inline Stats Badges */}
            <div className="flex gap-3">
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
                    <span className="font-label-bold text-[11px]">1h 45m</span>
                  </div>
                )}
                {desk.status === 'AWAY' && (
                  <div className={`flex items-center gap-1 mt-2 px-3 py-1 bg-amber-100 rounded-full ${getDeskTextClass(desk.status)}`}>
                    <span className="material-symbols-outlined text-[12px]">hourglass_empty</span>
                    <span className="font-label-bold text-[11px]">Away 12m</span>
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
                    <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">Click to Reserve</span>
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
          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/60 rounded-2xl p-5 border border-primary/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-label-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Available Now</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-lg text-5xl font-black text-primary">{freeCount}</span>
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
                    stroke="#6366f1" 
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - freeCount / totalDesks)}`}
                    className="transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{Math.round((freeCount / totalDesks) * 100)}%</span>
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
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-gray-400">more_vert</span>
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-body-sm text-body-sm text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    Session Started
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-bold">{selectedDesk.status !== 'FREE' ? '09:15 AM' : '-'}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-body-sm text-body-sm text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                    Duration
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-bold">{selectedDesk.status !== 'FREE' ? '1h 45m' : '-'}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-body-sm text-body-sm text-gray-600 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">person</span>
                    User Type
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-bold">{selectedDesk.status !== 'FREE' ? 'Undergraduate' : '-'}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {selectedDesk.status === 'ABANDONED' ? (
                  <>
                    <button className="flex-1 bg-white border-2 border-gray-200 text-primary py-2.5 rounded-xl font-label-bold text-label-bold hover:bg-gray-50 transition-all">
                      Flag Issue
                    </button>
                    <button onClick={() => handleReset(selectedDesk.id)} className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 text-white py-2.5 rounded-xl font-label-bold text-label-bold hover:opacity-90 transition-all shadow-lg">
                      Reset Now
                    </button>
                  </>
                ) : selectedDesk.status !== 'FREE' ? (
                  <>
                    <button className="flex-1 bg-white border-2 border-gray-200 text-primary py-2.5 rounded-xl font-label-bold text-label-bold hover:bg-gray-50 transition-all">
                      Flag Issue
                    </button>
                    <button className="flex-1 bg-gradient-to-r from-primary to-purple-600 text-white py-2.5 rounded-xl font-label-bold text-label-bold hover:opacity-90 transition-all shadow-lg">
                      End Session
                    </button>
                  </>
                ) : (
                  <button className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2.5 rounded-xl font-label-bold text-label-bold shadow-lg">
                    Available
                  </button>
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

        {/* Primary Action - Enhanced */}
        <div className="p-6 border-t border-gray-200 mt-auto">
          <Link to="/session" className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-4 rounded-2xl font-label-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg hover:shadow-xl">
            <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
            Scan to Check-in
          </Link>
          <p className="text-center text-xs text-gray-500 mt-3">Scan QR code at any available desk</p>
        </div>
      </aside>
    </main>
  );
}
