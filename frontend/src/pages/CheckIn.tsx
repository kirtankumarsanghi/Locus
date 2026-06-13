import { API_BASE_URL } from '../config';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CheckIn() {
  const location = useLocation();
  const [deskNumber, setDeskNumber] = useState(location.state?.prefillDesk || '');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckIn = async () => {
    setError('');
    
    if (!deskNumber.trim()) {
      setError('Please enter a desk number');
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
        body: JSON.stringify({ deskNumber, studentId }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        navigate('/checkin-success', { 
          state: { deskNumber, sessionId: data.sessionId } 
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
    <div className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
      <div className="max-w-3xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Check In to Desk
          </h1>
          <p className="mt-2 text-gray-600">
            Scan a QR code or enter desk details manually
          </p>
        </div>

        {/* QR Scanner Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-4xl">qr_code_scanner</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            QR Scanner
          </h2>
          
          <p className="text-gray-600 mb-6">
            Position the QR code on the desk within the frame
          </p>

          <div className="relative w-64 h-64 mx-auto border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-gray-50 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-4 border-slate-700 rounded-2xl"></div>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-6xl z-10">camera_alt</span>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Camera integration available in production
          </p>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-gray-50 text-sm text-gray-500 font-medium">
              OR ENTER MANUALLY
            </span>
          </div>
        </div>

        {/* Manual Entry Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700">edit</span>
            Manual Check-In
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 border-2 border-red-200 p-4 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5">error</span>
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-semibold text-sm text-gray-700 mb-2 uppercase tracking-wider">
                Desk Number
              </label>
              <input
                type="text"
                placeholder="e.g., A-12 or B-07"
                value={deskNumber}
                onChange={(e) => setDeskNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-sm text-gray-700 mb-2 uppercase tracking-wider">
                Student ID
              </label>
              <input
                type="text"
                placeholder="e.g., STU-2026-001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
              />
            </div>

            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Checking In...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-2xl">login</span>
                  Start Session
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">How to Check In</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Find an available desk (green status)</li>
                <li>• Scan the QR code or enter the desk number</li>
                <li>• Your session starts immediately</li>
                <li>• Remember to check out when done!</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

