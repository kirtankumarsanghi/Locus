import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Rooms() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState('G1');
  const [hoveredSlot, setHoveredSlot] = useState<{roomId: string, slotIndex: number} | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, number[]>>({ G1: [3, 4] });
  const [startTime, setStartTime] = useState('11:00');
  const [duration, setDuration] = useState('2 hours');
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayDisplay = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const rooms = [
    { 
      id: 'G1', 
      capacity: '4-6',
      features: ['TV', 'Whiteboard', 'Windows'],
      bookedSlots: [] as number[],
    },
    { 
      id: 'G2', 
      capacity: '6-8',
      features: ['Projector', 'Whiteboard', 'AC'],
      bookedSlots: [1],
    },
    { 
      id: 'G3', 
      capacity: '2-4',
      features: ['Monitor', 'Quiet', 'Corner'],
      bookedSlots: [0, 2],
    },
  ];

  const currentRoomData = rooms.find(r => r.id === selectedRoom) || rooms[0];

  const getSlotStatus = (roomId: string, slotIndex: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (room?.bookedSlots.includes(slotIndex)) return 'booked';
    if (selectedSlots[roomId]?.includes(slotIndex)) return 'selected';
    return false;
  };

  const toggleSlot = (roomId: string, slotIndex: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (room?.bookedSlots.includes(slotIndex)) return; // can't toggle booked
    setSelectedRoom(roomId);
    setSelectedSlots(prev => {
      const current = prev[roomId] || [];
      if (current.includes(slotIndex)) {
        return { ...prev, [roomId]: current.filter(i => i !== slotIndex) };
      } else {
        return { ...prev, [roomId]: [...current, slotIndex].sort() };
      }
    });
  };

  const handleBooking = () => {
    if (!agreed) {
      alert('Please agree to the attendance requirement before booking.');
      return;
    }
    const mySlots = selectedSlots[selectedRoom] || [];
    if (mySlots.length === 0) {
      alert('Please select at least one time slot on the timeline.');
      return;
    }
    const slotTimes = mySlots.map(i => timeSlots[i]).join(', ');
    setBookingSuccess(`Room ${selectedRoom} booked for ${todayDisplay} at ${slotTimes}`);
    setTimeout(() => setBookingSuccess(null), 5000);
  };

  const selectedSlotsForRoom = selectedSlots[selectedRoom] || [];

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

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Study Rooms</h1>
            <p className="text-gray-600 text-lg">Book a space for your group. Rooms G1-G10 available.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">schedule</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Today</p>
              <p className="text-sm font-bold text-gray-900">{todayDisplay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fair Use Notice - More Natural */}
      <div className="mb-8 bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
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
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Availability</h2>
              <p className="text-sm text-gray-500 mt-1">Click empty slots to book · Hover for times</p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-50 border border-gray-300"></div>
                <span className="text-gray-600">Free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200"></div>
                <span className="text-gray-600">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-slate-700 to-slate-800"></div>
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
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
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
                        {timeSlots.map((_, i) => {
                          const slotStatus = getSlotStatus(room.id, i);
                          return (
                          <div
                            key={i}
                            onMouseEnter={() => setHoveredSlot({ roomId: room.id, slotIndex: i })}
                            onMouseLeave={() => setHoveredSlot(null)}
                            onClick={() => toggleSlot(room.id, i)}
                            className={`h-16 rounded-xl cursor-pointer transition-all relative group/slot ${
                              slotStatus === 'selected' 
                                ? 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg scale-110 ring-2 ring-slate-400' 
                                : slotStatus === 'booked' 
                                ? 'bg-gray-200 cursor-not-allowed opacity-75' 
                                : 'bg-gray-50 border-2 border-gray-200 hover:border-slate-400 hover:bg-slate-50 hover:scale-110 hover:shadow-md'
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
                            {slotStatus === 'selected' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                  <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                </div>
                              </div>
                            )}
                            {slotStatus === 'booked' && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-gray-400 text-sm">block</span>
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Features - Show on hover with slide animation */}
                    <div className="ml-32 mt-3 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      <div className="flex gap-2">
                        {room.features.map((feature, idx) => (
                          <span 
                            key={idx} 
                            className="text-xs px-3 py-1.5 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 rounded-lg font-semibold border border-slate-200 hover:shadow-md hover:scale-105 transition-all"
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
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit sticky top-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Room {selectedRoom}</h2>
              <p className="text-sm text-gray-500">Complete booking details</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-xl">meeting_room</span>
            </div>
          </div>
          
          {/* Room Features */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Room Features</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-xl border border-slate-200">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-slate-700 text-sm">group</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="text-sm font-bold text-gray-900">{currentRoomData.capacity}</p>
                </div>
              </div>
              {currentRoomData.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 hover:border-slate-400 hover:bg-slate-50 transition-all">
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
                <span className="material-symbols-outlined text-slate-700 text-sm">calendar_today</span>
                Date
              </label>
              <input 
                type="date" 
                defaultValue={todayStr} 
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 hover:border-slate-300 focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700 text-sm">schedule</span>
                  Start
                </label>
                <select 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 hover:border-slate-300 focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none transition-all font-medium bg-white"
                >
                  {timeSlots.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700 text-sm">hourglass_empty</span>
                  Duration
                </label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 hover:border-slate-300 focus:border-slate-600 focus:ring-2 focus:ring-slate-200 outline-none transition-all font-medium bg-white"
                >
                  <option>1 hour</option>
                  <option>2 hours</option>
                  <option>3 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-slate-700 text-sm">info</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900 mb-1">Your Booking</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Room {selectedRoom} · {todayDisplay} · {selectedSlotsForRoom.length > 0 ? selectedSlotsForRoom.map(i => timeSlots[i]).join(', ') : 'No slots selected'}
                </p>
              </div>
            </div>
          </div>

          {/* Agreement */}
          <label className="flex items-start gap-3 mb-6 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-all">
            <input 
              type="checkbox" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded-md border-2 border-gray-300 text-slate-700 focus:ring-slate-500 focus:ring-2 transition-all cursor-pointer"
            />
            <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
              I'll make sure at least <span className="font-bold text-gray-900">2 people</span> show up within <span className="font-bold text-gray-900">15 minutes</span>
            </span>
          </label>

          {/* Book Button */}
          {bookingSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              <p className="text-sm text-emerald-800 font-medium">{bookingSuccess}</p>
            </div>
          )}

          <button 
            onClick={handleBooking}
            disabled={!agreed || selectedSlotsForRoom.length === 0}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
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
