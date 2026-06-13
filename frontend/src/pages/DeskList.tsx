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
    <main className="flex-1 md:ml-64 p-lg md:p-xl max-w-container-max mx-auto mb-20 md:mb-0 overflow-y-auto">
      {/* Back Button */}
      <div className="mb-lg">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-xs text-primary hover:text-surface-tint transition-colors p-xs hover:bg-surface-container-high rounded-lg"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-label-bold text-label-bold">Back to Map</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg flex flex-col justify-between shadow-sm">
          <div>
            <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider mb-xs">Total Occupancy</p>
            <div className="flex items-end gap-sm">
              <h3 className="font-display-lg text-display-lg text-primary">{occupancy}%</h3>
              <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">{occupiedCount + awayCount + abandonedCount} / {totalDesks} Desks</span>
            </div>
          </div>
          <div className="mt-md w-full bg-surface-variant rounded-full h-2">
            <div className="bg-primary h-2 rounded-full shadow-[0_0_10px_rgba(53,37,205,0.5)]" style={{ width: `${occupancy}%` }}></div>
          </div>
        </div>

        <div className="bg-error-container/50 border border-error/30 rounded-2xl p-lg flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-error/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-label-bold text-label-bold text-error uppercase tracking-wider mb-xs">Abandoned Desks Flagged</p>
              <h3 className="font-display-lg text-display-lg text-error">{abandonedCount}</h3>
            </div>
            <span className="material-symbols-outlined text-error">warning</span>
          </div>
          {abandonedCount > 0 && (
            <button className="mt-md font-label-bold text-label-bold text-on-error bg-error hover:bg-error/90 transition-colors px-4 py-2 rounded-lg flex items-center justify-center gap-xs shadow-[0_4px_12px_rgba(186,26,26,0.3)] w-max relative z-10">
              Review all flagged <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          )}
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg flex flex-col justify-between shadow-sm">
          <div>
            <p className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider mb-xs">Active Timers</p>
            <div className="flex items-end gap-sm">
              <h3 className="font-display-lg text-display-lg text-primary">{awayCount}</h3>
              <span className="font-body-sm text-body-sm text-on-surface-variant mb-1">Students Away</span>
            </div>
          </div>
          <div className="mt-md flex gap-sm text-on-surface-variant font-label-bold text-label-bold">
            <span className="flex items-center gap-xs"><div className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-[0_0_6px_rgba(234,179,8,0.6)]"></div> {Math.ceil(awayCount * 0.66)} &lt; 15m</span>
            <span className="flex items-center gap-xs"><div className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_6px_rgba(249,115,22,0.6)]"></div> {Math.floor(awayCount * 0.34)} &gt; 15m</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="p-lg border-b border-outline-variant/50 flex justify-between items-center bg-surface-bright">
          <h2 className="font-headline-md text-headline-md text-on-surface">Desk Status Roster</h2>
          <div className="flex gap-sm">
            <button className="border border-outline-variant px-md py-sm rounded-lg font-label-bold text-label-bold text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-xs">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span> Filter
            </button>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
              <input
                className="pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Search Desk or ID..."
                type="text"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/50">
                <th className="px-lg py-sm font-label-bold text-label-bold text-on-surface-variant uppercase">Desk #</th>
                <th className="px-lg py-sm font-label-bold text-label-bold text-on-surface-variant uppercase">Status</th>
                <th className="px-lg py-sm font-label-bold text-label-bold text-on-surface-variant uppercase">Occupant ID</th>
                <th className="px-lg py-sm font-label-bold text-label-bold text-on-surface-variant uppercase">Last Activity</th>
                <th className="px-lg py-sm font-label-bold text-label-bold text-on-surface-variant uppercase">Timer</th>
                <th className="px-lg py-sm font-label-bold text-label-bold text-on-surface-variant uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-base text-body-base">
              {desks.map(desk => {
                const badge = getStatusBadge(desk.status);
                return (
                  <tr
                    key={desk.id}
                    className={`border-b border-outline-variant/30 table-row-hover transition-colors ${desk.status === 'ABANDONED' ? 'bg-error-container/10' : desk.status === 'AWAY' ? 'bg-surface-container-low/30' : ''}`}
                  >
                    <td className={`px-lg py-lg font-label-bold text-label-bold ${desk.status === 'FREE' ? 'text-on-surface-variant' : ''}`}>Floor 2 - {deskLabel(desk.number)}</td>
                    <td className="px-lg py-lg">
                      <span className={`inline-flex items-center gap-xs px-3 py-1.5 rounded-full font-label-bold text-label-bold ${badge.bg} ${badge.text}`}>
                        <div className={`w-2 h-2 rounded-full ${badge.dot}`}></div> {badge.label}
                      </span>
                    </td>
                    <td className={`px-lg py-lg font-mono text-sm ${desk.status === 'FREE' ? 'text-outline-variant' : 'text-on-surface-variant'}`}>
                      {desk.current_session_id ? `S-${desk.current_session_id.toString().padStart(6, '0')}` : '-'}
                    </td>
                    <td className={`px-lg py-lg ${desk.status === 'ABANDONED' ? 'text-error' : desk.status === 'FREE' ? 'text-outline-variant' : 'text-on-surface-variant'}`}>
                      {desk.status === 'FREE' ? '-' : desk.status === 'ABANDONED' ? '45 mins ago' : desk.status === 'AWAY' ? '18 mins ago' : '2 mins ago'}
                    </td>
                    <td className="px-lg py-lg">
                      {desk.status === 'AWAY' && (
                        <span className="font-mono-timer text-mono-timer text-[#854d0e] flex items-center gap-xs">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>timer</span> 12:05
                        </span>
                      )}
                      {desk.status === 'ABANDONED' && (
                        <span className="font-mono-timer text-mono-timer text-[#6b21a8] flex items-center gap-xs">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>update</span> +15:00
                        </span>
                      )}
                      {(desk.status === 'FREE' || desk.status === 'OCCUPIED') && (
                        <span className={desk.status === 'FREE' ? 'text-outline-variant' : 'text-on-surface-variant'}>-</span>
                      )}
                    </td>
                    <td className="px-lg py-lg text-right">
                      {desk.status === 'ABANDONED' && (
                        <div className="flex justify-end gap-sm">
                          <button className="border border-outline-variant px-md py-1.5 rounded-lg text-secondary font-label-bold text-label-bold hover:bg-surface-container-high transition-colors">Nudge</button>
                          <button onClick={() => handleReset(desk.id)} className="bg-error text-on-error px-md py-1.5 rounded-lg font-label-bold text-label-bold hover:bg-error/90 transition-colors shadow-sm">Manual Reset</button>
                        </div>
                      )}
                      {desk.status === 'AWAY' && (
                        <button className="border border-outline-variant px-md py-1.5 rounded-lg text-secondary font-label-bold text-label-bold hover:bg-surface-container-high transition-colors">Send Nudge</button>
                      )}
                      {(desk.status === 'OCCUPIED' || desk.status === 'FREE') && (
                        <button className={`p-sm ${desk.status === 'FREE' ? 'text-outline' : 'text-secondary'} hover:bg-surface-container-high rounded-lg transition-colors`} title="More Options">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-md flex justify-between items-center bg-surface-bright border-t border-outline-variant/50">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Showing 1-{desks.length} of {desks.length} results</span>
          <div className="flex gap-xs">
            <button className="p-xs border border-outline-variant rounded hover:bg-surface-container-low text-secondary disabled:opacity-50" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-xs border border-outline-variant rounded hover:bg-surface-container-low text-secondary">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
