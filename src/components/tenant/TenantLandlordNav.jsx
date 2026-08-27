import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { leaseApi } from '../../api/leaseApi';

export default function TenantLandlordNav() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
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
                unitNumber: lease.unitNumber,
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

  return (
    <div className="space-y-1">
      {/* Landlords Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full group flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isOpen
            ? 'bg-[#E6F4EA] dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-2 border-emerald-600 dark:border-emerald-400'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-emerald-500/5 hover:text-slate-800 dark:hover:text-slate-200 border-l-2 border-transparent'
        }`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xl transition-transform duration-200 group-hover:scale-110 ${isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`}>
            <svg className="w-5 h-5 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </span>
          <span className="font-medium">{t('nav.landlords', 'Landlords')}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {landlords.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {landlords.length}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Landlord Rows */}
      {isOpen && (
        <div className="pl-3 pr-1 py-1 space-y-2 transition-all duration-200">
          {loading ? (
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 animate-pulse space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          ) : landlords.length === 0 ? (
            <div className="p-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-center">
              {t('tenant.noLandlordFound', 'No active landlord found')}
            </div>
          ) : (
            landlords.map((landlord, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200/80 dark:border-slate-800/90 shadow-sm space-y-2 hover:border-emerald-500/40 transition-all"
              >
                {/* Landlord Name & Avatar */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase shrink-0">
                    {landlord.name?.charAt(0) || 'L'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate" title={landlord.name}>
                      {landlord.name || t('common.landlord', 'Landlord')}
                    </p>
                    {landlord.property && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate" title={`${landlord.property}${landlord.unitNumber ? ` — Unit ${landlord.unitNumber}` : ''}`}>
                        {landlord.property}{landlord.unitNumber ? ` (${landlord.unitNumber})` : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information rows */}
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  {/* Phone Number */}
                  <div className="flex items-center gap-2 text-xs">
                    <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {landlord.phone ? (
                      <a
                        href={`tel:${landlord.phone}`}
                        className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline truncate"
                        title={landlord.phone}
                      >
                        {landlord.phone}
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">—</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-xs">
                    <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {landlord.email ? (
                      <a
                        href={`mailto:${landlord.email}`}
                        className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline truncate max-w-[150px]"
                        title={landlord.email}
                      >
                        {landlord.email}
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">—</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
