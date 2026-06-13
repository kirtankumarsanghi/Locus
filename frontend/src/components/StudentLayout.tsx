import { Link, Outlet, useLocation } from 'react-router-dom';
import Logo from './Logo';

export default function StudentLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/student', label: 'Dashboard', icon: 'dashboard' },
    { path: '/student/seats', label: 'Find Seats', icon: 'event_seat' },
    { path: '/student/checkin', label: 'Check In', icon: 'qr_code_scanner' },
    { path: '/student/profile', label: 'Profile', icon: 'account_circle' },
  ];

  const isActive = (path: string) => {
    if (path === '/student') {
      return location.pathname === '/student';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 fixed h-screen z-30">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo variant="compact" showTagline={false} />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Student Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info Card */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold shadow-sm">
                P
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">Priya Sharma</p>
                <p className="text-xs text-gray-500 truncate">STU-2026-001</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo variant="compact" showTagline={false} />
          <span className="text-xs text-gray-500 uppercase tracking-wider">Student</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg rounded-t-3xl">
        <div className="flex justify-around items-center px-4 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'text-slate-700'
                  : 'text-gray-400'
              }`}
            >
              <span 
                className={`material-symbols-outlined text-2xl ${
                  isActive(item.path) ? 'fill' : ''
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
