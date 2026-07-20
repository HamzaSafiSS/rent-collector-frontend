import { useState, useEffect, useCallback } from 'react';
import { propertyApi } from '../api/propertyApi';

export function useProperties(page = 0, size = 20) {
  const [properties, setProperties] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await propertyApi.listMyProperties(page, size);
      const data = res.data?.data;
      setProperties(data?.content || []);
      setTotalElements(data?.totalElements || 0);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, totalElements, totalPages, loading, error, refetch: fetchProperties };
}    