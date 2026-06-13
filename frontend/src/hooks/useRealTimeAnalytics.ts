import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { API_BASE_URL } from '../config';

interface Analytics {
  desks: {
    total: number;
    free: number;
    occupied: number;
    away: number;
    abandoned: number;
    occupancyRate: number;
  };
  sessions: {
    total: number;
    active: number;
  };
}

export const useRealTimeAnalytics = () => {
  const { socket, isConnected } = useSocket();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
        setError(null);
      } else {
        setError('Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleAnalyticsUpdate = (updatedAnalytics: Analytics) => {
      setAnalytics(updatedAnalytics);
    };

    socket.on('analytics:updated', handleAnalyticsUpdate);

    return () => {
      socket.off('analytics:updated', handleAnalyticsUpdate);
    };
  }, [socket]);

  return { analytics, loading, error, isConnected, refetch: fetchAnalytics };
};
