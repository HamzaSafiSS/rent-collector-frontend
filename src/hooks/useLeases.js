import { useState, useEffect, useCallback } from 'react';
import { leaseApi } from '../api/leaseApi';

export function useLeases(page = 0, size = 20, status = null) {
  const [leases, setLeases]           = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const fetchLeases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await leaseApi.listLeases(page, size, status);
      const data = res.data?.data;
      setLeases(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leases.');
    } finally {
      setLoading(false);
    }
  }, [page, size, status]);

  useEffect(() => {
    fetchLeases();
  }, [fetchLeases]);

  return { leases, totalElements, loading, error, refetch: fetchLeases };
}