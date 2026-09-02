import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardGridSkeleton } from '../common';
import { propertyApi } from '../../api/propertyApi';
import PropertyImage from './PropertyImage';

export default function PropertySelector({ onSelect, restoredPropertyId }) {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch a large page so we get all properties for the selector
      const res = await propertyApi.listMyProperties(0, 500);
      const fetchedProperties = res.data?.data?.content || [];
      setProperties(fetchedProperties);

      // Auto-select: restore from URL param or auto-select if only 1 property
      if (restoredPropertyId) {
        const match = fetchedProperties.find(p => String(p.id) === String(restoredPropertyId));
        if (match) { onSelect(match); return; }
      }
      if (fetchedProperties.length === 1) {
        onSelect(fetchedProperties[0]);
      }
    } catch {
      setError(t('properties.failedLoadProperties'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoredPropertyId]);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  if (loading) {
    return <CardGridSkeleton count={3} />;
  }

  if (properties.length === 1) {
    return null;
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/25">
        {error}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-24 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" /></svg>
        </div>
        <p className="text-xl text-slate-800 dark:text-slate-200 font-bold">{t('properties.noPropertiesYet')}</p>
        <p className="text-slate-500 text-sm mt-2 mb-6 max-w-sm mx-auto">
          {t('properties.noPropertiesDescription')}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('common.selectProperty')}:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((p) => {
          return (
            <div
              key={p.id}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              onClick={() => onSelect(p)}
            >
              {/* Image Hero */}
              <div className="relative h-44 overflow-hidden">
                {p.imageUrl ? (
                  <PropertyImage
                    propertyId={p.id}
                    hasImage={!!p.imageUrl}
                    imageUrl={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : null}
                {/* Fallback placeholder */}
                {!p.imageUrl && (
                  <div className="flex w-full h-full bg-gradient-to-br from-slate-100 dark:from-slate-800 to-slate-200 dark:to-slate-900 items-center justify-center">
                    <svg className="w-14 h-14 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
                    </svg>
                  </div>
                )}
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                {/* Property name & address */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold text-white truncate">{p.name}</h3>
                  <p className="text-sm text-slate-300 flex items-center gap-1 truncate mt-0.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {p.address}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700/50">
                <span className="text-xs text-slate-500">{p.unitsCount || 0} {t('units.allUnits').toLowerCase()}</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-0.5">
                  {t('common.view')} <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
