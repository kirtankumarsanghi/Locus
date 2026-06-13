import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function CheckinSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { deskNumber?: string; sessionId?: number } | null;
  const deskNumber = state?.deskNumber || '204';
  const sessionId = state?.sessionId;

  const now = new Date();
  const checkInTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const nextCheckIn = new Date(now.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleManageSession = () => {
    // Store session data and navigate to active session
    sessionStorage.setItem('activeSession', JSON.stringify({ deskNumber, sessionId }));
    navigate('/session');
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* TopAppBar (minimal) */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-md h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-xs text-primary hover:text-surface-tint transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-label-bold text-label-bold hidden sm:inline">Back</span>
        </button>
        <Logo variant="horizontal" showTagline={false} className="scale-75" />
        <Link to="/student" className="font-label-bold text-label-bold text-primary hover:underline">Close</Link>
      </header>

      <main className="flex-grow pt-[80px] px-gutter max-w-lg mx-auto w-full flex flex-col items-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mt-16 mb-lg shadow-lg">
          <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>

        <h1 className="font-display-lg text-display-lg text-on-surface mb-xs tracking-tight text-center">Check-in Successful</h1>
        <p className="font-body-base text-body-base text-primary mb-xl text-center">Welcome to Desk #{deskNumber}</p>

        {/* Session Details Card */}
        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm mb-lg">
          <div className="flex justify-between py-md border-b border-outline-variant/50">
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>schedule</span>
              <span className="font-body-base text-body-base">Check-in Time</span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface">{checkInTime}</span>
          </div>
          <div className="flex justify-between py-md">
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>update</span>
              <span className="font-body-base text-body-base">Next Check-in</span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface">{nextCheckIn}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-sm mb-lg">
          <Link to="/student/seats" className="w-full py-md bg-primary-container text-on-primary-container rounded-full font-label-bold text-label-bold flex items-center justify-center gap-sm hover:opacity-90 transition-opacity shadow-md">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
            View Map
          </Link>
          <button onClick={handleManageSession} className="w-full py-md bg-surface-container-high text-on-surface rounded-full font-label-bold text-label-bold flex items-center justify-center gap-sm hover:bg-surface-variant transition-colors border border-outline-variant">
            <span className="material-symbols-outlined">settings</span>
            Manage Session
          </button>
        </div>

        {/* Policy Tip */}
        <div className="w-full bg-surface-container-low p-md rounded-lg border border-outline-variant flex items-start gap-md">
          <span className="material-symbols-outlined text-tertiary">info</span>
          <div className="flex flex-col gap-xs">
            <span className="font-label-bold text-label-bold text-on-surface">Away Policy Reminder</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">If you need to leave temporarily, use the "Set Away" feature. Desks unoccupied for more than 30 minutes without an "Away" status will be automatically released to other students.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
