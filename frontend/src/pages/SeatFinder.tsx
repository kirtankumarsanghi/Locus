import { useState } from 'react';

const desks = [
  { id: 'A-01', room: 'Room A', status: 'Available' },
  { id: 'A-02', room: 'Room A', status: 'Occupied' },
  { id: 'A-03', room: 'Room A', status: 'Available' },
  { id: 'B-01', room: 'Room B', status: 'Available' },
  { id: 'B-02', room: 'Room B', status: 'Occupied' },
  { id: 'C-01', room: 'Room C', status: 'Available' },
];

export default function SeatFinder() {
  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState('All');

  const filteredDesks = desks.filter((desk) => {
    const matchesSearch = desk.id
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesRoom =
      roomFilter === 'All' || desk.room === roomFilter;

    return matchesSearch && matchesRoom;
  });

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">
          Seat Finder
        </h1>

        <p className="mt-2 text-on-surface-variant">
          Find available desks in the library.
        </p>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <input
            type="text"
            placeholder="Search desk number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-3 w-full"
          />

          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="border rounded-xl px-4 py-3"
          >
            <option>All</option>
            <option>Room A</option>
            <option>Room B</option>
            <option>Room C</option>
          </select>
        </div>

        {/* Desk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {filteredDesks.map((desk) => (
            <div
              key={desk.id}
              className="border rounded-2xl p-5 shadow-sm"
            >
              <h3 className="text-xl font-semibold">
                {desk.id}
              </h3>

              <p className="mt-2 text-gray-500">
                {desk.room}
              </p>

              <span
                className={`inline-block mt-4 px-3 py-1 rounded-full text-sm ${
                  desk.status === 'Available'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {desk.status}
              </span>
            </div>
          ))}
        </div>

        {filteredDesks.length === 0 && (
          <p className="mt-8 text-gray-500">
            No desks found.
          </p>
        )}
      </div>
    </main>
  );
}