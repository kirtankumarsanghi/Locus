import { API_BASE_URL } from '../config';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface Desk {
  id: number;
  number: string;
  label: string;
  status: string;
  zone?: string;
  floor?: number;
}

export default function CheckIn() {
  const location = useLocation();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [deskNumber, setDeskNumber] = useState(location.state?.prefillDesk || '');
  const [studentId, setStudentId] = useState(user?.student_id || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState<'quick' | 'qr' | 'manual'>('quick');
  const [cameraActive, setCameraActive] = useState(false);
  const [availableDesks, setAvailableDesks] = useState<Desk[]>([]);
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [loadingDesks, setLoadingDesks] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Auto-fill student ID from logged in user
  useEffect(() => {
    if (user?.student_id) {
      setStudentId(user.student_id);
    }
  }, [user]);

  // Fetch available desks
  const fetchAvailableDesks = async () => {
    setLoadingDesks(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/desks`);
      if (res.ok) {
        const data = await res.json();
        const free = data.desks.filter((d: Desk) => d.status === 'FREE');
        setAvailableDesks(free);
      }
    } catch (err) {
      console.error('Failed to fetch desks:', err);
    } finally {
      setLoadingDesks(false);
    }
  };

  useEffect(() => {
    fetchAvailableDesks();

    // Listen for desk updates
    if (socket) {
      socket.on('desk:updated', fetchAvailableDesks);
      return () => {
        socket.off('desk:updated');
      };
    }
  }, [socket]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera access denied. Please use manual entry.');
      setScanMode('manual');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (scanMode === 'qr') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [scanMode]);

  const handleCheckIn = async (desk?: Desk) => {
    setError('');
    
    const deskToUse = desk?.number || selectedDesk?.number || deskNumber;
    
    if (!deskToUse.trim()) {
      setError('Please select or enter a desk number');
      return;
    }
    
    if (!studentId.trim()) {
      setError('Please enter your student ID');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deskNumber: deskToUse, studentId }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        stopCamera();
        navigate('/checkin-success', { 
          state: { deskNumber: deskToUse, sessionId: data.sessionId } 
        });
      } else {
        setError(data.error || 'Failed to check in. Please try again.');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError('Network error. Backend might be unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-3">
            <span className="material-symbols-outlined text-4xl text-slate-700">how_to_reg</span>
            Check In to Desk
          </h1>
          <p className="mt-2 text-gray-600">
            Choose your preferred check-in method and start your study session
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 border-2 border-red-200 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <span className="material-symbols-outlined mt-0.5 text-red-600">error</span>
            <div className="flex-1">
              <p className="font-semibold">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        {/* Mode Selection Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
          <button
            onClick={() => setScanMode('quick')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              scanMode === 'quick'
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined">bolt</span>
            <span className="hidden sm:inline">Quick Select</span>
            <span className="sm:hidden">Quick</span>
          </button>
          <button
            onClick={() => setScanMode('qr')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              scanMode === 'qr'
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined">qr_code_scanner</span>
            <span className="hidden sm:inline">QR Scanner</span>
            <span className="sm:hidden">QR</span>
          </button>
          <button
            onClick={() => setScanMode('manual')}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              scanMode === 'manual'
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="material-symbols-outlined">edit</span>
            <span className="hidden sm:inline">Manual Entry</span>
            <span className="sm:hidden">Manual</span>
          </button>
        </div>

        {/* Quick Select Mode */}
        {scanMode === 'quick' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700">event_seat</span>
                  Available Desks ({availableDesks.length})
                </h2>
                <button 
                  onClick={fetchAvailableDesks}
                  disabled={loadingDesks}
                  className="p-2 text-gray-400 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <span className={`material-symbols-outlined ${loadingDesks ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                </button>
              </div>

              {loadingDesks ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
                </div>
              ) : availableDesks.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">event_busy</span>
                  <p className="text-gray-500 font-semibold mb-2">No desks available</p>
                  <p className="text-sm text-gray-400 mb-4">All desks are currently occupied</p>
                  <Link 
                    to="/student/seats"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">search</span>
                    Find Available Seats
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {availableDesks.map((desk) => (
                    <button
                      key={desk.id}
                      onClick={() => handleCheckIn(desk)}
                      disabled={loading}
                      className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-2 border-emerald-200 hover:border-emerald-300 rounded-2xl p-4 transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md">
                          <span className="material-symbols-outlined text-2xl">event_seat</span>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900">{desk.number}</p>
                          {desk.zone && (
                            <p className="text-xs text-gray-600">{desk.zone}</p>
                          )}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {availableDesks.length > 0 && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
                    <div>
                      <p className="text-sm text-blue-800 font-semibold">
                        Tap any desk to instantly check in and start your session!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Scanner Section */}
        {scanMode === 'qr' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-4xl">qr_code_scanner</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                QR Code Scanner
              </h2>
              
              <p className="text-gray-600">
                Position the QR code on the desk within the frame
              </p>
            </div>

            <div className="relative w-full max-w-md mx-auto aspect-square border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-gray-50 overflow-hidden mb-6">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3/4 h-3/4 border-4 border-slate-700 rounded-2xl shadow-lg"></div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  <span className="material-symbols-outlined text-gray-400 text-6xl mb-3">camera_alt</span>
                  <p className="text-sm text-gray-500">
                    Camera will start automatically
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">QR Code Scanning</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Full QR scanning with camera integration will be enabled in production. 
                    For now, use <strong>Quick Select</strong> or <strong>Manual Entry</strong> to check in.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScanMode('quick')}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Quick Select
                    </button>
                    <button
                      onClick={() => setScanMode('manual')}
                      className="px-3 py-1.5 bg-white text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      Manual Entry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry Form */}
        {scanMode === 'manual' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-2xl">edit</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Manual Check-In</h2>
                <p className="text-sm text-gray-500">Enter desk details to start your session</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">event_seat</span>
                  Desk Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., A-12, B-07, C-21"
                  value={deskNumber}
                  onChange={(e) => setDeskNumber(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-lg font-semibold"
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Find the desk number on the desk label or QR code
                </p>
              </div>

              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">badge</span>
                  Student ID
                  {user && <span className="text-emerald-600 text-xs font-normal">(Auto-filled from your account)</span>}
                </label>
                <input
                  type="text"
                  placeholder="e.g., STU-2026-001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  disabled={!!user}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-700 text-lg font-semibold"
                />
              </div>

              <button
                onClick={() => handleCheckIn()}
                disabled={loading || !deskNumber || !studentId}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking In...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl">login</span>
                    <span>Start Study Session</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600 text-xl">lightbulb</span>
                <div>
                  <p className="text-sm text-amber-800 font-semibold mb-2">
                    Not sure which desk is available?
                  </p>
                  <Link 
                    to="/student/seats"
                    className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 font-semibold underline"
                  >
                    <span className="material-symbols-outlined text-lg">search</span>
                    Browse available desks first
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Card */}
        <div className="mt-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-white text-2xl">info</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">How to Check In</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-lg shrink-0">check_circle</span>
                  <span><strong>Quick Select:</strong> Tap any available desk to instantly check in</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg shrink-0">qr_code_scanner</span>
                  <span><strong>QR Scanner:</strong> Scan the desk's QR code (coming soon)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-lg shrink-0">edit</span>
                  <span><strong>Manual Entry:</strong> Type the desk number directly</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-lg shrink-0">logout</span>
                  <span><strong>Remember:</strong> Check out when you're done studying!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

