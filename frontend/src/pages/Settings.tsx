import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 md:ml-64 relative overflow-auto">
      <div className="p-lg space-y-lg max-w-4xl">
        <div className="flex items-center gap-md mb-md">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-xs text-primary hover:text-surface-tint transition-colors p-xs hover:bg-surface-container-high rounded-lg"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-label-bold text-label-bold">Back</span>
          </button>
        </div>
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface font-bold">Settings</h1>
          <p className="font-body-base text-body-base text-on-surface-variant mt-sm">Configure your library's desk management system</p>
        </div>

        {/* General Settings */}
        <div className="bg-surface-container rounded-xl p-lg border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">General Settings</h2>
          <div className="space-y-md">
            <div>
              <label className="font-label-bold text-label-bold text-on-surface block mb-xs">Library Name</label>
              <input 
                type="text" 
                defaultValue="Main Library" 
                className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-base text-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-label-bold text-label-bold text-on-surface block mb-xs">Location</label>
              <input 
                type="text" 
                defaultValue="Main Campus" 
                className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-base text-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-label-bold text-label-bold text-on-surface block mb-xs">Total Desks</label>
              <input 
                type="number" 
                defaultValue="120" 
                className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-base text-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Enforcement Rules */}
        <div className="bg-surface-container rounded-xl p-lg border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Enforcement Rules</h2>
          <div className="space-y-md">
            <div>
              <label className="font-label-bold text-label-bold text-on-surface block mb-xs">Away Timeout (minutes)</label>
              <input 
                type="number" 
                defaultValue="30" 
                className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-base text-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Mark desk as abandoned after this many minutes</p>
            </div>

            <div>
              <label className="font-label-bold text-label-bold text-on-surface block mb-xs">Auto-Release Timeout (minutes)</label>
              <input 
                type="number" 
                defaultValue="60" 
                className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-base text-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Automatically release desk after this timeout</p>
            </div>

            <div className="flex items-center gap-sm">
              <input 
                type="checkbox" 
                id="notifications" 
                defaultChecked 
                className="w-5 h-5 text-primary bg-surface border-outline-variant rounded focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="notifications" className="font-body-base text-body-base text-on-surface">Send notifications to staff when desks are flagged</label>
            </div>

            <div className="flex items-center gap-sm">
              <input 
                type="checkbox" 
                id="autorelease" 
                defaultChecked 
                className="w-5 h-5 text-primary bg-surface border-outline-variant rounded focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="autorelease" className="font-body-base text-body-base text-on-surface">Enable automatic desk release</label>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-surface-container rounded-xl p-lg border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Operating Hours</h2>
          <div className="space-y-md">
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="font-label-bold text-label-bold text-on-surface block mb-xs">Opening Time</label>
                <input 
                  type="time" 
                  defaultValue="07:00" 
                  className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-base text-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="font-label-bold text-label-bold text-on-surface block mb-xs">Closing Time</label>
                <input 
                  type="time" 
                  defaultValue="23:00" 
                  className="w-full px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-base text-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Settings */}
        <div className="bg-surface-container rounded-xl p-lg border border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">QR Code Settings</h2>
          <div className="space-y-md">
            <div className="flex items-center gap-sm">
              <input 
                type="checkbox" 
                id="qrRequired" 
                defaultChecked 
                className="w-5 h-5 text-primary bg-surface border-outline-variant rounded focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="qrRequired" className="font-body-base text-body-base text-on-surface">Require QR code scan for check-in</label>
            </div>

            <div className="flex items-center gap-sm">
              <input 
                type="checkbox" 
                id="qrCheckout" 
                className="w-5 h-5 text-primary bg-surface border-outline-variant rounded focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="qrCheckout" className="font-body-base text-body-base text-on-surface">Require QR code scan for check-out</label>
            </div>

            <button className="inline-flex items-center justify-center px-lg py-sm bg-surface border border-outline-variant text-primary font-label-bold text-label-bold rounded-lg hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined mr-xs">qr_code</span>
              Generate QR Codes
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-sm">
          <button className="inline-flex items-center justify-center px-xl py-md bg-surface border border-outline-variant text-on-surface font-label-bold text-label-bold rounded-lg hover:bg-surface-container-high transition-colors">
            Cancel
          </button>
          <button className="inline-flex items-center justify-center px-xl py-md bg-primary text-on-primary font-label-bold text-label-bold rounded-lg hover:bg-surface-tint transition-colors shadow-md">
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}
