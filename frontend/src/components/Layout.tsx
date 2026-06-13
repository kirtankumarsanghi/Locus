import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Logo from './Logo';

const navItems = [
  { to: '/map', icon: 'map', label: 'Map View' },
  { to: '/list', icon: 'list_alt', label: 'Desk List' },
  { to: '/rooms', icon: 'meeting_room', label: 'Rooms' },
  { to: '/analytics', icon: 'analytics', label: 'Analytics' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

const bottomItems = [
  { to: '#', icon: 'help', label: 'Help' },
  { to: '#', icon: 'logout', label: 'Logout' },
];

const mobileNavItems = [
  { to: '/map', icon: 'explore', label: 'Map' },
  { to: '/session', icon: 'desk', label: 'My Desk' },
  { to: '#', icon: 'notifications', label: 'Alerts' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="mesh-bg text-on-surface font-body-base h-screen overflow-hidden flex flex-col">
      {/* Premium TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-white/98 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
        <Logo variant="default" className="scale-[0.35] origin-left -ml-4" />
        
        {/* Right side controls with premium styling */}
        <div className="flex items-center gap-3">
          <button 
            aria-label="notifications" 
            className="relative p-2.5 text-gray-600 hover:text-primary hover:bg-primary/5 transition-all rounded-xl group"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
          </button>
          <button 
            aria-label="account" 
            className="p-2.5 text-gray-600 hover:text-primary hover:bg-primary/5 transition-all rounded-xl"
          >
            <span className="material-symbols-outlined text-2xl">account_circle</span>
          </button>
          <div className="ml-2 h-8 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-lg">person</span>
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight">Admin User</p>
              <p className="text-[10px] text-gray-500">Staff Portal</p>
            </div>
          </div>
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
                <h2 className="font-headline-md text-base text-on-surface font-bold leading-tight">Main<br/>Library</h2>
                <p className="font-body-sm text-xs text-on-surface-variant">Staff Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation Items - matching the image style */}
          <ul className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {navItems.map(item => {
              const isActive = location.pathname === item.to;
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
                <span className="flex items-center gap-3 px-4 py-3 text-on-surface-variant bg-surface-container/40 hover:bg-surface-container/60 hover:text-on-surface transition-all rounded-xl font-semibold cursor-pointer group text-sm">
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
              <p className="font-semibold text-xs text-on-surface truncate">Admin User</p>
              <p className="text-[10px] text-on-surface-variant truncate">admin@library.edu</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-base">more_vert</span>
          </div>
        </nav>

        {/* Page Content (injected via Outlet) */}
        <Outlet />
      </div>

      {/* Enhanced BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white/95 backdrop-blur-2xl border-t-2 border-primary/10 shadow-2xl">
        {mobileNavItems.map(item => {
          const isActive = item.to !== '#' && location.pathname === item.to;
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
    </div>
  );
}
