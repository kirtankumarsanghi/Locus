import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Analytics() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('today');

  return (
    <main className="flex-1 md:ml-64 mb-20 md:mb-0 overflow-y-auto bg-gray-50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-all mb-6 group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-semibold">Back</span>
      </button>

      {/* Header with Time Range Selector */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
          <p className="text-gray-600 text-lg">See what's working and what needs attention 📊</p>
        </div>
        <div className="flex gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {['today', 'week', 'month'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid - More Natural */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Sessions Today</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-700">247</span>
                <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  12%
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">vs yesterday</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-xl">event_seat</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 h-full rounded-full transition-all duration-500" style={{ width: '67%' }}></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">Avg Session</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-amber-600">2h 34m</span>
                <span className="text-sm font-semibold text-rose-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">trending_down</span>
                  5%
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">slightly shorter</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-xl">schedule</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-amber-700">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              Quick (1-2h)
            </div>
            <div className="flex items-center gap-1.5 text-orange-700">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              Long (2h+)
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">Peak Time</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-600">89%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">2:00 PM - 4:00 PM</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-xl">trending_up</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
            <span className="font-bold">Pro tip:</span> Add more desks during this window
          </p>
        </div>
      </div>

      {/* Chart Placeholder - More Engaging */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Desk Usage Over Time</h2>
            <p className="text-sm text-gray-500 mt-1">Hourly breakdown of occupancy</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm hover:shadow-md transition-all">
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
        </div>
        <div className="h-72 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl flex items-center justify-center border border-dashed border-gray-300">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '48px' }}>insert_chart</span>
            </div>
            <p className="text-gray-600 font-medium mb-2">Chart visualization goes here</p>
            <p className="text-sm text-gray-400">Connect a charting library like Chart.js or Recharts</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Popular Desks - Left Column */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Most Popular Desks</h2>
              <p className="text-sm text-gray-500 mt-1">Highest traffic this {timeRange}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-lg">star</span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { id: 'A-12', sessions: 45, avgTime: '3h 12m', rank: 1 },
              { id: 'B-08', sessions: 42, avgTime: '2h 58m', rank: 2 },
              { id: 'C-15', sessions: 38, avgTime: '3h 05m', rank: 3 },
              { id: 'A-03', sessions: 36, avgTime: '2h 45m', rank: 4 },
              { id: 'B-21', sessions: 34, avgTime: '2h 32m', rank: 5 },
            ].map((desk) => (
              <div key={desk.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-slate-300 hover:bg-slate-50 transition-all group">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-md ${
                  desk.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                  desk.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                  desk.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-amber-600' :
                  'bg-gradient-to-br from-slate-700 to-slate-800'
                }`}>
                  {desk.rank === 1 && <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>}
                  {desk.rank !== 1 && `#${desk.rank}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">Desk {desk.id}</p>
                  <p className="text-xs text-gray-500">Zone {desk.id.split('-')[0]}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{desk.sessions} visits</p>
                  <p className="text-xs text-gray-500 font-mono">{desk.avgTime} avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Overview - Right Column */}
        <div className="space-y-6">
          {/* Abandonment */}
          <div className="bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-200 rounded-2xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Abandonment Rate</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-rose-600">8.4%</span>
                  <span className="text-sm text-gray-600">this {timeRange}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-xl">error</span>
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-3 border border-rose-200">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-rose-700">23 desks</span> left unattended for 15+ min today
              </p>
            </div>
          </div>

          {/* Recovery */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Recovery Actions</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-emerald-600">18</span>
                  <span className="text-sm text-gray-600">desks freed up</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-xl">check_circle</span>
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-3 border border-emerald-200">
              <p className="text-sm text-gray-700">
                Auto-released and reassigned after timeout ✨
              </p>
            </div>
          </div>

          {/* Quick Insight */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-2xl">lightbulb</span>
                <h3 className="font-bold text-lg">Quick Insight</h3>
              </div>
              <p className="text-white/90 leading-relaxed">
                Desks near windows are <span className="font-bold">2.3x more popular</span>. Consider moving less-used desks to those spots.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
