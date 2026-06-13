import { useState, useEffect } from 'react';

import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function StudentRooms() {
  
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{roomId: number, slotIndex: number} | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<number, number[]>>({});
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const todayDisplay = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const defaultFeatures = ['Monitor', 'Whiteboard', 'AC'];

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchData();
    socket.on('room:booking_updated', handleUpdate);
    return () => {
      socket.off('room:booking_updated', handleUpdate);
    };
  }, [socket, user]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchRooms(), fetchMyBookings()]);
    setLoading(false);
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms`);
      if (res.ok) {
        const data = await res.json();
        const roomsWithBookings = data.rooms.map((room: any) => {
          // Only block slots for PENDING or APPROVED bookings
          const roomBookings = data.bookings.filter((b: any) => 
            b.room_id === room.id && ['PENDING', 'APPROVED'].includes(b.status)
          );
          const bookedSlots: number[] = [];
          
          roomBookings.forEach((b: any) => {
            const startIdx = timeSlots.indexOf(b.start_time);
            const endIdx = timeSlots.indexOf(b.end_time);
            if (startIdx !== -1 && endIdx !== -1) {
              for (let i = startIdx; i < endIdx; i++) {
                bookedSlots.push(i);
              }
            }
          });
          
          return {
            ...room,
            features: defaultFeatures,
            bookedSlots
          };
        });
        
        setRooms(roomsWithBookings);
        if (roomsWithBookings.length > 0 && !selectedRoom) {
          setSelectedRoom(roomsWithBookings[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyBookings = async () => {
    if (!user?.student_id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms/my-bookings/${user.student_id}`);
      if (res.ok) {
        const data = await res.json();
        setMyBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, studentId: user?.student_id })
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (err) {
      alert('Error cancelling booking');
    }
  };

  const currentRoomData = rooms.find(r => r.id === selectedRoom) || rooms[0];

  const getSlotStatus = (roomId: number, slotIndex: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (room?.bookedSlots.includes(slotIndex)) return 'booked';
    if (selectedSlots[roomId]?.includes(slotIndex)) return 'selected';
    return false;
  };

  const toggleSlot = (roomId: number, slotIndex: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (room?.bookedSlots.includes(slotIndex)) return; // can't toggle booked
    setSelectedRoom(roomId);
    setSelectedSlots(prev => {
      const current = prev[roomId] || [];
      if (current.includes(slotIndex)) {
        return { ...prev, [roomId]: current.filter((i: number) => i !== slotIndex) };
      } else {
        return { ...prev, [roomId]: [...current, slotIndex].sort((a,b) => a-b) };
      }
    });
  };

  const handleBooking = async () => {
    if (!agreed) {
      alert('Please agree to the attendance requirement before booking.');
      return;
    }
    if (!selectedRoom) return;
    
    const mySlots = selectedSlots[selectedRoom] || [];
    if (mySlots.length === 0) {
      alert('Please select at least one time slot on the timeline.');
      return;
    }
    
    // Check if slots are contiguous
    const sorted = [...mySlots].sort((a,b) => a-b);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] !== sorted[i] + 1) {
        alert('Please select contiguous time slots.');
        return;
      }
    }

    const startStr = timeSlots[sorted[0]];
    const endStr = timeSlots[sorted[sorted.length - 1] + 1] || '18:00';

    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          studentId: user?.student_id,
          startTime: startStr,
          endTime: endStr
        })
      });
      if (res.ok) {
        const roomName = rooms.find(r => r.id === selectedRoom)?.name;
        setBookingSuccess(`Room ${roomName} booking requested for ${todayDisplay} from ${startStr} to ${endStr}`);
        setSelectedSlots(prev => ({ ...prev, [selectedRoom]: [] }));
        fetchData();
        setTimeout(() => setBookingSuccess(null), 5000);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to book room');
      }
    } catch (err) {
      alert('Error booking room');
    }
  };

  const selectedSlotsForRoom = selectedRoom ? (selectedSlots[selectedRoom] || []) : [];

  if (loading && rooms.length === 0) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
  }

  return (
    <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0 bg-gray-50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Study Rooms</h1>
              <p className="text-gray-600 text-lg">Book a space for your group. Subject to staff approval.</p>
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

        {myBookings.length > 0 && (
          <div className="mb-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myBookings.map(b => (
                <div key={b.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{b.room_name}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        b.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{b.start_time} - {b.end_time}</p>
                  </div>
                  {['PENDING', 'APPROVED'].includes(b.status) && (
                    <button 
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-sm font-medium text-rose-600 hover:text-rose-800 text-left"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <span className="text-gray-600">Booked/Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-slate-700 to-slate-800"></div>
                  <span className="text-gray-600">Selected</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[700px] p-6">
                <div className="space-y-5">
                  {rooms.map(room => (
                    <div key={room.id} className="group">
                      <div className="flex items-center gap-4">
                        <div className="w-40 flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer text-sm">
                              {room.zone}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{room.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">group</span>
                                {room.capacity}
                              </p>
                            </div>
                          </div>
                        </div>
                        
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
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 mt-8 pt-6 border-t-2 border-gray-100">
                  <div className="w-40 flex-shrink-0"></div>
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

          {currentRoomData && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit sticky top-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentRoomData.name}</h2>
                <p className="text-sm text-gray-500">Complete booking details</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-xl">meeting_room</span>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-slate-700 text-sm">info</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900 mb-1">Your Booking</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {currentRoomData.name} · {todayDisplay} · {selectedSlotsForRoom.length > 0 ? selectedSlotsForRoom.map(i => timeSlots[i]).join(', ') : 'No slots selected'}
                  </p>
                </div>
              </div>
            </div>

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
              <span>Submit Request</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
