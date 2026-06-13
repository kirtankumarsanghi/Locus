import { useNavigate } from 'react-router-dom';

export default function Rooms() {
  const navigate = useNavigate();
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const rooms = [
    { id: 'G1', slots: [false, false, false, 'selected', 'selected', false, false, false, false] },
    { id: 'G2', slots: [false, 'booked', false, false, false, false, false, false, false] },
    { id: 'G3', slots: ['booked', false, 'booked', false, false, false, false, false, false] },
  ];

  return (
    <main className="flex-1 md:ml-64 p-lg md:p-xl max-w-container-max mx-auto mb-20 md:mb-0 overflow-y-auto">
      <div className="mb-lg">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-xs text-primary hover:text-surface-tint transition-colors p-xs hover:bg-surface-container-high rounded-lg mb-md"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-label-bold text-label-bold">Back</span>
        </button>
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Group Study Rooms</h1>
        <p className="text-on-surface-variant">View availability and book collaborative spaces. Rooms G1-G10.</p>
      </div>

      {/* Fair Use Banner */}
      <div className="bg-primary-container text-on-primary-container p-4 rounded-xl mb-lg flex items-start gap-4">
        <span className="material-symbols-outlined text-primary mt-1">policy</span>
        <div>
          <h3 className="font-label-bold text-label-bold mb-1">Fair Use Policy Active</h3>
          <p className="font-body-sm text-body-sm">At least 2 students must be present within 15 minutes of the booking start time to maintain the reservation. Unattended rooms will be automatically released.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-lg">
        {/* Timeline Grid */}
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface">
            <h2 className="font-headline-md text-headline-md text-on-surface">Availability Timeline</h2>
            <div className="flex gap-4 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-surface-container-highest rounded-full"></div> Booked</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-full"></div> Selected</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 border border-outline-variant rounded-full"></div> Available</div>
            </div>
          </div>
          <div className="overflow-x-auto p-4">
            <div className="min-w-[800px]">
              <table className="w-full border-collapse border border-outline-variant rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-on-surface-variant font-label-bold text-label-bold border-r border-outline-variant bg-surface-container-low/50">Room</th>
                    {timeSlots.map(t => (
                      <th key={t} className="px-3 py-2 text-on-surface-variant font-label-bold text-label-bold bg-surface-container-low/50">{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room.id} className="border-t border-outline-variant">
                      <td className="px-4 py-3 font-label-bold text-label-bold text-primary border-r border-outline-variant">{room.id}</td>
                      {room.slots.map((slot, i) => (
                        <td key={i} className="px-1 py-2">
                          <div className={`h-8 rounded cursor-pointer transition-colors ${
                            slot === 'selected' ? 'bg-primary border-2 border-primary' :
                            slot === 'booked' ? 'bg-surface-container-highest' :
                            'border border-outline-variant hover:bg-surface-container-low'
                          }`}></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="w-full lg:w-80 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col gap-md">
          <h2 className="font-headline-md text-headline-md text-on-surface">Book Room G1</h2>
          <div className="flex gap-md text-on-surface-variant font-body-sm text-body-sm">
            <div className="flex items-center gap-xs"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>group</span> Cap: 4-6</div>
            <div className="flex items-center gap-xs"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>tv</span> TV</div>
            <div className="flex items-center gap-xs"><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span> Whiteboard</div>
          </div>

          <div>
            <label className="block font-label-bold text-label-bold text-on-surface-variant mb-1 uppercase">Date</label>
            <input type="date" defaultValue="2023-10-27" className="w-full border border-outline-variant rounded-lg p-3 bg-surface font-body-base text-body-base text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface-variant mb-1 uppercase">Start Time</label>
              <select className="w-full border border-outline-variant rounded-lg p-3 bg-surface font-body-base text-body-base text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option>11:00</option>
                <option>12:00</option>
                <option>13:00</option>
              </select>
            </div>
            <div>
              <label className="block font-label-bold text-label-bold text-on-surface-variant mb-1 uppercase">Duration</label>
              <select className="w-full border border-outline-variant rounded-lg p-3 bg-surface font-body-base text-body-base text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option>2 hours</option>
                <option>1 hour</option>
                <option>3 hours</option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-sm mt-md cursor-pointer">
            <input type="checkbox" className="mt-1 rounded border-outline-variant text-primary focus:ring-primary" />
            <span className="font-body-sm text-body-sm text-on-surface-variant">I agree to the Fair Use policy: At least 2 students will be present.</span>
          </label>

          <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-label-bold text-label-bold hover:opacity-90 transition-opacity shadow-md mt-sm">
            Confirm Booking
          </button>
        </div>
      </div>
    </main>
  );
}
