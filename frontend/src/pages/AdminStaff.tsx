import { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useSocket } from '../context/SocketContext';
import { Search, ShieldAlert, Star, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface StaffData {
  id: number;
  name: string;
  email: string;
  department: string;
  status: string;
  role: string;
}

export default function AdminStaff() {
  const { socket } = useSocket();
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  
  // Promote Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<{id: number, name: string, student_id: string}[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const fetchStaff = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE_URL}/api/admin/staff?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleStudents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users?role=STUDENT`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch students for promotion:', err);
    }
  };

  useEffect(() => {
    fetchStaff();

    if (socket) {
      socket.on('admin:user_updated', fetchStaff);
      return () => {
        socket.off('admin:user_updated');
      };
    }
  }, [search, socket]);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    if (!confirm('Are you sure you want to promote this student to STAFF?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/staff/${selectedStudentId}/promote`, { method: 'POST' });
      if (res.ok) {
        setIsModalOpen(false);
        setSelectedStudentId('');
        fetchStaff();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to promote user');
      }
    } catch (err) {
      console.error('Failed to promote:', err);
    }
  };

  const openPromoteModal = () => {
    fetchEligibleStudents();
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <Breadcrumb />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 mt-1">View staff members and promote students to staff roles.</p>
        </div>
        <button 
          onClick={openPromoteModal}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Star className="w-5 h-5" />
          Promote Student
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-sm text-gray-500">
                <th className="px-6 py-4 font-semibold">Staff Member</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No staff members found.</td>
                </tr>
              ) : (
                staffList.map(staff => (
                  <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-700 font-bold shadow-sm border border-purple-200/50">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{staff.name}</p>
                          <p className="text-xs text-gray-500">{staff.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                        staff.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {staff.department || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        staff.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {staff.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5 text-amber-500" />
                 Promote Student
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePromote} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Select Student</label>
                <select 
                  required
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                >
                  <option value="" disabled>Choose a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.student_id})</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800 text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>This action will grant the student access to the Staff Portal, allowing them to manage desks, approve room bookings, and view analytics.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!selectedStudentId}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  Confirm Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
