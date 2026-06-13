import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { API_BASE_URL } from '../config';

interface Desk {
  id: number;
  number: number;
  label: string;
  zone: string;
  floor: number;
  status: 'FREE' | 'OCCUPIED' | 'AWAY' | 'ABANDONED';
  current_session_id: number | null;
  updated_at: string;
}

export const useRealTimeDesks = () => {
  const { socket, isConnected } = useSocket();
  const [desks, setDesks] = useState<Desk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch
  const fetchDesks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/desks`);
      if (res.ok) {
        const data = await res.json();
        setDesks(data);
        setError(null);
      } else {
        setError('Failed to fetch desks');
      }
    } catch (err) {
      console.error('Failed to fetch desks', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesks();
  }, [fetchDesks]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for complete desk list updates
    const handleAllDesks = (updatedDesks: Desk[]) => {
      setDesks(updatedDesks);
    };

    // Listen for individual desk updates
    const handleDeskUpdate = (data: { desk: Desk }) => {
      setDesks((prev) =>
        prev.map((desk) => (desk.id === data.desk.id ? data.desk : desk))
      );
    };

    socket.on('desks:all', handleAllDesks);
    socket.on('desk:updated', handleDeskUpdate);

    return () => {
      socket.off('desks:all', handleAllDesks);
      socket.off('desk:updated', handleDeskUpdate);
    };
  }, [socket]);

  return { desks, loading, error, isConnected, refetch: fetchDesks };
};
