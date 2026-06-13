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
    }
  };

  useEffect(() => {
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
    const base = 'w-24 h-24 border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_2px_5px_rgba(0,0,0,0.05)]';
    switch (desk.status) {
      case 'FREE': return `${base} bg-status-available border-green-200`;
      case 'OCCUPIED': return `${base} bg-status-occupied border-red-200 ring-2 ring-primary shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_10px_rgba(0,0,0,0.1)]`;
      case 'AWAY': return `${base} bg-status-away border-yellow-200`;
      case 'ABANDONED': return `${base} bg-[#f3e8ff] border-purple-200`;
      default: return `${base} bg-surface-container-highest border-outline-variant`;
    }
  };

  const getDeskTextClass = (status: string) => {
    switch (status) {
      case 'FREE': return 'text-on-status-available';
      case 'OCCUPIED': return 'text-on-status-occupied';
      case 'AWAY': return 'text-on-status-away';
      case 'ABANDONED': return 'text-[#6b21a8]';
      default: return 'text-on-surface-variant';
    }
  };

  return (
    <main className="flex-1 flex flex-col md:flex-row md:ml-64 relative bg-transparent overflow-hidden">
      {/* Back to Landing Button */}
      <div className="absolute top-4 left-4 z-40">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-xs bg-surface/90 backdrop-blur-md text-primary hover:text-surface-tint transition-colors px-md py-sm rounded-lg shadow-md border border-outline-variant hover:bg-surface"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-bold text-label-bold hidden md:inline">Home</span>
        </button>
      </div>

      {/* Contextual Alert Banner */}
      {(abandonedCount > 0 || awayCount > 0) && (
        <div className="absolute top-0 left-0 w-full bg-status-away/90 backdrop-blur-md text-on-status-away px-lg py-sm flex justify-between items-center z-30 shadow-md border-b border-yellow-200">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined">warning</span>
            <span className="font-body-sm text-body-sm font-semibold">
              {abandonedCount > 0 ? `${abandonedCount} Desks flagged as abandoned` : `${awayCount} Desks require verification (Away > 30m)`}
            </span>
          </div>
          <Link to="/list" className="font-label-bold text-label-bold underline">Review</Link>
        </div>
      )}

      {/* Interactive Map Container */}
      <div
        ref={mapRef}
        className={`flex-1 relative overflow-auto p-lg pt-xl ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        id="map-container"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div
          className="min-w-[800px] min-h-[600px] bg-white/60 backdrop-blur-xl border border-outline-variant rounded-2xl p-lg relative shadow-xl"
          style={{ backgroundImage: 'radial-gradient(#e4e1ee 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        >
          <h3 className="absolute top-lg left-lg font-headline-md text-headline-md text-on-surface-variant opacity-50">Main Hall - Quiet Zone A</h3>

          {/* Desk Grid */}
          <div className="absolute top-24 left-24 grid grid-cols-4 gap-lg">
            {desks.map((desk, idx) => (
              <div
                key={desk.id}
                onClick={() => setSelectedDesk(desk)}
                className={`${getDeskClasses(desk)} ${idx >= 4 ? 'mt-lg' : ''}`}
              >
                <span className={`font-mono-timer text-mono-timer ${getDeskTextClass(desk.status)}`}>
                  {deskLabel(desk.number)}
                </span>
                {desk.status === 'OCCUPIED' && (
                  <div className={`flex items-center gap-1 mt-1 ${getDeskTextClass(desk.status)}`}>
                    <span className="material-symbols-outlined text-[14px]">timer</span>
                    <span className="font-label-bold text-[10px]">1h 45m</span>
                  </div>
                )}
                {desk.status === 'AWAY' && (
                  <div className={`flex items-center gap-1 mt-1 ${getDeskTextClass(desk.status)}`}>
                    <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                    <span className="font-label-bold text-[10px]">12:00</span>
                  </div>
                )}
                {desk.status === 'FREE' && (
                  <div className="absolute bottom-1 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white/90 backdrop-blur-sm text-xs px-2 py-0.5 rounded shadow-sm">Select</span>
                  </div>
                )}
                {selectedDesk?.id === desk.id && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-sm"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Legend */}
        <div className="absolute bottom-lg left-lg bg-white/70 backdrop-blur-md border border-outline-variant p-sm rounded-xl shadow-xl flex gap-md">
          <div className="flex items-center gap-xs"><div className="w-3 h-3 rounded-full bg-status-available shadow-inner"></div><span className="font-label-bold text-label-bold text-on-surface-variant">Available</span></div>
          <div className="flex items-center gap-xs"><div className="w-3 h-3 rounded-full bg-status-occupied shadow-inner"></div><span className="font-label-bold text-label-bold text-on-surface-variant">Occupied</span></div>
          <div className="flex items-center gap-xs"><div className="w-3 h-3 rounded-full bg-status-away shadow-inner"></div><span className="font-label-bold text-label-bold text-on-surface-variant">Away</span></div>
        </div>
      </div>

      {/* Info Sidebar (Right Panel) */}
      <aside className="w-full md:w-80 bg-surface/90 backdrop-blur-xl border-l border-outline-variant flex flex-col z-20 shadow-2xl">
        {/* Floor Stats */}
        <div className="p-lg border-b border-outline-variant bg-surface-container-lowest/50">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Main Hall Overview</h3>
          <div className="flex justify-between items-center mt-sm">
            <div>
              <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Available Desks</p>
              <p className="font-display-lg text-display-lg text-primary">{freeCount} <span className="text-lg font-normal text-on-surface-variant">/ {totalDesks}</span></p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-status-available bg-white shadow-sm flex items-center justify-center">
              <span className="font-label-bold text-label-bold">{Math.round((freeCount / totalDesks) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Selected Desk Details */}
        <div className="flex-1 p-lg overflow-y-auto">
          {selectedDesk ? (
            <div className="bg-surface-container-low/80 backdrop-blur-sm rounded-xl p-md border border-outline-variant shadow-md">
              <div className="flex justify-between items-start mb-md">
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-surface">Desk {deskLabel(selectedDesk.number)}</h4>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm font-label-bold text-[10px] uppercase mt-xs ${getStatusBadge(selectedDesk.status).bg} ${getStatusBadge(selectedDesk.status).text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(selectedDesk.status).dot}`}></span> {getStatusBadge(selectedDesk.status).label}
                  </span>
                </div>
                <button className="text-secondary hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              <div className="space-y-sm mb-lg">
                <div className="flex justify-between py-xs border-b border-outline-variant/50">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Session Started</span>
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">{selectedDesk.status !== 'FREE' ? '09:15 AM' : '-'}</span>
                </div>
                <div className="flex justify-between py-xs border-b border-outline-variant/50">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Current Duration</span>
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">{selectedDesk.status !== 'FREE' ? '1h 45m' : '-'}</span>
                </div>
                <div className="flex justify-between py-xs border-b border-outline-variant/50">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">User Type</span>
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">{selectedDesk.status !== 'FREE' ? 'Undergraduate' : '-'}</span>
                </div>
              </div>
              <div className="flex gap-sm">
                {selectedDesk.status === 'ABANDONED' ? (
                  <>
                    <button className="flex-1 bg-surface border border-outline-variant text-on-surface py-2 rounded-lg font-label-bold text-label-bold hover:bg-surface-container-high transition-colors shadow-sm">Flag Issue</button>
                    <button onClick={() => handleReset(selectedDesk.id)} className="flex-1 bg-error text-on-error py-2 rounded-lg font-label-bold text-label-bold hover:bg-error/90 transition-colors shadow-md">Manual Reset</button>
                  </>
                ) : selectedDesk.status !== 'FREE' ? (
                  <>
                    <button className="flex-1 bg-surface border border-outline-variant text-on-surface py-2 rounded-lg font-label-bold text-label-bold hover:bg-surface-container-high transition-colors shadow-sm">Flag Issue</button>
                    <button className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-label-bold text-label-bold hover:opacity-90 transition-opacity shadow-md">End Session</button>
                  </>
                ) : (
                  <button className="flex-1 bg-surface border border-outline-variant text-on-surface-variant py-2 rounded-lg font-label-bold text-label-bold cursor-default">Available</button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-on-surface-variant mt-16">
              <span className="material-symbols-outlined text-outline mb-2" style={{ fontSize: '48px' }}>touch_app</span>
              <p className="font-body-sm text-body-sm">Select a desk on the map to view details</p>
            </div>
          )}
        </div>

        {/* Primary Action */}
        <div className="p-md border-t border-outline-variant bg-surface-container-lowest/50">
          <Link to="/session" className="w-full bg-primary-container text-on-primary-container py-3 rounded-xl font-label-bold text-label-bold flex items-center justify-center gap-sm hover:opacity-90 transition-opacity shadow-md hover:shadow-lg">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            Scan to Check-in
          </Link>
        </div>
      </aside>
    </main>
  );
}
