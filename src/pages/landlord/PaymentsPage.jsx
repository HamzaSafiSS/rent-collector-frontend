import { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  PageHeader, Table, Badge, Button, Alert, Pagination,
} from '../../components/common';
import ReviewModal from '../../components/payment/ReviewModal';
import { paymentApi } from '../../api/paymentApi';
import { reportApi } from '../../api/reportApi';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/common';
import PropertySelector from '../../components/property/PropertySelector';
import useCalendarDate from '../../hooks/useCalendarDate';

const PAGE_SIZE = 10;

export default function PaymentsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const detailsRef = useRef(null);
  const { formatDate, formatMonth } = useCalendarDate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const restoredPropertyId = searchParams.get('propertyId');
  const page = Number(searchParams.get('page')) || 0;
  const setPage = (pg) => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('page', String(pg)); return p; }, { replace: true });
  const statusFilter = searchParams.get('status') || '';
  const monthFilter = searchParams.get('month') || '';
  const yearFilter = searchParams.get('year') || '';

  const setStatusFilter = (s) => setSearchParams(prev => { const p = new URLSearchParams(prev); if (s && s !== 'ALL') p.set('status', s); else p.delete('status'); p.delete('page'); return p; }, { replace: true });
  const setMonthFilter = (m) => setSearchParams(prev => { const p = new URLSearchParams(prev); if (m) p.set('month', m); else p.delete('month'); p.delete('page'); return p; }, { replace: true });
  const setYearFilter = (y) => setSearchParams(prev => { const p = new URLSearchParams(prev); if (y) p.set('year', y); else p.delete('year'); p.delete('page'); return p; }, { replace: true });

  const handleSelectProperty = (p) => {
    setSelectedProperty(p);
    setSearchParams({ propertyId: String(p.id) }, { replace: true });
  };

  const handleBack = () => {
    setSelectedProperty(null);
    setSearchParams({}, { replace: true });
  };

  const [payments, setPayments]       = useState([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

  const [reportData, setReportData]   = useState(null);

  const [reviewPayment, setReviewPayment] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError]     = useState('');

  const loadPayments = useCallback(async () => {
    if (!selectedProperty) return;
    try {
      setLoading(true);
      setFetchError('');

      let fullMonthParam = '';
      if (monthFilter && yearFilter) {
        fullMonthParam = `${yearFilter}-${monthFilter}`;
      } else if (monthFilter) {
        const currentYear = new Date().getFullYear();
        fullMonthParam = `${currentYear}-${monthFilter}`;
      } else if (yearFilter) {
        fullMonthParam = `${yearFilter}`;
      }

      const params = { page, size: PAGE_SIZE, propertyId: selectedProperty.id };
      if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;
      if (fullMonthParam) params.month = fullMonthParam;

      let res;
      if (statusFilter === 'PENDING' && !fullMonthParam) {
          res = await paymentApi.getPendingPayments(page, PAGE_SIZE, selectedProperty.id);
      } else {
          res = await paymentApi.getLandlordPayments(params);
      }

      const data = res.data?.data;
      setPayments(data?.content          || []);
      setTotalPages(data?.totalPages     || 0);
      setTotalElements(data?.totalElements || 0);

      const reportParams = { propertyId: selectedProperty.id };
      if (fullMonthParam) {
          reportParams.from = fullMonthParam;
          reportParams.to = fullMonthParam;
      }
      const reportRes = await reportApi.getPaymentReport(reportParams);
      setReportData(reportRes.data?.data);
    } catch {
      setFetchError(t('payments.failedLoadPayments'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, monthFilter, yearFilter, selectedProperty]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  async function handleApprove(paymentId) {
    try {
      setReviewLoading(true);
      setReviewError('');
      await paymentApi.approvePayment(paymentId);
      toast.success(t('payments.paymentApproved'));
      setReviewPayment(null);
      loadPayments();
    } catch (err) {
      setReviewError(err.response?.data?.message || t('payments.failedApprovePayment'));
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleReject(paymentId, comment) {
    try {
      setReviewLoading(true);
      setReviewError('');
      await paymentApi.rejectPayment(paymentId, comment);
      toast.success(t('payments.paymentRejected'));
      setReviewPayment(null);
      loadPayments();
    } catch (err) {
      setReviewError(err.response?.data?.message || t('payments.failedRejectPayment'));
    } finally {
      setReviewLoading(false);
    }
  }

  const columns = [
    { key: 'id',            header: t('payments.id') },
    { key: 'tenantFullName',header: t('leases.tenant'),     render: (r) => r.tenantFullName || '—' },
    { key: 'unitNumber',    header: t('units.unit') },
    { key: 'propertyName',  header: t('leases.property') },
    { key: 'paymentMonth',  header: t('payments.month'), render: (r) => r.paymentMonth ? formatMonth(r.paymentMonth) : '—' },
    { key: 'amount',        header: t('payments.amountETB'), render: (r) => Number(r.amount).toLocaleString() },
    { key: 'status',        header: t('leases.status'),      render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
    { key: 'uploadedAt',    header: t('payments.uploaded'),    render: (r) => r.uploadedAt ? formatDate(r.uploadedAt) : '—' },
    {
      key: 'actions', header: t('common.actions'),
      render: (row) => (
        <Button size="sm" variant="ghost" onClick={() => { setReviewPayment(row); setReviewError(''); }}>
          {row.status === 'PENDING' ? t('payments.review') : t('common.view')}
        </Button>
      ),
    },
  ];

  return (
    <>

      {!selectedProperty ? (
        <>
          <div className="mb-4">
            <PageHeader
              title={t('common.selectProperty')}
              subtitle={t('payments.selectPropertyPayments')}
            />
          </div>
          <PropertySelector
            onSelect={handleSelectProperty}
            restoredPropertyId={restoredPropertyId}
          />
        </>
      ) : (
        <>
          <button
            onClick={handleBack}
            className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
          >
            {t('common.backToProperties')}
          </button>
          <div className="mb-4">
            <PageHeader
              title={t('payments.paymentsTitle', { name: selectedProperty.name })}
              subtitle={totalElements !== 1 ? t('payments.paymentCount', { count: totalElements }) : t('payments.paymentCountSingular', { count: totalElements })}
            />
          </div>

          <div className="mb-4 flex flex-wrap gap-4 items-center bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('common.filters')}</div>
            <select 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); }}
              className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50"
            >
              <option value="">{t('common.allStatuses')}</option>
              <option value="PENDING">{t('common.statusPending')}</option>
              <option value="APPROVED">{t('common.statusApproved')}</option>
              <option value="REJECTED">{t('common.statusRejected')}</option>
              <option value="UNPAID">{t('payments.unpaidTenants', 'Unpaid Tenants')}</option>
            </select>
            <select
              value={monthFilter}
              onChange={e => { setMonthFilter(e.target.value); }}
              className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50"
            >
              <option value="">{t('common.allMonths')}</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
                const val = String(m).padStart(2, '0');
                return <option key={val} value={val}>{t(`common.month${val}`)}</option>;
              })}
            </select>
            <input
              type="number"
              placeholder={t('common.yearPlaceholder')}
              value={yearFilter}
              onChange={e => { setYearFilter(e.target.value); }}
              className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50 w-24"
            />
            {(statusFilter || monthFilter || yearFilter) && (
              <button 
                onClick={() => {
                  setSearchParams(prev => {
                    const p = new URLSearchParams(prev);
                    p.delete('status');
                    p.delete('month');
                    p.delete('year');
                    p.delete('page');
                    return p;
                  }, { replace: true });
                }}
                className="text-sm text-emerald-400 hover:underline"
              >
                {t('common.clear')}
              </button>
            )}
          </div>

          <div ref={detailsRef} className="mb-6 scroll-mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {t('payments.paymentDetails')}
                {statusFilter && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {t(`common.status${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}`, { defaultValue: statusFilter })}
                  </span>
                )}
              </h2>
            </div>
            {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

            {loading ? (
                <TableSkeleton rows={8} cols={columns.length} />
              ) : (
                <Table columns={columns} data={payments} emptyMessage={statusFilter ? t('payments.noPaymentsFound', { status: statusFilter }) : t('empty.searchTitle', 'No records found')} />
              )}
          </div>
      {payments.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Pagination
            page={page} totalPages={totalPages}
            totalElements={totalElements} size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      <ReviewModal
        payment={reviewPayment}
        isOpen={!!reviewPayment}
        onClose={() => setReviewPayment(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={reviewLoading}
        error={reviewError}
      />
        </>
      )}

    </>
  );
}