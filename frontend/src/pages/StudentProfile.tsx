import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface StudentStats {
  id: number;
  student_id: string;
  name: string;
  email: string;
  total_hours: number;
  check_in_count: number;
  active_session: any;
}

export default function StudentProfile() {
  const { user } = useAuth();
  const [student, setStudent] = useState<StudentStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.student_id) {
      fetchStudentProfile();
    }
  }, [user]);

  const fetchStudentProfile = async () => {
    if (!user?.student_id) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/student/${user.student_id}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setRecentActivity(data.recentSessions);
      }
    } catch (err) {
      console.error('Failed to fetch student profile', err);
    } finally {
      setLoading(false);
    }
  };
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
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="flex items-center gap-6">

            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold border border-white/30 shadow-lg">
              {student?.name?.charAt(0) || user?.name?.charAt(0) || 'S'}
            </div>

            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {student?.name || user?.name || 'Student'}
              </h2>

              <p className="opacity-90 text-lg mb-3">
                Student ID: {student?.student_id || user?.student_id || 'N/A'}
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Active Member
                </span>

                {student && student.total_hours >= 100 && (
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                    🏆 100+ Hours Club
                  </span>
                )}

                {student && student.check_in_count >= 50 && (
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                    📚 Library Regular
                  </span>
                )}
              </div>
            </div>

          </div>
          )}
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
              {loading ? '...' : Math.round((student?.total_hours || 0) * 10) / 10}h
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
              {loading ? '...' : student?.active_session ? 'Active' : 'None'}
            </p>

            <p className="text-sm text-gray-600">
              {student?.active_session ? `Desk ${student.active_session.desk_label}` : 'No active session'}
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
              {loading ? '...' : student?.check_in_count || 0}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm mb-4">
              <span className="material-symbols-outlined text-white text-2xl">event_seat</span>
            </div>

            <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">
              Recent Sessions
            </h3>

            <p className="text-4xl font-bold text-gray-900 mb-1">
              {loading ? '...' : recentActivity.length}
            </p>

            <p className="text-sm text-gray-600">
              last 10 sessions
            </p>
          </div>

        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700">trending_up</span>
              Study Statistics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">Total Sessions</span>
                <span className="text-lg font-bold text-slate-700">{recentActivity.length}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-slate-600 to-slate-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((recentActivity.length / 50) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">Study Hours</span>
                <span className="text-lg font-bold text-slate-700">{Math.round((student?.total_hours || 0) * 10) / 10}h</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((student?.total_hours || 0) / 200) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">emoji_events</span>
            Achievements
          </h2>

          <div className="flex flex-wrap gap-3">
            {student && student.total_hours >= 100 && (
              <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 text-yellow-800 font-semibold flex items-center gap-2 shadow-sm">
                <span className="text-2xl">🏆</span>
                <span>100+ Study Hours</span>
              </div>
            )}

            {student && student.check_in_count >= 50 && (
              <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-800 font-semibold flex items-center gap-2 shadow-sm">
                <span className="text-2xl">📚</span>
                <span>Library Regular</span>
              </div>
            )}

            {student && student.total_hours >= 10 && (
              <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 text-green-800 font-semibold flex items-center gap-2 shadow-sm">
                <span className="text-2xl">⭐</span>
                <span>Getting Started</span>
              </div>
            )}

            {student && student.check_in_count >= 10 && (
              <div className="px-5 py-3 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 text-purple-800 font-semibold flex items-center gap-2 shadow-sm">
                <span className="text-2xl">🎯</span>
                <span>Consistent Visitor</span>
              </div>
            )}

            {(!student || (student.total_hours < 10 && student.check_in_count < 10)) && (
              <p className="text-gray-500 text-sm">Complete more sessions to unlock achievements!</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">history</span>
            Session History
          </h2>

          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">history</span>
                <p className="text-gray-500 text-sm">No session history yet. Check in to start tracking!</p>
              </div>
            ) : (
              recentActivity.map((session: any) => {
                const duration = session.end_time 
                  ? Math.floor((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60))
                  : null;

                return (
                <div
                  key={session.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-sm ${
                      session.status === 'ACTIVE' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-br from-slate-700 to-slate-800'
                    }`}>
                      <span className="material-symbols-outlined">
                        {session.status === 'ACTIVE' ? 'play_circle' : 'check_circle'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {session.desk_label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(session.start_time).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        {' · '}
                        {new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                    <span className="material-symbols-outlined text-slate-700 text-lg">schedule</span>
                    <span className="font-bold text-slate-700">
                      {session.status === 'ACTIVE' 
                        ? 'In progress' 
                        : duration 
                          ? `${Math.floor(duration / 60)}h ${duration % 60}m`
                          : 'Completed'
                      }
                    </span>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

