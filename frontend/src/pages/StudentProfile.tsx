import { Link } from 'react-router-dom';
import { currentUser, recentCheckins } from '../data/mockStudent';

export default function StudentProfile() {
  return (
    <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-6">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Profile
            </h1>
            <p className="mt-2 text-gray-600">
              Track your study progress and library activity
            </p>
          </div>
          <Link
            to="/student"
            className="px-6 py-3 rounded-xl bg-white border-2 border-gray-200 text-slate-700 font-semibold hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Dashboard
          </Link>
        </div>

        {/* Hero Profile Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-white p-8 shadow-xl border border-slate-600 mb-8">
          <div className="flex items-center gap-6">

            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold border border-white/30 shadow-lg">
              {currentUser.name.charAt(0)}
            </div>

            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {currentUser.name}
              </h2>

              <p className="opacity-90 text-lg mb-3">
                Student ID: {currentUser.studentId}
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                  ✓ Active Member
                </span>

                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                  🔥 Study Streak · 12 Days
                </span>

                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                  🏆 Top Performer
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-white text-2xl">schedule</span>
            </div>

            <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">
              Total Study Hours
            </h3>

            <p className="text-4xl font-bold text-slate-700">
              {currentUser.totalHours}h
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-white text-2xl">check_circle</span>
            </div>

            <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">
              Active Session
            </h3>

            <p className="text-3xl font-bold text-emerald-600 mb-1">
              Active
            </p>

            <p className="text-sm text-gray-600">
              Desk {currentUser.activeDesk}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-white text-2xl">login</span>
            </div>

            <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">
              Check-ins
            </h3>

            <p className="text-4xl font-bold text-gray-900">
              {currentUser.checkIns}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-white text-2xl">local_fire_department</span>
            </div>

            <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">
              Study Streak
            </h3>

            <p className="text-4xl font-bold text-gray-900 mb-1">
              12
            </p>

            <p className="text-sm text-gray-600">
              consecutive days
            </p>
          </div>

        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700">trending_up</span>
              Semester Goal Progress
            </h2>

            <span className="text-2xl font-bold text-slate-700">
              124 / 200 Hours
            </span>
          </div>

          <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200">
            <div
              className="h-full bg-gradient-to-r from-slate-700 to-slate-800 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: '62%' }}
            />
          </div>

          <p className="mt-3 text-sm text-gray-600">
            You're <span className="font-bold text-slate-700">62%</span> toward your semester study goal. Keep it up!
          </p>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">emoji_events</span>
            Achievements
          </h2>

          <div className="flex flex-wrap gap-3">
            <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 text-yellow-800 font-semibold flex items-center gap-2 shadow-sm">
              <span className="text-2xl">🏆</span>
              <span>100+ Study Hours</span>
            </div>

            <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 text-green-800 font-semibold flex items-center gap-2 shadow-sm">
              <span className="text-2xl">🔥</span>
              <span>10 Day Streak</span>
            </div>

            <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-800 font-semibold flex items-center gap-2 shadow-sm">
              <span className="text-2xl">📚</span>
              <span>Library Regular</span>
            </div>

            <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 text-purple-800 font-semibold flex items-center gap-2 shadow-sm">
              <span className="text-2xl">⭐</span>
              <span>Early Bird</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">history</span>
            Recent Check-ins
          </h2>

          <div className="space-y-3">
            {recentCheckins.map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold shadow-sm">
                    {entry.desk}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Desk {entry.desk}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {entry.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                  <span className="material-symbols-outlined text-slate-700 text-lg">schedule</span>
                  <span className="font-bold text-slate-700">{entry.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

