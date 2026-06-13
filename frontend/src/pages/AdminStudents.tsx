import { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useSocket } from '../context/SocketContext';
import { Search, RotateCcw, Power, Clock } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface StudentData {
  id: number;
  student_id: string;
  name: string;
  email: string;
  department: string;
  status: string;
  active_session: {
    id: number;
    desk_id: string;
    start_time: string;
    status: string;
  } | null;
}

export default function AdminStudents() {
  const { socket } = useSocket();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sessionFilter) params.append('session', sessionFilter);

      const res = await fetch(`${API_BASE_URL}/api/admin/students?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    if (socket) {
      socket.on('admin:user_updated', fetchStudents);
      socket.on('session:checkin', fetchStudents);
      socket.on('session:ended', fetchStudents);
      return () => {
        socket.off('admin:user_updated');
        socket.off('session:checkin');
        socket.off('session:ended');
      };
    }
  }, [search, sessionFilter, socket]);

  const handleAction = async (studentId: number, action: 'reset-session' | 'end-session') => {
    if (!confirm(`Are you sure you want to ${action.replace('-', ' ')} for this student?`)) return;
    
    try {
      await fetch(`${API_BASE_URL}/api/admin/students/${studentId}/${action}`, { method: 'POST' });
      fetchStudents();
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <Breadcrumb />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Monitoring</h1>
          <p className="text-gray-500 mt-1">View student activity and manage active study sessions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={sessionFilter} 
            onChange={(e) => setSessionFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700"
          >
            <option value="">All Students</option>
            <option value="active">Active Session Only</option>
            <option value="none">No Active Session</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-sm text-gray-500">
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Current Session</th>
                <th className="px-6 py-4 font-semibold text-right">Session Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No students found matching your criteria.</td>
                </tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm border border-blue-200/50">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email} • ID: {student.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {student.active_session ? (
                        <div className="flex items-center gap-2">
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-700">
                             <Clock className="w-3 h-3" />
                             Desk {student.active_session.desk_id}
                           </span>
                           <span className="text-xs text-gray-500">
                             Since {new Date(student.active_session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not studying</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {student.active_session ? (
                          <>
                            <button 
                              onClick={() => handleAction(student.id, 'reset-session')}
                              className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 rounded-lg transition-colors shadow-sm flex items-center gap-1"
                              title="Reset session timer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reset
                            </button>
                            <button 
                              onClick={() => handleAction(student.id, 'end-session')}
                              className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 rounded-lg transition-colors shadow-sm flex items-center gap-1"
                              title="End active session"
                            >
                              <Power className="w-3.5 h-3.5" />
                              End
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No actions available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
