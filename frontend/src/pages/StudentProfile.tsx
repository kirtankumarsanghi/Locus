
import { currentUser, recentCheckins } from '../data/mockStudent';

export default function StudentProfile() {
  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">

        {/* Page Header */}
        <h1 className="text-3xl font-bold">
          Student Profile
        </h1>

        <p className="mt-2 text-on-surface-variant">
          Track your study progress and library activity.
        </p>

        {/* Hero Profile Card */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8 shadow-xl">
          <div className="flex items-center gap-6">

            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {currentUser.name.charAt(0)}
            </div>

            <div>
              <h2 className="text-3xl font-bold">
                {currentUser.name}
              </h2>

              <p className="opacity-90 mt-1">
                Student ID: {currentUser.studentId}
              </p>

              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  Active Member
                </span>

                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  Study Streak 🔥 12 Days
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">

          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm hover:shadow-lg transition-all">
            <span className="material-symbols-outlined text-primary text-4xl">
              schedule
            </span>

            <h3 className="mt-4 text-sm uppercase text-on-surface-variant">
              Total Study Hours
            </h3>

            <p className="text-4xl font-bold text-primary mt-2">
              {currentUser.totalHours}h
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm hover:shadow-lg transition-all">
            <span className="material-symbols-outlined text-green-600 text-4xl">
              timer
            </span>

            <h3 className="mt-4 text-sm uppercase text-on-surface-variant">
              Active Session
            </h3>

            <p className="text-3xl font-bold text-green-600 mt-2">
              Active
            </p>

            <p className="mt-2 text-sm text-on-surface-variant">
              Desk {currentUser.activeDesk}
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm hover:shadow-lg transition-all">
            <span className="material-symbols-outlined text-orange-500 text-4xl">
              login
            </span>

            <h3 className="mt-4 text-sm uppercase text-on-surface-variant">
              Check-ins
            </h3>

            <p className="text-4xl font-bold mt-2">
              {currentUser.checkIns}
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm hover:shadow-lg transition-all">
            <span className="material-symbols-outlined text-purple-500 text-4xl">
              local_fire_department
            </span>

            <h3 className="mt-4 text-sm uppercase text-on-surface-variant">
              Study Streak
            </h3>

            <p className="text-4xl font-bold mt-2">
              12
            </p>

            <p className="text-sm text-on-surface-variant">
              consecutive days
            </p>
          </div>

        </div>

        {/* Progress */}
        <div className="mt-8 bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
          <div className="flex justify-between mb-3">
            <h2 className="text-xl font-semibold">
              Semester Goal
            </h2>

            <span className="font-medium">
              124 / 200 Hours
            </span>
          </div>

          <div className="w-full h-4 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
              style={{ width: '62%' }}
            />
          </div>

          <p className="mt-3 text-sm text-on-surface-variant">
            You're 62% toward your semester study goal.
          </p>
        </div>

        {/* Achievements */}
        <div className="mt-8 bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Achievements
          </h2>

          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700">
              🏆 100+ Study Hours
            </span>

            <span className="px-4 py-2 rounded-full bg-green-100 text-green-700">
              🔥 10 Day Streak
            </span>

            <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700">
              📚 Library Regular
            </span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6">
            Recent Check-ins
          </h2>

          <div className="space-y-4">
            {recentCheckins.map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center border rounded-xl p-4 hover:bg-surface-container-low transition-all"
              >
                <div>
                  <h3 className="font-semibold">
                    Desk {entry.desk}
                  </h3>

                  <p className="text-sm text-on-surface-variant">
                    {entry.date}
                  </p>
                </div>

                <span className="font-medium">
                  {entry.duration}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

