import { useCallback, useEffect, useState } from 'react';
import { CardGridSkeleton } from '../common';
import { propertyApi } from '../../api/propertyApi';

export default function PropertySelector({ onSelect }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch a large page so we get all properties for the selector
      const res = await propertyApi.listMyProperties(0, 500);
      setProperties(res.data?.data?.content || []);
    } catch {
      setError('Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  if (loading) {
    return <CardGridSkeleton count={3} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
        {error}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
          <p className="text-4xl">🏗️</p>
        </div>
        <p className="text-xl text-slate-800 font-bold">No properties available</p>
        <p className="text-slate-500 text-sm mt-2 mb-6 max-w-sm mx-auto">
          You need to add a property before you can view these details.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          onClick={() => onSelect(p)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-start justify-between mb-4 z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-md text-white">
              🏗️
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 truncate z-10">{p.name}</h3>
          <p className="text-sm text-slate-500 mt-1 truncate z-10">{p.address}</p>
          {p.description && (
            <p className="text-sm text-slate-400 mt-3 line-clamp-2 z-10">{p.description}</p>
          )}
          <div className="mt-5 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors z-10">
            Select Property <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      ))}
    </div>
  );
}
