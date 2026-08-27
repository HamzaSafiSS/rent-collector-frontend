import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, Alert } from '../../components/common';
import { leaseApi } from '../../api/leaseApi';

export default function TenantLandlordsPage() {
  const { t } = useTranslation();
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');

    leaseApi.getMyLeases(0, 50, 'ACTIVE')
      .then((res) => {
        if (ignore) return;
        const leases = res.data?.data?.content || [];
        const landlordMap = new Map();

        leases.forEach((lease) => {
          if (lease.landlordFullName || lease.landlordPhone || lease.landlordEmail) {
            const key = (lease.landlordEmail || lease.landlordPhone || lease.landlordFullName || '').toLowerCase();
            if (!landlordMap.has(key)) {
              landlordMap.set(key, {
                name: lease.landlordFullName,
                phone: lease.landlordPhone,
                email: lease.landlordEmail,
                properties: [{ propertyName: lease.propertyName, unitNumber: lease.unitNumber, rent: lease.monthlyRent }],
              });
            } else {
              landlordMap.get(key).properties.push({
                propertyName: lease.propertyName,
                unitNumber: lease.unitNumber,
                rent: lease.monthlyRent,
              });
            }
          }
        });

        setLandlords(Array.from(landlordMap.values()));
      })
      .catch((err) => {
        if (!ignore) setError(err.response?.data?.message || t('common.failedToLoadData', 'Failed to load data.'));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [t]);

  return (
    <>
      <PageHeader
        title={t('nav.landlords', 'Landlords')}
        subtitle={t('tenant.landlordsSubtitle', 'Contact and property details for your landlords')}
      />

      <div className="max-w-3xl space-y-4">
        {error && <Alert type="error" message={error} className="mb-4" />}

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse space-y-4">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : landlords.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 text-2xl">
              🏢
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{t('tenant.noLandlordFound', 'No active landlord found')}</h3>
            <p className="text-sm text-slate-500 mt-1">{t('tenant.noActiveLeaseMsg', 'Landlord contact info will appear here once you have an active lease.')}</p>
          </div>
        ) : (
          landlords.map((landlord, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-5"
            >
              {/* Header: Name + Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg uppercase shrink-0">
                  {landlord.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {landlord.name || t('common.landlord', 'Landlord')}
                  </h2>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {t('common.landlord', 'Landlord')}
                  </p>
                </div>
              </div>

              {/* Contact Grid: Phone and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Phone */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{t('payments.phone', 'Phone Number')}</p>
                    {landlord.phone ? (
                      <a href={`tel:${landlord.phone}`} className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline truncate block">
                        {landlord.phone}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-400 italic">—</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{t('auth.emailLabel', 'Email')}</p>
                    {landlord.email ? (
                      <a href={`mailto:${landlord.email}`} className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline truncate block" title={landlord.email}>
                        {landlord.email}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-400 italic">—</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Leased Properties under this landlord */}
              {landlord.properties && landlord.properties.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t('nav.properties', 'Properties')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {landlord.properties.map((p, pIdx) => (
                      <span key={pIdx} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        <span>🏢 {p.propertyName || t('properties.unnamedProperty')}</span>
                        {p.unitNumber && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• {t('units.unit')} {p.unitNumber}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
