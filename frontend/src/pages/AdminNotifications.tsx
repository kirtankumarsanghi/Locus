import { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useSocket } from '../context/SocketContext';
import { Send, Bell } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface NotificationLog {
  id: number;
  user_id: number;
  user_name: string | null;
  type: string;
  title: string;
  message: string;
  priority: string;
  is_read: number;
  created_at: string;
}

export default function AdminNotifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'NORMAL',
    target_role: 'ALL'
  });

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (socket) {
      socket.on('notification:new', fetchNotifications);
      return () => {
        socket.off('notification:new');
      };
    }
  }, [socket]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to broadcast this message?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Successfully broadcasted to ${data.count} users.`);
        setFormData({ title: '', message: '', priority: 'NORMAL', target_role: 'ALL' });
        fetchNotifications();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to broadcast');
      }
    } catch (err) {
      console.error('Error broadcasting:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <Breadcrumb />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
        <p className="text-gray-500 mt-1">Broadcast messages to users and monitor system alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-primary" />
              Send Broadcast
            </h2>
            
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Target Audience</label>
                <select 
                  value={formData.target_role}
                  onChange={(e) => setFormData({...formData, target_role: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700"
                >
                  <option value="ALL">All Active Users</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="STAFF">Staff & Admins Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-700"
                >
                  <option value="NORMAL">Normal Priority</option>
                  <option value="HIGH">High Priority (Alert)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Library Closure Notice"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Message Body</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Enter the notification details here..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full flex justify-center items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                Broadcast Now
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Recent Notifications Log */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-500" />
                Notification History
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                  <Bell className="w-12 h-12 mb-3 opacity-20" />
                  <p>No notifications have been sent yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                            n.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {n.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-blue-100 text-blue-700">
                            {n.type.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mt-2">{n.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                      
                      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                        <span>Recipient: {n.user_name || `User ID ${n.user_id}`}</span>
                        <span>Status: {n.is_read ? 'Read' : 'Unread'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
