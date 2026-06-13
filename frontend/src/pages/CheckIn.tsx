import { useState } from 'react';

export default function CheckIn() {
  const [deskNumber, setDeskNumber] = useState('');

  const handleCheckIn = () => {
    if (!deskNumber.trim()) {
      alert('Please enter a desk number');
      return;
    }

    alert(`Successfully checked into Desk ${deskNumber}`);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">
          QR Check-In
        </h1>

        <p className="mt-2 text-on-surface-variant">
          Scan a QR code or enter a desk number manually.
        </p>

        {/* QR Scanner Placeholder */}
        <div className="mt-8 bg-surface rounded-2xl border border-outline-variant p-8 shadow-sm text-center">
          <span className="material-symbols-outlined text-6xl text-primary">
            qr_code_scanner
          </span>

          <h2 className="text-xl font-semibold mt-4">
            QR Scanner
          </h2>

          <p className="mt-2 text-on-surface-variant">
            Camera integration can be added later.
          </p>

          <div className="mt-6 w-56 h-56 mx-auto border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center">
            <span className="text-on-surface-variant">
              Scanner Preview
            </span>
          </div>
        </div>

        {/* Manual Entry */}
        <div className="mt-8 bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Manual Desk Entry
          </h2>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter desk number (e.g. A-12)"
              value={deskNumber}
              onChange={(e) => setDeskNumber(e.target.value)}
              className="w-full px-4 py-3 border border-outline-variant rounded-xl bg-transparent"
            />
          </div>

          <button
            onClick={handleCheckIn}
            className="mt-6 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition"
          >
            Start Session
          </button>
        </div>
      </div>
    </main>
  );
}