import { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { Save, Settings as SettingsIcon, Clock, ShieldAlert, BookOpen } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('Settings saved successfully!');
        fetchSettings();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Breadcrumb />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          Global Configuration
        </h1>
        <p className="text-gray-500 mt-1">Configure library operating hours, rules, and system behavior.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-500" />
            Operating Hours
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Opening Time</label>
              <input 
                type="time" 
                value={settings.opening_time || '08:00'}
                onChange={(e) => handleChange('opening_time', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Closing Time</label>
              <input 
                type="time" 
                value={settings.closing_time || '23:00'}
                onChange={(e) => handleChange('closing_time', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            <div className="md:col-span-2 space-y-1.5">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={settings.weekend_closed === 'true' || settings.weekend_closed === true}
                  onChange={(e) => handleChange('weekend_closed', e.target.checked ? 'true' : 'false')}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Close on Weekends</span>
                  <span className="text-xs text-gray-500">Prevent bookings and desk check-ins on Saturdays and Sundays.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Desk Policy */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-gray-500" />
            Desk & Session Policies
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Max 'Away' Time (minutes)</label>
              <input 
                type="number" 
                min="5"
                max="60"
                value={settings.max_away_minutes || 20}
                onChange={(e) => handleChange('max_away_minutes', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="text-xs text-gray-500">Time a student can step away before their session ends.</p>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Session Warning Threshold (minutes)</label>
              <input 
                type="number" 
                min="1"
                max="30"
                value={settings.away_warning_minutes || 15}
                onChange={(e) => handleChange('away_warning_minutes', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="text-xs text-gray-500">Send warning notification when this time is reached.</p>
            </div>
          </div>
        </div>

        {/* Room Policy */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-500" />
            Room Booking Rules
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Advance Booking Limit (Days)</label>
              <input 
                type="number" 
                min="1"
                max="30"
                value={settings.max_advance_booking_days || 7}
                onChange={(e) => handleChange('max_advance_booking_days', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Max Booking Duration (Hours)</label>
              <input 
                type="number" 
                min="1"
                max="8"
                value={settings.max_booking_duration_hours || 4}
                onChange={(e) => handleChange('max_booking_duration_hours', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={settings.require_staff_approval === 'true' || settings.require_staff_approval === true}
                  onChange={(e) => handleChange('require_staff_approval', e.target.checked ? 'true' : 'false')}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Require Staff Approval</span>
                  <span className="text-xs text-gray-500">All room bookings will be PENDING until approved by staff.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
