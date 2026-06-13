import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Rooms() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState('G1');
  const [hoveredSlot, setHoveredSlot] = useState<{roomId: string, slotIndex: number} | null>(null);
  
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const rooms = [
    { 
      id: 'G1', 
      slots: [false, false, false, 'selected', 'selected', false, false, false, false],
      capacity: '4-6',
      features: ['TV', 'Whiteboard', 'Windows']
    },
    { 
      id: 'G2', 
      slots: [false, 'booked', false, false, false, false, false, false, false],
      capacity: '6-8',
      features: ['Projector', 'Whiteboard', 'AC']
    },
    { 
      id: 'G3', 
      slots: ['booked', false, 'booked', false, false, false, false, false, false],
      capacity: '2-4',
      features: ['Monitor', 'Quiet', 'Corner']
    },
  ];

  const currentRoomData = rooms.find(r => r.id === selectedRoom) || rooms[0];

  return (
    <main className="flex-1 md:ml-72 mb-20 md:mb-0 overflow-y-auto bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-all mb-6 group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-semibold">Back</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Study Rooms</h1>
            <p className="text-gray-600 text-lg">Book a space for your group. Rooms G1-G10 available.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">schedule</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Today</p>
              <p className="text-sm font-bold text-gray-900">Oct 27, 2023</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fair Use Notice - More Natural */}
      <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden hover:shadow-2xl transition-shadow">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Quick heads up!</h3>
            <p className="text-white/90 leading-relaxed">At least 2 people need to show up within 15 minutes, or the room gets released for others. Fair's fair! ✌️</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline - 2/3 width */}
        <div className="lg:col-span-2 bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Availability</h2>
              <p className="text-sm text-gray-500 mt-1">Click empty slots to book · Hover for times</p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-50 border-2 border-gray-200 shadow-sm"></div>
                <span className="text-gray-600">Free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200 shadow-sm"></div>
                <span className="text-gray-600">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md"></div>
                <span className="text-gray-600">Selected</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[700px] p-6">
              {/* Timeline Grid */}
              <div className="space-y-5">
                {rooms.map(room => (
                  <div key={room.id} className="group">
                    <div className="flex items-center gap-4">
                      {/* Room Info */}
                      <div className="w-28 flex-shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer">
                            {room.id.replace('G', '')}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{room.id}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">group</span>
                              {room.capacity}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Time Slots */}
                      <div className="flex-1 grid grid-cols-9 gap-2">
                        {room.slots.map((slot, i) => (
                          <div
                            key={i}
                            onMouseEnter={() => setHoveredSlot({ roomId: room.id, slotIndex: i })}
                            onMouseLeave={() => setHoveredSlot(null)}
                            onClick={() => !slot && setSelectedRoom(room.id)}
                            className={`h-16 rounded-xl cursor-pointer transition-all relative group/slot ${
                              slot === 'selected' 
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-200 scale-110 ring-2 ring-indigo-300' 
                                : slot === 'booked' 
                                ? 'bg-gray-200 cursor-not-allowed opacity-75' 
                                : 'bg-gray-50 border-2 border-gray-200 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:scale-110 hover:shadow-lg'
                            }`}
                          >
                            {/* Time Label on Hover */}
                            {hoveredSlot?.roomId === room.id && hoveredSlot?.slotIndex === i && (
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 animate-in fade-in duration-200">
                                <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold whitespace-nowrap">
                                  {timeSlots[i]}
                                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                </div>
                              </div>
                            )}
                            {slot === 'selected' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                  <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                </div>
                              </div>
                            )}
                            {slot === 'booked' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-400 text-sm">block</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Features - Show on hover with slide animation */}
                    <div className="ml-32 mt-3 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      <div className="flex gap-2">
                        {room.features.map((feature, idx) => (
                          <span 
                            key={idx} 
                            className="text-xs px-3 py-1.5 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 rounded-lg font-semibold border border-indigo-200 shadow-sm hover:shadow-md hover:scale-105 transition-all"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Time Labels */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t-2 border-gray-100">
                <div className="w-28 flex-shrink-0"></div>
                <div className="flex-1 grid grid-cols-9 gap-2">
                  {timeSlots.map((time, i) => (
                    <div key={i} className="text-center">
                      <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-md">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Card - 1/3 width */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow h-fit sticky top-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Room {selectedRoom}</h2>
              <p className="text-sm text-gray-500">Complete booking details</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-xl">meeting_room</span>
            </div>
          </div>
          
          {/* Room Features */}
          <div className="mb-6 pb-6 border-b-2 border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Room Features</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-100">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-indigo-600 text-sm">group</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="text-sm font-bold text-gray-900">{currentRoomData.capacity}</p>
                </div>
              </div>
              {currentRoomData.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-gray-600 text-sm">
                      {feature === 'TV' ? 'tv' : feature === 'Projector' ? 'personal_video' : feature === 'Monitor' ? 'desktop_windows' : feature === 'Whiteboard' ? 'draw' : 'check_circle'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-sm">calendar_today</span>
                Date
              </label>
              <input 
                type="date" 
                defaultValue="2023-10-27" 
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-sm">schedule</span>
                  Start
                </label>
                <select className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium shadow-sm bg-white">
                  <option>11:00</option>
                  <option>12:00</option>
                  <option>13:00</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-sm">hourglass_empty</span>
                  Duration
                </label>
                <select className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-indigo-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium shadow-sm bg-white">
                  <option>2 hours</option>
                  <option>1 hour</option>
                  <option>3 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-indigo-600 text-sm">info</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-900 mb-1">Your Booking</p>
                <p className="text-sm text-indigo-700 leading-relaxed">
                  Room {selectedRoom} · Oct 27 · 11:00-13:00 (2h)
                </p>
              </div>
            </div>
          </div>

          {/* Agreement */}
          <label className="flex items-start gap-3 mb-6 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-all">
            <input 
              type="checkbox" 
              className="mt-0.5 w-5 h-5 rounded-md border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2 transition-all cursor-pointer"
            />
            <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
              I'll make sure at least <span className="font-bold text-gray-900">2 people</span> show up within <span className="font-bold text-gray-900">15 minutes</span>
            </span>
          </label>

          {/* Book Button */}
          <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group">
            <span>Confirm Booking</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
            <span>You'll get a confirmation email instantly</span>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
