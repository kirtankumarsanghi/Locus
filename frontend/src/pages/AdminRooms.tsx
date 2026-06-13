import { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { API_BASE_URL } from '../config';

interface Room {
  id: number;
  name: string;
  zone: string;
  floor: number;
  capacity: number;
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', zone: '', floor: 1, capacity: 4 });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rooms`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom)
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewRoom({ name: '', zone: '', floor: 1, capacity: 4 });
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create room');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating room');
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!confirm('Are you sure you want to delete this room? This will also delete any upcoming bookings.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/rooms/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete room');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Breadcrumb />
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Rooms</h1>
          <p className="text-gray-600 text-lg">Add, edit, or remove study and meeting rooms.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Search rooms..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all w-full md:w-64"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl font-bold hover:from-slate-800 hover:to-slate-900 shadow-sm hover:shadow transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Room
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-slate-700 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Room Name</th>
                  <th className="p-4 font-semibold">Zone</th>
                  <th className="p-4 font-semibold">Floor</th>
                  <th className="p-4 font-semibold">Capacity</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No rooms found.
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold shadow-sm">
                            <span className="material-symbols-outlined text-lg">meeting_room</span>
                          </div>
                          <span className="font-bold text-gray-900">{r.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-700">{r.zone}</td>
                      <td className="p-4 text-gray-600">Floor {r.floor}</td>
                      <td className="p-4 text-gray-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">group</span>
                        {r.capacity}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteRoom(r.id)}
                          className="w-8 h-8 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center ml-auto"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Room</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Room Name</label>
                <input 
                  type="text" 
                  required
                  value={newRoom.name}
                  onChange={e => setNewRoom({...newRoom, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                  placeholder="e.g. Study Room A"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Zone</label>
                <input 
                  type="text" 
                  required
                  value={newRoom.zone}
                  onChange={e => setNewRoom({...newRoom, zone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                  placeholder="e.g. Quiet Zone"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Floor</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={newRoom.floor}
                    onChange={e => setNewRoom({...newRoom, floor: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Capacity</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    value={newRoom.capacity}
                    onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold hover:from-slate-800 hover:to-slate-900 shadow-md transition-all"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
