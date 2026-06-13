import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRealTimeDesks } from '../hooks/useRealTimeDesks';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';


interface StudentProfile {
  id: number;
  student_id: string;
  name: string;
  email: string;
  total_hours: number;
  check_in_count: number;
  active_session: any;
}

interface WeeklyStats {
  date: string;
  hours: number;
}

interface SmartInsight {
  currentStreak: number;
  weeklyGoal: { current: number; target: number; percentage: number };
  topRecommendation: any;
  unlockedAchievements: number;
  totalAchievements: number;
}

export default function StudentDashboard() {
  const { desks, loading } = useRealTimeDesks();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [sessionTimer, setSessionTimer] = useState<number>(0);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [smartInsights, setSmartInsights] = useState<SmartInsight | null>(null);

  useEffect(() => {
    if (user?.student_id) {
      fetchStudentProfile();
      fetchSmartInsights();
      const interval = setInterval(() => {
        fetchStudentProfile();
        fetchSmartInsights();
      }, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  // Session timer for active session
  useEffect(() => {
    if (student?.active_session) {
      const startTime = new Date(student.active_session.start_time).getTime();
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setSessionTimer(elapsed);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setSessionTimer(0);
    }
  }, [student?.active_session]);

  // Listen for session events
  useEffect(() => {
    if (!socket) return;
    
    const handleSessionUpdate = () => {
      if (user?.student_id) {
        fetchStudentProfile();
      }
    };

    socket.on('session:checkin', handleSessionUpdate);
    socket.on('session:checkout', handleSessionUpdate);
    socket.on('session:ended', handleSessionUpdate);
    socket.on('session:expired', handleSessionUpdate);

    return () => {
      socket.off('session:checkin', handleSessionUpdate);
      socket.off('session:checkout', handleSessionUpdate);
      socket.off('session:ended', handleSessionUpdate);
      socket.off('session:expired', handleSessionUpdate);
    };
  }, [socket, user]);

  const fetchStudentProfile = async () => {
    if (!user?.student_id) return;
    
    try {
      setIsLoadingProfile(true);
      const res = await fetch(`${API_BASE_URL}/api/student/${user.student_id}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setRecentActivity(data.recentSessions);
        
        // Generate weekly stats from recent sessions
        generateWeeklyStats(data.recentSessions);
      }
    } catch (err) {
      console.error('Failed to fetch student profile', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchSmartInsights = async () => {
    if (!user?.student_id) return;
    
    try {
      // Fetch streak
      const streakRes = await fetch(`${API_BASE_URL}/api/smart/streak/${user.student_id}`);
      
      // Fetch recommendations
      const recRes = await fetch(`${API_BASE_URL}/api/smart/recommendations/${user.student_id}`);
      
      // Fetch achievements
      const achRes = await fetch(`${API_BASE_URL}/api/smart/achievements/${user.student_id}`);

      const streakData = streakRes.ok ? await streakRes.json() : null;
      const recData = recRes.ok ? await recRes.json() : null;
      const achData = achRes.ok ? await achRes.json() : null;

      if (streakData && recData && achData) {
        setSmartInsights({
          currentStreak: streakData.currentStreak,
          weeklyGoal: streakData.weeklyGoal,
          topRecommendation: recData.recommendations[0] || null,
          unlockedAchievements: achData.unlockedCount,
          totalAchievements: achData.totalCount
        });
      }
    } catch (err) {
      console.error('Failed to fetch smart insights', err);
    }
  };

  const generateWeeklyStats = (sessions: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const statsByDate = last7Days.map(date => {
      const daySessions = sessions.filter(s => 
        s.start_time?.startsWith(date)
      );
      
      const totalMinutes = daySessions.reduce((sum, s) => {
        if (!s.start_time) return sum;
        const start = new Date(s.start_time).getTime();
        const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
        return sum + (end - start) / (1000 * 60);
      }, 0);

      return {
        date,
        hours: Math.round((totalMinutes / 60) * 10) / 10
      };
    });

    setWeeklyStats(statsByDate);
  };

  const availableCount = desks.filter(d => d.status === 'FREE').length;
  const occupiedCount = desks.filter(d => d.status === 'OCCUPIED').length;
  const totalDesks = desks.length || 1;
  const occupancyRate = Math.round((occupiedCount / totalDesks) * 100);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const maxHours = Math.max(...weeklyStats.map(s => s.hours), 5);

  return (
    <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {student?.name || 'Student'}. Here's your study session overview.
            </p>
          </div>
          <Link
            to="/student/profile"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold text-center hover:opacity-90 transition-all shadow-lg flex items-center gap-2 w-fit"
          >
            <span className="material-symbols-outlined text-lg">account_circle</span>
            My Profile
          </Link>
        </div>

        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-white p-8 shadow-xl border border-slate-600 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-3">
                Welcome Back, {student?.name || user?.name || 'Student'}!
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">event_seat</span>
                  <span>Current Desk: <span className="font-bold">{student?.active_session ? student.active_session.desk_label : 'None'}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                  <span>Total Study Hours: <span className="font-bold">{Math.round((student?.total_hours || 0) * 10) / 10}h</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">login</span>
                  <span>Check-ins: <span className="font-bold">{student?.check_in_count || 0}</span></span>
                </div>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border border-white/30">
              {student?.name?.charAt(0) || user?.name?.charAt(0) || 'S'}
            </div>
          </div>
        </div>

        {/* Smart Insights Banner */}
        {smartInsights && (
          <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 shadow-xl border border-purple-500 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl">psychology</span>
                Smart Insights
              </h2>
              <Link
                to="/student/smart"
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm font-semibold transition-all flex items-center gap-2 border border-white/30"
              >
                View All
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined">local_fire_department</span>
                  <span className="text-sm opacity-90">Streak</span>
                </div>
                <p className="text-3xl font-bold">{smartInsights.currentStreak}</p>
                <p className="text-xs opacity-75">days</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span className="text-sm opacity-90">Weekly Goal</span>
                </div>
                <p className="text-3xl font-bold">{smartInsights.weeklyGoal.current}/{smartInsights.weeklyGoal.target}</p>
                <div className="h-1.5 bg-white/20 rounded-full mt-2">
                  <div 
                    className="h-full bg-white rounded-full"
                    style={{ width: `${smartInsights.weeklyGoal.percentage}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined">emoji_events</span>
                  <span className="text-sm opacity-90">Achievements</span>
                </div>
                <p className="text-3xl font-bold">{smartInsights.unlockedAchievements}/{smartInsights.totalAchievements}</p>
                <p className="text-xs opacity-75">unlocked</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined">thumb_up</span>
                  <span className="text-sm opacity-90">Top Pick</span>
                </div>
                {smartInsights.topRecommendation ? (
                  <>
                    <p className="text-2xl font-bold">{smartInsights.topRecommendation.label}</p>
                    <p className="text-xs opacity-75">{smartInsights.topRecommendation.noiseLevel}</p>
                  </>
                ) : (
                  <p className="text-sm opacity-75">Check Smart Dashboard</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Live Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-2xl">event_seat</span>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Available Now</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{loading ? '...' : availableCount}</p>
            <p className="text-sm text-gray-600">desks ready to use</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-2xl">timer</span>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Your Session</span>
            </div>
            {student?.active_session ? (
              <>
                <p className="text-4xl font-bold text-slate-700 mb-1">Active</p>
                <p className="text-sm text-gray-600">{formatTimer(sessionTimer)} elapsed</p>
              </>
            ) : (
              <>
                <p className="text-4xl font-bold text-gray-400 mb-1">None</p>
                <p className="text-sm text-gray-600">No active session</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-white text-2xl">groups</span>
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Occupancy</span>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{loading ? '...' : occupancyRate}%</p>
            <p className="text-sm text-gray-600">{occupiedCount} / {totalDesks} in use</p>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Link
              to="/student/smart"
              className="group p-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl hover:border-purple-300 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-3xl">psychology</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Smart Dashboard
              </h3>
              <p className="text-sm text-gray-600">
                AI-powered recommendations and insights
              </p>
            </Link>

            <Link
              to="/student/checkin"
              className="group p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:border-slate-300 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-3xl">qr_code_scanner</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Check In
              </h3>
              <p className="text-sm text-gray-600">
                Start a new study session at any desk
              </p>
            </Link>

            <Link
              to="/student/seats"
              className="group p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:border-slate-300 transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-3xl">search</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Find Seats
              </h3>
              <p className="text-sm text-gray-600">
                Browse {availableCount} available desks right now
              </p>
            </Link>

          </div>
        </div>

        {/* Weekly Usage Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">bar_chart</span>
            Weekly Study Hours
          </h2>

          <div className="flex items-end justify-between gap-3 h-48">
            {weeklyStats.map((stat, idx) => {
              const heightPercent = maxHours > 0 ? (stat.hours / maxHours) * 100 : 0;
              const dayName = new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '160px' }}>
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-slate-600 to-slate-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                    {stat.hours > 0 && (
                      <div className="absolute top-0 left-0 right-0 text-center py-1">
                        <span className="text-xs font-semibold text-gray-700">{stat.hours}h</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session History */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">history</span>
            Recent Sessions
          </h2>

          <div className="space-y-3">
            {isLoadingProfile ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity.</p>
            ) : (
              recentActivity.slice(0, 10).map((session: any) => {
                const duration = session.end_time 
                  ? Math.floor((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60))
                  : null;

                return (
                  <div key={session.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
                        session.status === 'ACTIVE' 
                          ? 'bg-gradient-to-br from-blue-400 to-blue-500' 
                          : 'bg-gradient-to-br from-emerald-400 to-green-500'
                      }`}>
                        <span className="material-symbols-outlined text-white text-lg">
                          {session.status === 'ACTIVE' ? 'play_circle' : 'check_circle'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 block">
                          {session.desk_label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {session.status === 'ACTIVE' ? 'In progress' : duration ? `${duration} minutes` : 'Completed'}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(session.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' '}
                      {new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}



