import { useSocket } from '../context/SocketContext';

export default function ConnectionStatus() {
  const { isConnected } = useSocket();

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border transition-all duration-300 ${
        isConnected
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-amber-50 border-amber-200 text-amber-700'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
        }`}
      ></span>
      <span className="text-xs font-semibold">
        {isConnected ? 'Live' : 'Reconnecting...'}
      </span>
    </div>
  );
}
