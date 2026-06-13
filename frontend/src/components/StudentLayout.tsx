import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationCenter from './NotificationCenter';

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/student', label: 'Dashboard', icon: 'dashboard', mobile: true },
    { path: '/student/smart', label: 'Smart Insights', icon: 'psychology', mobile: false },
    { path: '/student/seats', label: 'Find Seats', icon: 'event_seat', mobile: true },
    { path: '/student/rooms', label: 'Book Rooms', icon: 'meeting_room', mobile: true },
    { path: '/student/analytics', label: 'My Analytics', icon: 'analytics', mobile: false },
    { path: '/student/checkin', label: 'Check In', icon: 'qr_code_scanner', mobile: true },
    { path: '/student/profile', label: 'Profile', icon: 'account_circle', mobile: true },
    { path: '/help', label: 'Help', icon: 'help', mobile: false },
  ];

  // Only 5 items for mobile bottom nav
  const mobileNavItems = navItems.filter(item => item.mobile);

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
        {/* Logo Section with Notification */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="flex items-center gap-3 group flex-1">
              <Logo variant="compact" showTagline={false} />
              <div className="flex flex-col">
                <span className="text-xs text-slate-700 font-bold uppercase tracking-wider">Student</span>
                <span className="text-[10px] text-gray-500">Portal</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-px bg-gray-200" />
            <NotificationCenter />
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Main</p>
            {[navItems[0], navItems[1]].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isActive(item.path) ? 'fill' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="space-y-1 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Actions</p>
            {navItems.slice(2, 6).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isActive(item.path) ? 'fill' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="space-y-1 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Settings</p>
            {navItems.slice(6).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isActive(item.path) ? 'fill' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="font-semibold text-sm">Logout</span>
            </button>
          </div>
        </nav>

        {/* User Info Card */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-br from-slate-50 to-slate-100 relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full text-left bg-white rounded-xl p-3 border border-slate-200 hover:shadow-md transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold shadow-sm uppercase shrink-0">
              {user?.name.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{user?.name || 'Student User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.student_id || 'DEMO-STUDENT'}</p>
            </div>
            <span className="material-symbols-outlined text-gray-400 shrink-0">more_vert</span>
          </button>

          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute bottom-[calc(100%+0.5rem)] left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                <Link to="/student/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <span className="material-symbols-outlined text-lg">account_circle</span>
                  View Profile
                </Link>
                <Link to="/help" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <span className="material-symbols-outlined text-lg">help</span>
                  Help & Support
                </Link>
                <hr className="my-1 border-gray-100" />
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <Logo variant="compact" showTagline={false} />
          </div>
          
          <div className="flex items-center gap-2 relative">
            <NotificationCenter />
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold shadow-sm uppercase text-xs"
            >
              {user?.name.charAt(0) || 'S'}
            </button>

            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Student User'}</p>
                    <p className="text-xs text-gray-500">{user?.student_id || 'DEMO-STUDENT'}</p>
                  </div>
                  <Link to="/student/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <span className="material-symbols-outlined text-lg">account_circle</span>
                    Profile
                  </Link>
                  <Link to="/help" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <span className="material-symbols-outlined text-lg">help</span>
                    Help
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation - 5 items only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center px-2 py-2 safe-bottom">
          {mobileNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-0 ${
                isActive(item.path)
                  ? 'bg-slate-700 text-white scale-105'
                  : 'text-gray-500 hover:text-slate-700'
              }`}
            >
              <span 
                className={`material-symbols-outlined text-2xl ${
                  isActive(item.path) ? 'fill' : ''
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold mt-0.5 truncate max-w-[60px]">
                {item.label.replace(' ', '\n')}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold shadow-md uppercase">
                  {user?.name.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{user?.name || 'Student User'}</p>
                  <p className="text-xs text-gray-500">{user?.student_id || 'DEMO-STUDENT'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Drawer Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Navigation</p>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`material-symbols-outlined ${isActive(item.path) ? 'fill' : ''}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50/50">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
