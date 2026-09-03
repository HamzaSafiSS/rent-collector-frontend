import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, Badge, Spinner, Alert } from '../../components/common';
import { leaseApi } from '../../api/leaseApi';
import { paymentApi } from '../../api/paymentApi';
import { getLeasePaymentStatus } from '../../utils/leasePaymentStatus';
import useCalendarDate from '../../hooks/useCalendarDate';
import DocumentViewer from '../../components/lease/DocumentViewer';

export default function MyLeasePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatDate } = useCalendarDate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || '';
  const autoOpenParam = searchParams.get('autoOpen') === 'true';

  const [leases, setLeases]             = useState([]);
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [openedLeaseId, setOpenedLeaseId] = useState(null);

  // Keep statusFilter in sync with URL search params
  useEffect(() => {
    const urlStatus = searchParams.get('status') || '';
    setStatusFilter(urlStatus);
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');

    if (statusFilter === 'UNPAID' || statusFilter === 'DUE_SOON') {
      Promise.all([
        leaseApi.getMyLeases(0, 100, 'ACTIVE'),
        paymentApi.getMyPayments({ page: 0, size: 500 }),
      ])
        .then(([leaseRes, payRes]) => {
          if (ignore) return;
          const activeLeases = leaseRes.data?.data?.content || [];
          const payments = payRes.data?.data?.content || [];

          const filtered = activeLeases.filter((lease) => {
            const statusInfo = getLeasePaymentStatus(lease, payments);
            if (statusFilter === 'UNPAID') return statusInfo.isUnpaid;
            if (statusFilter === 'DUE_SOON') return statusInfo.isDueSoon;
            return true;
          });

          setLeases(filtered);
        })
        .catch((err) => {
          if (!ignore) setError(err.response?.data?.message || t('leases.failedLoadLeases'));
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    } else {
      leaseApi.getMyLeases(0, 50, statusFilter || null)
        .then((r) => {
          if (!ignore) {
            const list = r.data?.data?.content || [];
            setLeases(list);

            if (autoOpenParam && list.length > 0) {
              const pendingOrFirst = list.find((l) => l.status === 'PENDING' && l.agreementDocumentUrl) ||
                                     list.find((l) => l.agreementDocumentUrl);
              if (pendingOrFirst) {
                setOpenedLeaseId(pendingOrFirst.id);
              }
            }
          }
        })
        .catch((err) => {
          if (!ignore) setError(err.response?.data?.message || t('leases.failedLoadLeases'));
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }

    return () => {
      ignore = true;
    };
  }, [statusFilter, autoOpenParam, t]);

  const handleFilterChange = (key) => {
    if (statusFilter !== key) {
      setLoading(true);
      setStatusFilter(key);
      if (key) {
        setSearchParams({ status: key });
      } else {
        setSearchParams({});
      }
    }
  };

  const handleLeaseStatusChange = (leaseId, newStatus) => {
    setLeases((prev) =>
      prev.map((l) => (l.id === leaseId ? { ...l, status: newStatus } : l))
    );
  };

  return (
    <>
      <PageHeader title={t('leases.myLeasesTitle')} subtitle={t('leases.myLeasesSubtitle')} />

      {/* Status filter */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('common.filters')}</div>
        <select 
          value={statusFilter} 
          onChange={e => handleFilterChange(e.target.value)}
          className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50"
        >
          <option value="">{t('common.allStatuses')}</option>
          <option value="PENDING">{t('leases.pending') || t('common.statusPending')}</option>
          <option value="ACTIVE">{t('leases.active') || t('common.statusActive')}</option>
          <option value="UNPAID">{t('common.statusUnpaid')}</option>
          <option value="REJECTED">{t('leases.rejected') || t('common.statusRejected')}</option>
          <option value="TERMINATED">{t('leases.terminated') || t('common.statusTerminated')}</option>
        </select>
        {statusFilter && (
          <button 
            onClick={() => handleFilterChange('')}
            className="text-sm text-emerald-400 hover:underline"
          >
            {t('common.clear')}
          </button>
        )}
      </div>

      {error   && <Alert type="error" message={error} className="mb-4" />}
      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

      {!loading && !error && leases.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl">
          <p className="text-3xl mb-3">📄</p>
          <p className="text-slate-500">
            {statusFilter ? t('common.noResultsFilter') : t('leases.noLeasesFound')}
          </p>
        </div>
      )}

      {!loading && !error && leases.length > 0 && (
        <div className="space-y-4">
          {leases.map((lease) => (
            <div key={lease.id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{lease.propertyName}</h3>
                  <p className="text-slate-500 text-sm mt-0.5">{t('units.unit')}: {lease.unitNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusFilter === 'UNPAID' && (
                    <Badge statusKey="UNPAID" label={t('common.statusUnpaid')} />
                  )}
                  <Badge statusKey={lease.status} label={lease.status ? t(`common.status${lease.status.charAt(0) + lease.status.slice(1).toLowerCase()}`, { defaultValue: lease.status }) : ''} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">{t('leases.monthlyRent')}</p>
                  <p className="font-semibold">ETB {Number(lease.monthlyRent).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">{t('leases.startDateCol')}</p>
                  <p className="font-semibold">{lease.startDate ? formatDate(lease.startDate) : '—'}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">{t('leases.agreementDocument')}</p>
                  {lease.agreementDocumentUrl ? (
                    <DocumentViewer
                      leaseId={lease.id}
                      documentUrl={lease.agreementDocumentUrl}
                      status={lease.status}
                      isTenant={true}
                      onStatusChange={(newStatus) => handleLeaseStatusChange(lease.id, newStatus)}
                      isOpen={openedLeaseId === lease.id}
                      onClose={() => setOpenedLeaseId(null)}
                    />
                  ) : (
                    <p className="font-semibold text-slate-500">—</p>
                  )}
                </div>
              </div>
              {statusFilter === 'UNPAID' && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/tenant/upload-payment?leaseId=${lease.id}`)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                  >
                    {t('nav.uploadPayment')} →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}