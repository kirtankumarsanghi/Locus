import { API_BASE_URL } from '../config';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function ActiveSession() {
  const [deskNumber, setDeskNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'OCCUPIED' | 'AWAY'>('IDLE');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(2700);
  const circleRef = useRef<SVGCircleElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (status !== 'IDLE') {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  useEffect(() => {
    if (circleRef.current && status !== 'IDLE') {
      const radius = 54;
      const circumference = radius * 2 * Math.PI;
      const maxTime = status === 'AWAY' ? 1200 : 2700;
      const percent = (timeLeft / maxTime) * 100;
      const offset = circumference - (percent / 100) * circumference;
      circleRef.current.style.strokeDasharray = `${circumference} ${circumference}`;
      circleRef.current.style.strokeDashoffset = `${offset}`;
    }
  }, [timeLeft, status]);

  const handleCheckIn = async () => {
    setError('');
    try {
      const res = await fetch(`\${API_BASE_URL}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskNumber: parseInt(deskNumber), studentId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessionId(data.sessionId);
        // Navigate to success page, then return here for active session
        navigate('/checkin-success', { state: { deskNumber, sessionId: data.sessionId } });
      } else {
        setError(data.error || 'Failed to check in');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  // Check if we're returning from checkin-success
  useEffect(() => {
    const stored = sessionStorage.getItem('activeSession');
    if (stored) {
      const data = JSON.parse(stored);
      setDeskNumber(data.deskNumber);
      setSessionId(data.sessionId);
      setStatus('OCCUPIED');
      setTimeLeft(2700);
      sessionStorage.removeItem('activeSession');
    }
  }, []);

  const handleAway = async () => {
    try {
      const res = await fetch(`\${API_BASE_URL}/api/away`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) { setStatus('AWAY'); setTimeLeft(1200); }
    } catch (err) {}
  };

  const handleHere = async () => {
    try {
      const res = await fetch(`\${API_BASE_URL}/api/here`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) { setStatus('OCCUPIED'); setTimeLeft(2700); }
    } catch (err) {}
  };

  const handleEnd = () => {
    setSessionId(null);
    setStatus('IDLE');
    setDeskNumber('');
    setStudentId('');
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-md h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-xs text-primary hover:text-surface-tint transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-label-bold text-label-bold hidden sm:inline">Back</span>
        </button>
        <Logo variant="compact" showTagline={false} />
        <div className="flex items-center gap-sm">
          <button className="p-xs text-secondary hover:bg-surface-container-high transition-colors rounded-full">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-xs text-secondary hover:bg-surface-container-high transition-colors rounded-full">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <main className="flex-grow pt-[80px] pb-[80px] md:pb-0 px-gutter md:px-lg max-w-container-max mx-auto w-full flex flex-col md:flex-row gap-lg">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-lg mt-lg">

          {status === 'IDLE' ? (
            /* Check-in Form */
            <div className="bg-surface-container-lowest border border-outline-variant shadow-lg rounded-2xl p-xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <span className="material-symbols-outlined text-primary mb-lg" style={{ fontSize: '48px' }}>qr_code_scanner</span>
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-xs tracking-tight">Scan to Check-in</h1>
              <p className="font-body-base text-body-base text-on-surface-variant mb-xl">Enter your desk number and student ID to begin your session.</p>

              {error && (
                <div className="w-full bg-error-container text-on-error-container p-sm rounded-lg flex items-start gap-sm border border-error/20 shadow-sm mb-lg">
                  <span className="material-symbols-outlined mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <p className="font-label-bold text-label-bold">{error}</p>
                </div>
              )}

              <div className="w-full space-y-md text-left">
                <div>
                  <label className="block font-label-bold text-label-bold text-on-surface-variant mb-1 uppercase tracking-wider">Desk Number</label>
                  <input type="number" value={deskNumber} onChange={e => setDeskNumber(e.target.value)} className="w-full border border-outline-variant rounded-lg p-3 bg-surface font-body-base text-body-base text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. 1" />
                </div>
                <div>
                  <label className="block font-label-bold text-label-bold text-on-surface-variant mb-1 uppercase tracking-wider">Student ID</label>
                  <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full border border-outline-variant rounded-lg p-3 bg-surface font-body-base text-body-base text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. S-123456" />
                </div>
                <button onClick={handleCheckIn} className="w-full bg-primary hover:bg-primary/90 text-on-primary py-lg px-lg rounded-xl font-headline-md text-headline-md transition-all duration-300 flex items-center justify-center gap-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 mt-md">
                  <span className="material-symbols-outlined">login</span> Start Session
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Warning Banner */}
              <div className="bg-error-container text-on-error-container p-sm rounded-lg flex items-start gap-sm border border-error/20 shadow-sm">
                <span className="material-symbols-outlined mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <div>
                  <p className="font-label-bold text-label-bold">Server-side timers active.</p>
                  <p className="font-body-sm text-body-sm mt-xs">Session expires if prompt is missed.</p>
                </div>
              </div>

              {/* Main Status Card */}
              <div className="bg-gradient-to-br from-surface-container-lowest via-surface to-primary/5 animate-gradient-bg border border-outline-variant shadow-lg rounded-2xl p-xl flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>

                <div className="inline-flex items-center justify-center bg-secondary-container/80 backdrop-blur-sm text-on-secondary-container rounded-full px-md py-xs mb-lg border border-secondary-fixed-dim shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary mr-2.5 animate-pulse shadow-[0_0_8px_rgba(53,37,205,0.6)]"></span>
                  <span className="font-label-bold text-label-bold uppercase tracking-wider text-primary">{status === 'AWAY' ? 'Away' : 'Active Session'}</span>
                </div>

                <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-xs tracking-tight">Desk #{deskNumber}</h1>
                <p className="font-body-base text-body-base text-on-surface-variant mb-xl">Main Library, 2nd Floor Quiet Zone</p>

                {/* Timer Circle */}
                <div className="relative w-56 h-56 mb-xl flex items-center justify-center">
                  <svg className="w-full h-full drop-shadow-md" viewBox="0 0 120 120">
                    <circle className="text-surface-variant stroke-current" cx="60" cy="60" fill="transparent" r="54" strokeWidth="6"></circle>
                    <circle ref={circleRef} className="text-primary stroke-current progress-ring__circle" cx="60" cy="60" fill="transparent" r="54" strokeDasharray="339.292" strokeDashoffset="0" strokeLinecap="round" strokeWidth="6"></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold font-mono-timer text-primary mb-1 tracking-tight">{formatTime(timeLeft)}</span>
                    <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">{status === 'AWAY' ? 'Until Abandoned' : 'Until Next Prompt'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex flex-col md:flex-row gap-md">
                  {status === 'OCCUPIED' ? (
                    <button onClick={handleAway} className="flex-1 bg-primary hover:bg-primary/90 text-on-primary py-lg px-lg rounded-xl font-headline-md text-headline-md transition-all duration-300 flex items-center justify-center gap-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                      <span className="material-symbols-outlined">timer</span> Go Away (20m limit)
                    </button>
                  ) : (
                    <button onClick={handleHere} className="flex-1 bg-primary hover:bg-primary/90 text-on-primary py-lg px-lg rounded-xl font-headline-md text-headline-md transition-all duration-300 flex items-center justify-center gap-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                      <span className="material-symbols-outlined">check_circle</span> I'm Back
                    </button>
                  )}
                  <button onClick={handleEnd} className="flex-1 bg-surface hover:bg-error-container text-error py-lg px-lg rounded-xl font-headline-md text-headline-md transition-all duration-300 flex items-center justify-center gap-sm border-2 border-error/20 hover:border-error/40 shadow-sm hover:shadow-md">
                    <span className="material-symbols-outlined">logout</span> End Session
                  </button>
                </div>
              </div>

              {/* Session Rules */}
              <div className="bg-surface-container-low border border-outline-variant shadow-sm rounded-2xl p-lg transition-all hover:shadow-md">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-md flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">info</span>
                  Session Rules
                </h3>
                <ul className="space-y-md">
                  <li className="flex items-start gap-md bg-surface p-md rounded-xl border border-outline-variant/50">
                    <span className="material-symbols-outlined text-primary mt-0.5 text-[24px]">notifications_active</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">A <strong className="text-on-surface">"Still here?"</strong> prompt will appear periodically. You must acknowledge it within 5 minutes to maintain your reservation.</p>
                  </li>
                  <li className="flex items-start gap-md bg-surface p-md rounded-xl border border-outline-variant/50">
                    <span className="material-symbols-outlined text-primary mt-0.5 text-[24px]">directions_run</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">Use the <strong className="text-on-surface">"Go Away"</strong> button to temporarily leave your desk for bathroom breaks or phone calls without losing your spot.</p>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-gutter py-xs bg-surface/90 backdrop-blur-md border-t border-outline-variant shadow-xl rounded-t-3xl">
        <Link to="/" className="flex flex-col items-center justify-center text-on-surface-variant rounded-lg px-4 py-1">
          <span className="material-symbols-outlined">explore</span>
          <span className="font-label-bold text-[10px] mt-1">Map</span>
        </Link>
        <span className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 scale-90 shadow-sm">
          <span className="material-symbols-outlined fill">person</span>
          <span className="font-label-bold text-[10px] mt-1">Session</span>
        </span>
        <Link to="/" className="flex flex-col items-center justify-center text-on-surface-variant rounded-lg px-4 py-1">
          <span className="material-symbols-outlined">notifications</span>
          <span className="font-label-bold text-[10px] mt-1">Alerts</span>
        </Link>
      </nav>
    </div>
  );
}


