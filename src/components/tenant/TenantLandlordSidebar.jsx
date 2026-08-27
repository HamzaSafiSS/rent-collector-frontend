import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { leaseApi } from '../../api/leaseApi';

export default function TenantLandlordSidebar() {
  const { t } = useTranslation();
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    leaseApi.getMyLeases(0, 50, 'ACTIVE')
      .then((res) => {
        if (ignore) return;
        const leases = res.data?.data?.content || [];
        
        // Extract unique landlords
        const landlordMap = new Map();
        leases.forEach((lease) => {
          if (lease.landlordFullName || lease.landlordPhone || lease.landlordEmail) {
            const key = (lease.landlordEmail || lease.landlordPhone || lease.landlordFullName || '').toLowerCase();
            if (!landlordMap.has(key)) {
              landlordMap.set(key, {
                name: lease.landlordFullName,
                phone: lease.landlordPhone,
                email: lease.landlordEmail,
                property: lease.propertyName,
              });
            }
          }
        });

        setLandlords(Array.from(landlordMap.values()));
      })
      .catch(() => {
        if (!ignore) setLandlords([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="px-3 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 animate-pulse space-y-2.5">
        <div className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-2/3"></div>
      </div>
    );
  }

  if (landlords.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
        </svg>
        <span>{landlords.length > 1 ? t('nav.landlords', 'Landlords') : t('common.landlord', 'Landlord')}</span>
      </div>

      {landlords.map((landlord, idx) => (
        <div
          key={idx}
          className="p-3 rounded-2xl bg-slate-50/90 dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2 transition-all hover:border-emerald-500/30"
        >
          {/* Landlord Name & Avatar */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase shrink-0">
              {landlord.name?.charAt(0) || 'L'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate" title={landlord.name}>
                {landlord.name || t('common.landlord', 'Landlord')}
              </p>
              {landlord.property && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate" title={landlord.property}>
                  {landlord.property}
                </p>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-xs">
            {landlord.phone && (
              <a
                href={`tel:${landlord.phone}`}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                title={landlord.phone}
              >
                <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-mono text-[11px] truncate">{landlord.phone}</span>
              </a>
            )}

            {landlord.email && (
              <a
                href={`mailto:${landlord.email}`}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                title={landlord.email}
              >
                <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate text-[11px]">{landlord.email}</span>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
