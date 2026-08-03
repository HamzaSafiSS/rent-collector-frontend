import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, Badge, Spinner, Alert } from '../../components/common';
import { leaseApi } from '../../api/leaseApi';

export default function MyLeasePage() {
  const { t } = useTranslation();
  const [leases, setLeases]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    leaseApi.getMyLeases(0, 50)          // ← tenant-scoped endpoint
      .then((r) => setLeases(r.data?.data?.content || []))
      .catch((err) => setError(
        err.response?.data?.message || t('leases.failedLoadLeases')
      ))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <>
      <PageHeader title={t('leases.myLeasesTitle')} subtitle={t('leases.myLeasesSubtitle')} />

      {error   && <Alert type="error" message={error} />}
      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

      {!loading && !error && leases.length === 0 && (
        <div className="text-center py-20">
          <p className="text-3xl mb-3">📄</p>
          <p className="text-slate-500">{t('leases.noLeasesFound')}</p>
        </div>
      )}

      <div className="space-y-4">
        {leases.map((lease) => (
          <div key={lease.id} className="bg-[#111827] border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-100 text-lg">{lease.propertyName}</h3>
                <p className="text-slate-500 text-sm mt-0.5">{t('units.unit')}: {lease.unitNumber}</p>
              </div>
              <Badge statusKey={lease.status} label={lease.status ? t(`common.status${lease.status.charAt(0) + lease.status.slice(1).toLowerCase()}`, { defaultValue: lease.status }) : ''} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-1">{t('leases.monthlyRent')}</p>
                <p className="font-semibold">ETB {Number(lease.monthlyRent).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">{t('leases.startDateCol')}</p>
                <p className="font-semibold">{lease.startDate}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">{t('leases.leaseID')}</p>
                <p className="font-semibold">#{lease.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}