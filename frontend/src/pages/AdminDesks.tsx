import { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { API_BASE_URL } from '../config';

interface Desk {
  id: number;
  number: string;
  label: string;
  status: string;
  zone?: string;
  floor?: number;
  room_id: number;
}

interface Room {
  id: number;
  name: string;
  zone: string;
  floor: number;
}

export default function AdminDesks() {
  const [desks, setDesks] = useState<Desk[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDesk, setNewDesk] = useState({ number: '', label: '', room_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [desksRes, roomsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/desks`),
        fetch(`${API_BASE_URL}/api/rooms`)
      ]);
      if (desksRes.ok) {
        const data = await desksRes.json();
        setDesks(data.desks || []);
      }
      if (roomsRes.ok) {
        const data = await roomsRes.json();
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDesk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesk.room_id) {
      alert("Please select a room.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/desks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: newDesk.number,
          label: newDesk.label,
          room_id: parseInt(newDesk.room_id)
        })
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewDesk({ number: '', label: '', room_id: '' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create desk');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating desk');
    }
  };

  const handleDeleteDesk = async (id: number) => {
    if (!confirm('Are you sure you want to delete this desk?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/desks/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete desk');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDesks = desks.filter(d => 
    d.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.zone && d.zone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Breadcrumb />
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Desks</h1>
          <p className="text-gray-600 text-lg">Add, edit, or remove library desks.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Search desks..." 
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
            Add Desk
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
                  <th className="p-4 font-semibold">Desk ID</th>
                  <th className="p-4 font-semibold">Label</th>
                  <th className="p-4 font-semibold">Room / Zone</th>
                  <th className="p-4 font-semibold">Floor</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDesks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No desks found.
                    </td>
                  </tr>
                ) : (
                  filteredDesks.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                            {d.number}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">{d.label}</td>
                      <td className="p-4 text-gray-600">
                        {rooms.find(r => r.id === d.room_id)?.name || d.zone || 'Unknown'}
                      </td>
                      <td className="p-4 text-gray-600">
                        {d.floor !== undefined ? `Floor ${d.floor}` : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          d.status === 'FREE' ? 'bg-emerald-100 text-emerald-800' :
                          d.status === 'OCCUPIED' ? 'bg-rose-100 text-rose-800' :
                          d.status === 'AWAY' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteDesk(d.id)}
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

      {/* Add Desk Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Desk</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleAddDesk} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Desk Number (ID)</label>
                <input 
                  type="text" 
                  required
                  value={newDesk.number}
                  onChange={e => setNewDesk({...newDesk, number: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                  placeholder="e.g. A01"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Label</label>
                <input 
                  type="text" 
                  required
                  value={newDesk.label}
                  onChange={e => setNewDesk({...newDesk, label: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                  placeholder="e.g. Quiet Zone Desk A01"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Room / Zone</label>
                <select 
                  required
                  value={newDesk.room_id}
                  onChange={e => setNewDesk({...newDesk, room_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                >
                  <option value="" disabled>Select a room...</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Floor {r.floor}, Zone {r.zone})
                    </option>
                  ))}
                </select>
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
                  Create Desk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
