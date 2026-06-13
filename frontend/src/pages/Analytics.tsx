import { useNavigate } from 'react-router-dom';

export default function Analytics() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 md:ml-64 relative overflow-auto">
      <div className="p-lg space-y-lg">
        <div className="flex items-center gap-md mb-md">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-xs text-primary hover:text-surface-tint transition-colors p-xs hover:bg-surface-container-high rounded-lg"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-label-bold text-label-bold">Back</span>
          </button>
        </div>
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface font-bold">Analytics & Insights</h1>
          <p className="font-body-base text-body-base text-on-surface-variant mt-sm">Track desk usage patterns and optimize your space allocation</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="bg-surface-container rounded-xl p-lg border border-outline-variant">
            <div className="flex items-center justify-between mb-md">
              <span className="font-label-bold text-label-bold text-on-surface-variant uppercase">Total Sessions Today</span>
              <span className="material-symbols-outlined text-primary">event_seat</span>
            </div>
            <p className="font-display-lg text-display-lg text-primary font-bold">247</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">↑ 12% from yesterday</p>
          </div>

          <div className="bg-surface-container rounded-xl p-lg border border-outline-variant">
            <div className="flex items-center justify-between mb-md">
              <span className="font-label-bold text-label-bold text-on-surface-variant uppercase">Avg Session Time</span>
              <span className="material-symbols-outlined text-secondary">schedule</span>
            </div>
            <p className="font-display-lg text-display-lg text-secondary font-bold">2h 34m</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">↓ 5% from last week</p>
          </div>

          <div className="bg-surface-container rounded-xl p-lg border border-outline-variant">
            <div className="flex items-center justify-between mb-md">
              <span className="font-label-bold text-label-bold text-on-surface-variant uppercase">Peak Occupancy</span>
              <span className="material-symbols-outlined text-tertiary">trending_up</span>
            </div>
            <p className="font-display-lg text-display-lg text-tertiary font-bold">89%</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">At 2:00 PM - 4:00 PM</p>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-surface-container rounded-xl p-lg border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Desk Utilization Over Time</h2>
          <div className="h-64 bg-surface-container-low rounded-lg flex items-center justify-center border border-outline-variant">
            <div className="text-center">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-sm">insert_chart</span>
              <p className="font-body-base text-body-base text-on-surface-variant">Chart visualization would appear here</p>
            </div>
          </div>
        </div>

        {/* Popular Desks */}
        <div className="bg-surface-container rounded-xl p-lg border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Most Popular Desks</h2>
          <div className="space-y-sm">
            {[
              { id: 'A-12', sessions: 45, avgTime: '3h 12m' },
              { id: 'B-08', sessions: 42, avgTime: '2h 58m' },
              { id: 'C-15', sessions: 38, avgTime: '3h 05m' },
              { id: 'A-03', sessions: 36, avgTime: '2h 45m' },
              { id: 'B-21', sessions: 34, avgTime: '2h 32m' },
            ].map((desk, index) => (
              <div key={desk.id} className="flex items-center justify-between p-sm bg-surface-container-low rounded-lg border border-outline-variant/50">
                <div className="flex items-center gap-md">
                  <span className="font-mono-timer text-mono-timer text-on-surface-variant w-8">#{index + 1}</span>
                  <span className="font-label-bold text-label-bold text-on-surface">Desk {desk.id}</span>
                </div>
                <div className="flex items-center gap-xl">
                  <div className="text-right">
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Sessions</p>
                    <p className="font-mono-timer text-mono-timer text-on-surface">{desk.sessions}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Avg Time</p>
                    <p className="font-mono-timer text-mono-timer text-on-surface">{desk.avgTime}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Abandonment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="bg-error-container/10 rounded-xl p-lg border border-error-container">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Abandonment Rate</h3>
            <p className="font-display-lg text-display-lg text-error font-bold mb-xs">8.4%</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">23 desks abandoned today (avg 15min+ away)</p>
          </div>

          <div className="bg-secondary-container/50 rounded-xl p-lg border border-outline-variant">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-md">Recovery Actions</h3>
            <p className="font-display-lg text-display-lg text-secondary font-bold mb-xs">18</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Desks released and reassigned after timeout</p>
          </div>
        </div>
      </div>
    </main>
  );
}
