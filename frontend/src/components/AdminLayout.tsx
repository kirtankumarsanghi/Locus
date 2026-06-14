import { useState } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationCenter from './NotificationCenter';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', icon: 'dashboard', label: 'Dashboard' },
    { to: '/admin/users', icon: 'group', label: 'Users' },
    { to: '/admin/students', icon: 'school', label: 'Students' },
    { to: '/admin/staff', icon: 'badge', label: 'Staff' },
    { to: '/admin/desks', icon: 'desk', label: 'Desks' },
    { to: '/admin/rooms', icon: 'meeting_room', label: 'Rooms' },
    { to: '/admin/analytics', icon: 'analytics', label: 'Analytics' },
    { to: '/admin/activity', icon: 'history', label: 'Activity' },
    { to: '/admin/notifications', icon: 'campaign', label: 'Notifications' },
    { to: '/admin/settings', icon: 'settings', label: 'Settings' },
  ];

  const bottomItems = [
    { to: '/help', icon: 'help', label: 'Help' },
    { to: '#', icon: 'logout', label: 'Logout' },
  ];

  const mobileNavItems = [
    { to: '/admin', icon: 'dashboard', label: 'Home' },
    { to: '/admin/users', icon: 'group', label: 'Users' },
    { to: '/admin/desks', icon: 'desk', label: 'Desks' },
    { to: '/admin/rooms', icon: 'meeting_room', label: 'Rooms' },
    { to: '/admin/analytics', icon: 'analytics', label: 'Stats' },
  ];

  return (
    <div className="mesh-bg text-on-surface font-body-base h-screen overflow-hidden flex flex-col">
      {/* Premium TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-20 bg-white/98 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
            title="Go Back"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>

          <Link to="/" className="hidden sm:block hover:opacity-80 transition-opacity">
            <Logo variant="default" className="scale-[0.35] origin-left ml-2" />
          </Link>
          <Link to="/" className="sm:hidden ml-2 hover:opacity-80 transition-opacity">
            <span className="font-display-lg text-lg font-bold text-slate-800 tracking-tight">LOCUS</span>
          </Link>
        </div>
        
        {/* Right side controls with premium styling */}
        <div className="flex items-center gap-3 relative">
          <NotificationCenter />
          <button 
            aria-label="account" 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="p-2.5 text-gray-600 hover:text-primary hover:bg-primary/5 transition-all rounded-xl"
          >
            <span className="material-symbols-outlined text-2xl">account_circle</span>
          </button>
          <div className="ml-2 h-8 w-px bg-gray-200"></div>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-lg">person</span>
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] text-gray-500">Admin Portal</p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@locus.edu'}</p>
              </div>
              <Link to="/admin/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <span className="material-symbols-outlined text-lg">settings</span>
                Settings
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left">
                <span className="material-symbols-outlined text-lg">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 mt-[80px] h-[calc(100vh-80px)] overflow-hidden">
        {/* Enhanced SideNavBar (Desktop) */}
        <nav className="hidden md:flex flex-col fixed left-0 top-20 h-[calc(100vh-80px)] w-64 p-3 bg-gradient-to-b from-white/95 to-indigo-50/90 backdrop-blur-2xl border-r-2 border-primary/10 z-40 shadow-2xl">
          {/* Library Info Card - matching the image design */}
          <div className="mb-3 p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              {/* Horizontal LOCUS text in card */}
              <div className="flex items-center gap-0.5 text-slate-700 font-black text-lg tracking-tight">
                <span>L</span>
                <span>O</span>
                <span>C</span>
                <span>U</span>
                <span>S</span>
              </div>
              <div className="flex-1">
                <h2 className="font-headline-md text-base text-on-surface font-bold leading-tight">Admin<br/>Portal</h2>
                <p className="font-body-sm text-xs text-on-surface-variant">Management</p>
              </div>
            </div>
          </div>

          {/* Navigation Items - matching the image style */}
          <ul className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {navItems.map(item => {
              // Exact match for dashboard, startswith for subroutes
              const isActive = item.to === '/admin' 
                ? location.pathname === '/admin' 
                : location.pathname.startsWith(item.to);
                
              const isDisabled = item.to === '#';
              
              return (
                <li key={item.label}>
                  {isDisabled ? (
                    <span className="flex items-center gap-3 px-4 py-3 text-on-surface-variant bg-surface-container/40 hover:bg-surface-container/60 transition-all rounded-xl font-semibold cursor-default opacity-50 text-sm">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-highest/70 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                      </div>
                      <span>{item.label}</span>
                    </span>
                  ) : (
                    <NavLink
                      to={item.to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                        isActive 
                          ? 'bg-slate-700 text-white shadow-lg' 
                          : 'text-on-surface-variant bg-surface-container/40 hover:bg-surface-container/60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-surface-container-highest/70'
                      }`}>
                        <span className={`material-symbols-outlined text-lg ${isActive ? 'fill' : ''}`}>{item.icon}</span>
                      </div>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto material-symbols-outlined text-base">chevron_right</span>
                      )}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Bottom Items */}
          <ul className="mt-2 flex flex-col gap-2 border-t-2 border-primary/10 pt-2">
            {bottomItems.map(item => (
              <li key={item.label}>
                <span 
                  onClick={item.label === 'Logout' ? handleLogout : undefined}
                  className="flex items-center gap-3 px-4 py-3 text-on-surface-variant bg-surface-container/40 hover:bg-surface-container/60 hover:text-on-surface transition-all rounded-xl font-semibold cursor-pointer group text-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest/70 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  </div>
                  <span>{item.label}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* User Profile Card */}
          <div className="mt-2 p-2.5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 flex items-center gap-2.5 cursor-pointer hover:scale-[1.01] transition-transform">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-lg">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-on-surface truncate">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] text-on-surface-variant truncate">{user?.email || 'admin@locus.edu'}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-base">more_vert</span>
          </div>
        </nav>

        {/* Page Content (injected via Outlet) */}
        <div className="flex-1 md:ml-64 overflow-y-auto">
          <Outlet />
        </div>
      </div>

      {/* Enhanced BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white/95 backdrop-blur-2xl border-t-2 border-primary/10 shadow-2xl">
        {mobileNavItems.map(item => {
          const isActive = item.to === '/admin'
            ? location.pathname === '/admin'
            : item.to !== '#' && location.pathname.startsWith(item.to);
          return item.to === '#' ? (
            <span key={item.label} className="flex flex-col items-center justify-center text-on-surface-variant rounded-xl px-3 py-2 opacity-50">
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="font-label-bold text-[10px] mt-1">{item.label}</span>
            </span>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 transition-all ${
                isActive 
                  ? 'bg-gradient-to-br from-primary to-purple-600 text-white scale-105 shadow-lg shadow-primary/30' 
                  : 'text-on-surface-variant hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? 'fill' : ''}`}>{item.icon}</span>
              <span className="font-label-bold text-[10px] mt-1 font-semibold">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <Logo variant="compact" showTagline={false} />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Navigation</p>
                <ul className="flex flex-col gap-1">
                  {navItems.map(item => {
                    const isActive = item.to === '/admin' 
                      ? location.pathname === '/admin' 
                      : location.pathname.startsWith(item.to);
                    
                    if (item.to === '#') return null;

                    return (
                      <li key={item.label}>
                        <NavLink
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                            isActive 
                              ? 'bg-primary text-white shadow-md' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className="material-symbols-outlined">{item.icon}</span>
                          <span>{item.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
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
