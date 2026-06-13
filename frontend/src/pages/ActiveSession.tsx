import { API_BASE_URL } from '../config';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

interface SessionData {
  id: number;
  desk_id: number;
  desk_label: string;
  status: 'ACTIVE' | 'ENDED';
  start_time: string;
  away_start_time: string | null;
  last_check_in_time: string;
}

export default function ActiveSession() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [session, setSession] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'OCCUPIED' | 'AWAY'>('IDLE');
  // const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const circleRef = useRef<SVGCircleElement>(null);
  const navigate = useNavigate();

  // Fetch active session on mount
  useEffect(() => {
    if (user?.student_id) {
      fetchActiveSession();
    }
  }, [user]);

  const fetchActiveSession = async () => {
    if (!user?.student_id) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/student/${user.student_id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.student.active_session) {
          setSession(data.student.active_session);
          
          // Determine status based on away_start_time
          if (data.student.active_session.away_start_time) {
            setStatus('AWAY');
          } else {
            setStatus('OCCUPIED');
          }
        } else {
          setStatus('IDLE');
        }
      }
    } catch (err) {
      console.error('Failed to fetch active session', err);
    } finally {
      setLoading(false);
    }
  };

  // Update elapsed time every second
  useEffect(() => {
    if (session && status !== 'IDLE') {
      const updateElapsed = () => {
        const timeToUse = status === 'AWAY' && session.away_start_time
          ? session.away_start_time
          : session.start_time;
        const elapsed = Math.floor((Date.now() - new Date(timeToUse).getTime()) / 1000);
        setElapsedTime(elapsed);
      };
      
      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [session, status]);

  // Update circular progress indicator
  useEffect(() => {
    if (circleRef.current && status !== 'IDLE') {
      const radius = 54;
      const circumference = radius * 2 * Math.PI;
      const maxTime = status === 'AWAY' ? 1200 : 7200; // 20min away, 120min active
      const percent = Math.min((elapsedTime / maxTime) * 100, 100);
      const offset = circumference - (percent / 100) * circumference;
      circleRef.current.style.strokeDasharray = `${circumference} ${circumference}`;
      circleRef.current.style.strokeDashoffset = `${offset}`;
    }
  }, [elapsedTime, status]);

  // Listen for session events
  useEffect(() => {
    if (!socket || !session) return;

    const handleSessionUpdate = (data: any) => {
      if (data.sessionId === session.id) {
        fetchActiveSession();
      }
    };

    const handleSessionExpired = (data: { sessionId: number }) => {
      if (data.sessionId === session.id) {
        alert('Your session has expired due to inactivity.');
        setSession(null);
        setStatus('IDLE');
      }
    };

    socket.on('session:away', handleSessionUpdate);
    socket.on('session:back', handleSessionUpdate);
    socket.on('session:checkout', handleSessionUpdate);
    socket.on('session:ended', handleSessionUpdate);
    socket.on('session:expired', handleSessionExpired);

    return () => {
      socket.off('session:away', handleSessionUpdate);
      socket.off('session:back', handleSessionUpdate);
      socket.off('session:checkout', handleSessionUpdate);
      socket.off('session:ended', handleSessionUpdate);
      socket.off('session:expired', handleSessionExpired);
    };
  }, [socket, session]);

  const handleAway = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/away`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });
      if (res.ok) {
        setStatus('AWAY');
        fetchActiveSession();
      }
    } catch (err) {
      console.error('Failed to mark as away', err);
    }
  };

  const handleHere = async () => {
    if (!session) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/here`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });
      if (res.ok) {
        setStatus('OCCUPIED');
        fetchActiveSession();
      }
    } catch (err) {
      console.error('Failed to mark as back', err);
    }
  };

  const handleEnd = async () => {
    if (!session) return;
    if (!confirm('Are you sure you want to end your session?')) return;
    
    try {
      await fetch(`${API_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });
      setSession(null);
      setStatus('IDLE');
      navigate('/student');
    } catch (err) {
      console.error('Failed to end session', err);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading session...</p>
              </div>
            </div>
          ) : status === 'IDLE' ? (
            /* No Active Session */
            <div className="bg-surface-container-lowest border border-outline-variant shadow-lg rounded-2xl p-xl flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <span className="material-symbols-outlined text-primary mb-lg" style={{ fontSize: '48px' }}>event_seat</span>
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-xs tracking-tight">No Active Session</h1>
              <p className="font-body-base text-body-base text-on-surface-variant mb-xl">You don't have an active study session right now.</p>

              <div className="w-full space-y-md">
                <Link
                  to="/student/checkin"
                  className="w-full bg-primary hover:bg-primary/90 text-on-primary py-lg px-lg rounded-xl font-headline-md text-headline-md transition-all duration-300 flex items-center justify-center gap-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 block"
                >
                  <span className="material-symbols-outlined">qr_code_scanner</span> Check In Now
                </Link>
                <Link
                  to="/student/seats"
                  className="w-full bg-surface hover:bg-surface-container text-primary py-lg px-lg rounded-xl font-headline-md text-headline-md transition-all duration-300 flex items-center justify-center gap-sm border-2 border-primary/20 hover:border-primary/40 shadow-sm hover:shadow-md block"
                >
                  <span className="material-symbols-outlined">search</span> Find Available Desk
                </Link>
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

                <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-xs tracking-tight">{session?.desk_label}</h1>
                <p className="font-body-base text-body-base text-on-surface-variant mb-xl">Main Library · Active Study Session</p>

                {/* Timer Circle */}
                <div className="relative w-56 h-56 mb-xl flex items-center justify-center">
                  <svg className="w-full h-full drop-shadow-md" viewBox="0 0 120 120">
                    <circle className="text-surface-variant stroke-current" cx="60" cy="60" fill="transparent" r="54" strokeWidth="6"></circle>
                    <circle ref={circleRef} className="text-primary stroke-current progress-ring__circle" cx="60" cy="60" fill="transparent" r="54" strokeDasharray="339.292" strokeDashoffset="0" strokeLinecap="round" strokeWidth="6"></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold font-mono-timer text-primary mb-1 tracking-tight">{formatTime(elapsedTime)}</span>
                    <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Elapsed Time</span>
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
        <Link to="/student/seats" className="flex flex-col items-center justify-center text-on-surface-variant rounded-lg px-4 py-1">
          <span className="material-symbols-outlined">explore</span>
          <span className="font-label-bold text-[10px] mt-1">Map</span>
        </Link>
        <span className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 scale-90 shadow-sm">
          <span className="material-symbols-outlined fill">person</span>
          <span className="font-label-bold text-[10px] mt-1">Session</span>
        </span>
        <Link to="/student/profile" className="flex flex-col items-center justify-center text-on-surface-variant rounded-lg px-4 py-1">
          <span className="material-symbols-outlined">notifications</span>
          <span className="font-label-bold text-[10px] mt-1">Alerts</span>
        </Link>
      </nav>
    </div>
  );
}
