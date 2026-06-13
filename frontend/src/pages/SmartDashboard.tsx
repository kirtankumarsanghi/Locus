import { API_BASE_URL } from '../config';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface Recommendation {
  id: number;
  label: string;
  room_name: string;
  zone: string;
  floor: number;
  score: number;
  noiseLevel: string;
  reason: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  target: number;
  unlocked: boolean;
  rarity: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: { current: number; target: number; percentage: number };
  monthlyGoal: { current: number; target: number; percentage: number };
  totalStudyDays: number;
}

interface HeatmapData {
  deskHeatmap: any[];
  roomHeatmap: any[];
  peakHours: any[];
  hourDayHeatmap: any[];
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SmartDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'heatmap' | 'achievements'>('recommendations');

  useEffect(() => {
    if (user?.student_id) {
      fetchSmartData();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    
    const handleUpdate = () => {
      if (user?.student_id) {
        fetchSmartData();
      }
    };

    socket.on('desk:updated', handleUpdate);
    socket.on('session:checkin', handleUpdate);
    socket.on('session:checkout', handleUpdate);

    return () => {
      socket.off('desk:updated', handleUpdate);
      socket.off('session:checkin', handleUpdate);
      socket.off('session:checkout', handleUpdate);
    };
  }, [socket, user]);

  const fetchSmartData = async () => {
    if (!user?.student_id) return;

    try {
      setLoading(true);
      
      // Fetch recommendations
      const recRes = await fetch(`${API_BASE_URL}/api/smart/recommendations/${user.student_id}`);
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData.recommendations || []);
      }

      // Fetch achievements
      const achRes = await fetch(`${API_BASE_URL}/api/smart/achievements/${user.student_id}`);
      if (achRes.ok) {
        const achData = await achRes.json();
        setAchievements(achData.achievements || []);
      }

      // Fetch streak
      const streakRes = await fetch(`${API_BASE_URL}/api/smart/streak/${user.student_id}`);
      if (streakRes.ok) {
        const streakData = await streakRes.json();
        setStreak(streakData);
      }

      // Fetch heatmap
      const heatmapRes = await fetch(`${API_BASE_URL}/api/smart/heatmap`);
      if (heatmapRes.ok) {
        const heatmapData = await heatmapRes.json();
        setHeatmap(heatmapData);
      }

    } catch (err) {
      console.error('Failed to fetch smart data', err);
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapMatrix = () => {
    if (!heatmap) return [];
    
    const matrix: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
    
    heatmap.hourDayHeatmap.forEach((item: any) => {
      matrix[item.day_of_week][item.hour] = item.count;
    });
    
    return matrix;
  };

  const maxHeatValue = heatmap 
    ? Math.max(...heatmap.hourDayHeatmap.map((d: any) => d.count), 1)
    : 1;

  const heatmapMatrix = getHeatmapMatrix();

  const rarityColor: Record<string, string> = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-amber-500'
  };

