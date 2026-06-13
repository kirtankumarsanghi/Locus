
import { Link } from 'react-router-dom';
import { currentUser } from '../data/mockStudent';

export default function StudentDashboard() {
  return (
    <main className="flex-1 overflow-y-auto p-6 md:ml-64">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">
              Student Dashboard
            </h1>

            <p className="mt-2 text-on-surface-variant">
              Welcome back. Here's your study session overview.
            </p>
          </div>

          <Link
            to="/student/profile"
            className="px-5 py-3 rounded-xl bg-primary text-white font-medium text-center"
          >
            My Profile
          </Link>
        </div>

        {/* Welcome Banner */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8 shadow-xl">
          <h2 className="text-2xl font-bold">
            Welcome Back, {currentUser.name}
          </h2>

          <p className="mt-2 opacity-90">
            Current Desk: {currentUser.activeDesk}
          </p>

          <p className="opacity-90">
            Total Study Hours: {currentUser.totalHours}h
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm hover:shadow-lg transition-all">
            <span className="material-symbols-outlined text-primary text-4xl">
              chair
            </span>

            <h3 className="mt-4 text-sm uppercase text-on-surface-variant">
              Current Desk
            </h3>

            <p className="text-4xl font-bold text-primary mt-2">
              {currentUser.activeDesk}
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm hover:shadow-lg transition-all">
            <span className="material-symbols-outlined text-green-600 text-4xl">
              timer
            </span>

            <h3 className="mt-4 text-sm uppercase text-on-surface-variant">
              Session Status
            </h3>

            <p className="text-4xl font-bold text-green-600 mt-2">
              Active
            </p>

            <p className="mt-2 text-on-surface-variant">
              1h 24m elapsed
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm hover:shadow-lg transition-all">
            <span className="material-symbols-outlined text-blue-600 text-4xl">
              groups
            </span>

            <h3 className="mt-4 text-sm uppercase text-on-surface-variant">
              Library Occupancy
            </h3>

            <p className="text-4xl font-bold mt-2">
              72%
            </p>

            <p className="mt-2 text-on-surface-variant">
              144 / 200 seats occupied
            </p>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Link
              to="/student/checkin"
              className="p-6 rounded-2xl border border-outline-variant bg-surface hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <span className="material-symbols-outlined text-primary text-4xl">
                qr_code_scanner
              </span>

              <h3 className="font-semibold text-lg mt-4">
                Check In
              </h3>

              <p className="text-sm text-on-surface-variant mt-2">
                Start a new study session
              </p>
            </Link>

            <Link
              to="/student/seats"
              className="p-6 rounded-2xl border border-outline-variant bg-surface hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <span className="material-symbols-outlined text-primary text-4xl">
                event_seat
              </span>

              <h3 className="font-semibold text-lg mt-4">
                Find Seats
              </h3>

              <p className="text-sm text-on-surface-variant mt-2">
                Browse available desks
              </p>
            </Link>

            <Link
              to="/student/profile"
              className="p-6 rounded-2xl border border-outline-variant bg-surface hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <span className="material-symbols-outlined text-primary text-4xl">
                account_circle
              </span>

              <h3 className="font-semibold text-lg mt-4">
                My Profile
              </h3>

              <p className="text-sm text-on-surface-variant mt-2">
                View your study statistics
              </p>
            </Link>

          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Recent Activity
          </h2>

          <div className="space-y-4">

            <div className="flex justify-between border-b pb-3">
              <span>Checked into Desk A-12</span>
              <span className="text-on-surface-variant">
                Today
              </span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span>Completed Study Session</span>
              <span className="text-on-surface-variant">
                Yesterday
              </span>
            </div>

            <div className="flex justify-between">
              <span>Reserved Desk B-07</span>
              <span className="text-on-surface-variant">
                2 Days Ago
              </span>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}

