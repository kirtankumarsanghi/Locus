import { NavLink, Outlet, useLocation } from 'react-router-dom';

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
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-md h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-sm">
          <span className="font-display-lg text-display-lg text-primary font-bold hidden md:block">Locus</span>
          <span className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold md:hidden">Locus</span>
        </div>
        <div className="flex items-center gap-sm">
          <button aria-label="notifications" className="p-xs text-secondary hover:bg-surface-container-high transition-colors rounded-full">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button aria-label="account" className="p-xs text-secondary hover:bg-surface-container-high transition-colors rounded-full">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 mt-[64px] h-[calc(100vh-64px)] overflow-hidden">
        {/* SideNavBar (Desktop) */}
        <nav className="hidden md:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] w-64 p-sm bg-surface-container-low/60 backdrop-blur-md border-r border-outline-variant z-40">
          <div className="mb-lg px-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface">Main Library</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Staff Portal</p>
          </div>
          <ul className="flex-1 flex flex-col gap-xs">
            {navItems.map(item => {
              const isActive = location.pathname === item.to;
              const isDisabled = item.to === '#';
              return (
                <li key={item.label}>
                  {isDisabled ? (
                    <span className="flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-full font-label-bold text-label-bold cursor-default">
                      <span className="material-symbols-outlined">{item.icon}</span>
                      {item.label}
                    </span>
                  ) : (
                    <NavLink
                      to={item.to}
                      className={`flex items-center gap-sm px-md py-sm rounded-full font-label-bold text-label-bold transition-all ${isActive ? 'bg-secondary-container text-on-secondary-container translate-x-1 shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                    >
                      <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>{item.icon}</span>
                      {item.label}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
          <ul className="mt-auto flex flex-col gap-xs border-t border-outline-variant pt-sm">
            {bottomItems.map(item => (
              <li key={item.label}>
                <span className="flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-full font-label-bold text-label-bold cursor-default">
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </nav>

        {/* Page Content (injected via Outlet) */}
        <Outlet />
      </div>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-gutter py-xs bg-surface/90 backdrop-blur-md border-t border-outline-variant shadow-xl rounded-t-3xl">
        {mobileNavItems.map(item => {
          const isActive = item.to !== '#' && location.pathname === item.to;
          return item.to === '#' ? (
            <span key={item.label} className="flex flex-col items-center justify-center text-on-surface-variant rounded-lg px-4 py-1">
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-bold text-[10px] mt-1">{item.label}</span>
            </span>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-all ${isActive ? 'bg-primary-container text-on-primary-container scale-90 shadow-sm' : 'text-on-surface-variant'}`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'fill' : ''}`}>{item.icon}</span>
              <span className="font-label-bold text-[10px] mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
