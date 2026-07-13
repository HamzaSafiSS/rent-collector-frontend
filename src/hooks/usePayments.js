import { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '../api/paymentApi';

export function usePendingPayments(page = 0, size = 20) {
  const [payments, setPayments]           = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await paymentApi.getPendingPayments(page, size);
      const data = res.data?.data;
      setPayments(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, totalElements, loading, error, refetch: fetchPayments };
}