  return (
    <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Personalized insights and recommendations powered by AI
            </p>
          </div>
          <Link
            to="/student"
            className="px-6 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-slate-400 hover:shadow-md transition-all flex items-center gap-2 w-fit"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>

        {/* Streak & Goals Cards */}
        {streak && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-sm mb-4">
                <span className="material-symbols-outlined text-white text-2xl">local_fire_department</span>
              </div>
              <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">Current Streak</h3>
              <p className="text-4xl font-bold text-gray-900">{streak.currentStreak}</p>
              <p className="text-sm text-gray-600">consecutive days</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm mb-4">
                <span className="material-symbols-outlined text-white text-2xl">military_tech</span>
              </div>
              <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">Best Streak</h3>
              <p className="text-4xl font-bold text-gray-900">{streak.longestStreak}</p>
              <p className="text-sm text-gray-600">days record</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-sm mb-4">
                <span className="material-symbols-outlined text-white text-2xl">calendar_today</span>
              </div>
              <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">Weekly Goal</h3>
              <p className="text-4xl font-bold text-gray-900">{streak.weeklyGoal.current}/{streak.weeklyGoal.target}</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                  style={{ width: `${streak.weeklyGoal.percentage}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm mb-4">
                <span className="material-symbols-outlined text-white text-2xl">event_available</span>
              </div>
              <h3 className="text-sm uppercase text-gray-600 font-semibold tracking-wider mb-2">Monthly Goal</h3>
              <p className="text-4xl font-bold text-gray-900">{streak.monthlyGoal.current}/{streak.monthlyGoal.target}</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-600 to-emerald-400"
                  style={{ width: `${streak.monthlyGoal.percentage}%` }}
                />
              </div>
            </div>

          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'recommendations'
                  ? 'text-slate-700 border-b-2 border-slate-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined">thumb_up</span>
              Recommendations
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'heatmap'
                  ? 'text-slate-700 border-b-2 border-slate-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined">grid_on</span>
              Heatmap
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'achievements'
                  ? 'text-slate-700 border-b-2 border-slate-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined">emoji_events</span>
              Achievements
            </button>
          </div>

          <div className="p-6">
            
            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700">psychology</span>
                  Smart Seat Recommendations
                </h2>

                {loading ? (
                  <p className="text-gray-500">Loading recommendations...</p>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">event_seat</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Available Desks</h3>
                    <p className="text-gray-600">All desks are currently occupied. Check back soon!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map((rec, idx) => (
                      <div
                        key={rec.id}
                        className="group p-6 rounded-2xl border-2 border-gray-200 bg-white hover:border-slate-400 hover:shadow-xl transition-all hover:-translate-y-1"
                      >
                        {idx === 0 && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold mb-3">
                            <span className="material-symbols-outlined text-xs">star</span>
                            TOP PICK
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md text-white font-bold text-lg">
                            {rec.label}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-slate-700">{rec.score}</div>
                            <div className="text-xs text-gray-500">Match Score</div>
                          </div>
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mb-2">{rec.room_name}</h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="material-symbols-outlined text-lg">location_on</span>
                            Zone {rec.zone}, Floor {rec.floor}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="material-symbols-outlined text-lg">volume_down</span>
                            {rec.noiseLevel} environment
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 mb-4">
                          <p className="text-sm text-blue-900 font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">lightbulb</span>
                            {rec.reason}
                          </p>
                        </div>

                        <Link
                          to="/student/checkin"
                          className="block w-full px-4 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 text-white font-semibold text-center hover:opacity-90 transition-all"
                        >
                          Check In Here
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Heatmap Tab */}
            {activeTab === 'heatmap' && heatmap && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700">insights</span>
                  Occupancy Insights
                </h2>

                {/* Top Desks & Rooms */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  
                  {/* Most Used Desks */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-700">event_seat</span>
                      Most Popular Desks
                    </h3>
                    <div className="space-y-3">
                      {heatmap.deskHeatmap.slice(0, 5).map((desk: any, idx: number) => (
                        <div key={desk.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white flex items-center justify-center font-bold text-sm">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{desk.label}</div>
                              <div className="text-xs text-gray-500">{desk.room_name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{desk.session_count}</div>
                            <div className="text-xs text-gray-500">sessions</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Most Used Rooms */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-700">meeting_room</span>
                      Most Popular Rooms
                    </h3>
                    <div className="space-y-3">
                      {heatmap.roomHeatmap.slice(0, 5).map((room: any, idx: number) => (
                        <div key={room.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm">
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{room.name}</div>
                              <div className="text-xs text-gray-500">Zone {room.zone}, Floor {room.floor}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{room.session_count}</div>
                            <div className="text-xs text-gray-500">sessions</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hour x Day Heatmap */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-700">grid_on</span>
                    Peak Usage Times (Last 30 Days)
                  </h3>

                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      {/* Hours header */}
                      <div className="flex mb-2">
                        <div className="w-20 flex-shrink-0"></div>
                        <div className="flex-1 grid grid-cols-24 gap-1">
                          {Array.from({ length: 24 }, (_, i) => (
                            <div key={i} className="text-center text-[10px] text-gray-600 font-semibold">
                              {i}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Heatmap rows */}
                      {DAY_NAMES.map((day, dayIdx) => (
                        <div key={dayIdx} className="flex items-center mb-1">
                          <div className="w-20 flex-shrink-0 text-xs font-semibold text-gray-700 pr-2 text-right">
                            {day}
                          </div>
                          <div className="flex-1 grid grid-cols-24 gap-1">
                            {heatmapMatrix[dayIdx].map((count, hourIdx) => {
                              const intensity = maxHeatValue > 0 ? count / maxHeatValue : 0;
                              const bgColor = intensity === 0
                                ? 'bg-gray-100'
                                : `rgba(71, 85, 105, ${0.2 + intensity * 0.8})`;

                              return (
                                <div
                                  key={hourIdx}
                                  className="aspect-square rounded border border-gray-200 flex items-center justify-center text-[8px] font-semibold transition-transform hover:scale-125 hover:z-10 cursor-pointer"
                                  style={{ backgroundColor: intensity > 0 ? bgColor : undefined }}
                                  title={`${day} ${hourIdx}:00 - ${count} sessions`}
                                >
                                  {count > 0 ? count : ''}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-600">
                    <span>Less Busy</span>
                    <div className="flex gap-1">
                      {[0, 0.25, 0.5, 0.75, 1].map((intensity, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded border border-gray-200"
                          style={{ backgroundColor: intensity === 0 ? '#f3f4f6' : `rgba(71, 85, 105, ${0.2 + intensity * 0.8})` }}
                        />
                      ))}
                    </div>
                    <span>More Busy</span>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700">emoji_events</span>
                  Achievements
                  {achievements.length > 0 && (
                    <span className="text-base text-gray-500 font-normal">
                      ({achievements.filter(a => a.unlocked).length} / {achievements.length} unlocked)
                    </span>
                  )}
                </h2>

                {loading ? (
                  <p className="text-gray-500">Loading achievements...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((ach) => (
                      <div
                        key={ach.id}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          ach.unlocked
                            ? 'border-slate-300 bg-white shadow-md'
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${ach.color} flex items-center justify-center shadow-md ${
                            !ach.unlocked && 'grayscale'
                          }`}>
                            <span className="material-symbols-outlined text-white text-3xl">{ach.icon}</span>
                          </div>
                          {ach.unlocked && (
                            <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${rarityColor[ach.rarity]}`}>
                              {ach.rarity.toUpperCase()}
                            </div>
                          )}
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mb-1">{ach.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{ach.description}</p>

                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-gray-900">{ach.progress} / {ach.target}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${ach.color}`}
                              style={{ width: `${Math.min((ach.progress / ach.target) * 100, 100)}%` }}
                            />
                          </div>
                        </div>

                        {ach.unlocked && (
                          <div className="flex items-center gap-2 text-green-600 text-sm font-semibold mt-3">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            Unlocked!
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
