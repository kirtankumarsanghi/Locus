import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Settings() {
  const navigate = useNavigate();
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [libraryName, setLibraryName] = useState('Main Library');
  const [location, setLocation] = useState('Main Campus');
  const [totalDesks, setTotalDesks] = useState('8');
  const [awayTimeout, setAwayTimeout] = useState('30');
  const [autoRelease, setAutoRelease] = useState('60');
  const [openTime, setOpenTime] = useState('07:00');
  const [closeTime, setCloseTime] = useState('23:00');
  const [initialSettings, setInitialSettings] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setLibraryName(data.library_name);
        setLocation(data.location);
        setTotalDesks(data.total_desks.toString());
        setAwayTimeout(data.away_timeout.toString());
        setAutoRelease(data.auto_release.toString());
        setOpenTime(data.open_time);
        setCloseTime(data.close_time);
        
        setInitialSettings({
          libraryName: data.library_name,
          location: data.location,
          totalDesks: data.total_desks.toString(),
          awayTimeout: data.away_timeout.toString(),
          autoRelease: data.auto_release.toString(),
          openTime: data.open_time,
          closeTime: data.close_time,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        libraryName,
        location,
        totalDesks: parseInt(totalDesks),
        awayTimeout: parseInt(awayTimeout),
        autoRelease: parseInt(autoRelease),
        openTime,
        closeTime
      };
      
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setHasChanges(false);
        setSaveSuccess(true);
        setInitialSettings({
          libraryName,
          location,
          totalDesks,
          awayTimeout,
          autoRelease,
          openTime,
          closeTime
        });
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving settings');
    }
  };

  const handleCancel = () => {
    setHasChanges(false);
    if (initialSettings) {
      setLibraryName(initialSettings.libraryName);
      setLocation(initialSettings.location);
      setTotalDesks(initialSettings.totalDesks);
      setAwayTimeout(initialSettings.awayTimeout);
      setAutoRelease(initialSettings.autoRelease);
      setOpenTime(initialSettings.openTime);
      setCloseTime(initialSettings.closeTime);
    }
  };

  const handleGenerateQR = () => {
    alert('QR codes generated for all 8 desks!\n\nIn production, this would generate printable PDF with QR codes linking to the check-in page for each desk.');
  };

  const computeHours = () => {
    if (!openTime || !closeTime) return 0;
    const [oh, om] = openTime.split(':').map(Number);
    const [ch, cm] = closeTime.split(':').map(Number);
    const diff = (ch * 60 + cm) - (oh * 60 + om);
    return diff > 0 ? Math.round(diff / 60) : 0;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
  }

  return (
    <main className="flex-1 md:ml-64 p-6 md:p-8 mx-auto mb-20 md:mb-0 overflow-y-auto bg-gray-50">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-all mb-6 group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="font-semibold">Back</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600 text-lg">Configure how things work ⚙️</p>
          </div>
          {hasChanges && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-semibold">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>You have unsaved changes</span>
            </div>
          )}
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-xl">settings</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
            <p className="text-sm text-gray-500">Basic info about your library</p>
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <span className="material-symbols-outlined text-slate-700 text-sm">domain</span>
              Library Name
            </label>
            <input 
              type="text" 
              value={libraryName}
              onChange={(e) => { setLibraryName(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-3.5 bg-white border border-gray-200 hover:border-slate-300 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <span className="material-symbols-outlined text-slate-700 text-sm">location_on</span>
              Location
            </label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => { setLocation(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-3.5 bg-white border border-gray-200 hover:border-slate-300 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200 transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <span className="material-symbols-outlined text-slate-700 text-sm">counter_1</span>
              Total Desks
            </label>
            <input 
              type="number" 
              value={totalDesks}
              onChange={(e) => { setTotalDesks(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-3.5 bg-white border border-gray-200 hover:border-slate-300 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-slate-600 focus:ring-2 focus:ring-slate-200 transition-all"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">info</span>
              This should match physical desks in your space
            </p>
          </div>
        </div>
      </div>

      {/* Enforcement Rules */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-xl">gavel</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Enforcement Rules</h2>
            <p className="text-sm text-gray-500">How strict should we be?</p>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <span className="material-symbols-outlined text-amber-600 text-sm">timer</span>
              Away Timeout (minutes)
            </label>
            <input 
              type="number" 
              value={awayTimeout}
              onChange={(e) => { setAwayTimeout(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 hover:border-amber-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm"
            />
            <p className="text-xs text-gray-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              Desks get flagged as "abandoned" after this time
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <span className="material-symbols-outlined text-amber-600 text-sm">lock_clock</span>
              Auto-Release Timeout (minutes)
            </label>
            <input 
              type="number" 
              value={autoRelease}
              onChange={(e) => { setAutoRelease(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 hover:border-amber-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm"
            />
            <p className="text-xs text-gray-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              System automatically frees up the desk after this
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Notifications & Actions</p>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-all">
                <input 
                  type="checkbox" 
                  id="notifications" 
                  defaultChecked 
                  onChange={() => setHasChanges(true)}
                  className="mt-0.5 w-5 h-5 text-slate-700 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 transition-all cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-800">Send notifications to staff</span>
                  <p className="text-xs text-gray-500 mt-1">Get alerts when desks are flagged</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-all">
                <input 
                  type="checkbox" 
                  id="autorelease" 
                  defaultChecked 
                  onChange={() => setHasChanges(true)}
                  className="mt-0.5 w-5 h-5 text-slate-700 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 transition-all cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-800">Enable automatic desk release</span>
                  <p className="text-xs text-gray-500 mt-1">Let the system handle timeouts</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-xl">schedule</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Operating Hours</h2>
            <p className="text-sm text-gray-500">When are you open?</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <span className="material-symbols-outlined text-emerald-600 text-sm">wb_sunny</span>
              Opening Time
            </label>
            <input 
              type="time" 
              value={openTime}
              onChange={(e) => { setOpenTime(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 hover:border-emerald-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <span className="material-symbols-outlined text-emerald-600 text-sm">nights_stay</span>
              Closing Time
            </label>
            <input 
              type="time" 
              value={closeTime}
              onChange={(e) => { setCloseTime(e.target.value); setHasChanges(true); }}
              className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 hover:border-emerald-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="mt-4 p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
          <p className="text-sm text-gray-700 flex items-start gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-sm mt-0.5">info</span>
            <span>Your library is open for <span className="font-bold text-emerald-700">{computeHours()} hours</span> daily</span>
          </p>
        </div>
      </div>

      {/* QR Code Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-xl">qr_code</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">QR Code Settings</h2>
            <p className="text-sm text-gray-500">Manage check-in/out codes</p>
          </div>
        </div>
        <div className="space-y-4 mb-6">
          <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-all">
            <input 
              type="checkbox" 
              id="qrRequired" 
              defaultChecked 
              onChange={() => setHasChanges(true)}
              className="mt-0.5 w-5 h-5 text-slate-700 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 transition-all cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-800">Require QR scan for check-in</span>
              <p className="text-xs text-gray-500 mt-1">Students must scan desk QR to start session</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-all">
            <input 
              type="checkbox" 
              id="qrCheckout" 
              onChange={() => setHasChanges(true)}
              className="mt-0.5 w-5 h-5 text-slate-700 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 transition-all cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-800">Require QR scan for check-out</span>
              <p className="text-xs text-gray-500 mt-1">Optional: also require scan to end session</p>
            </div>
          </label>
        </div>

        <button 
          onClick={handleGenerateQR}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] group"
        >
          <span className="material-symbols-outlined">qr_code_scanner</span>
          <span>Generate QR Codes</span>
          <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
        <p className="text-xs text-gray-500 mt-3 text-center md:text-left">Creates printable QR codes for all desks</p>
      </div>

      {/* Save Actions */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-6 rounded-t-2xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-600">
          {saveSuccess ? (
            <span className="flex items-center gap-2 text-emerald-600">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Settings saved successfully!
            </span>
          ) : hasChanges ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              You have unsaved changes
            </span>
          ) : (
            <span className="flex items-center gap-2 text-emerald-600">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              All changes saved
            </span>
          )}
        </p>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleCancel}
            className="flex-1 md:flex-none px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1 md:flex-none px-8 py-3.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span>Save Changes</span>
            <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">check</span>
          </button>
        </div>
      </div>
    </main>
  );
}
