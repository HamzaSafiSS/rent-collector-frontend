import { useCallback, useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageHeader, Table, Badge, Button, Alert, Pagination,
} from '../../components/common';
import ReviewModal from '../../components/payment/ReviewModal';
import { paymentApi } from '../../api/paymentApi';
import { reportApi } from '../../api/reportApi';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/common';
import PropertySelector from '../../components/property/PropertySelector';
import StatCard from '../../components/common/StatCard';
import Input from '../../components/common/Input';
import PaymentInfoModal from '../../components/payment/PaymentInfoModal';
import EthiopianMonthPicker from '../../components/common/EthiopianMonthPicker';
import useCalendarDate from '../../hooks/useCalendarDate';

const PAGE_SIZE = 10;

export default function PaymentsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const detailsRef = useRef(null);
  const { formatDate, formatMonth } = useCalendarDate();

  const [selectedProperty, setSelectedProperty] = useState(null);

  const [payments, setPayments]       = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [monthFilter, setMonthFilter]   = useState('');

  const [reportData, setReportData]   = useState(null);

  const [reviewPayment, setReviewPayment] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError]     = useState('');

  const [isPaymentInfoModalOpen, setIsPaymentInfoModalOpen] = useState(false);
  const [paymentInfoData, setPaymentInfoData] = useState(null);
  const [paymentInfoLoading, setPaymentInfoLoading] = useState(false);
  const [editingPaymentInfo, setEditingPaymentInfo] = useState(null);

  const fetchPaymentInfo = async () => {
    try {
      const res = await paymentApi.getPaymentInfo();
      setPaymentInfoData(res.data?.data);
    } catch (err) {
      console.error('Failed to fetch payment info:', err);
    }
  };

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  const handleSavePaymentInfo = async (data) => {
    try {
      setPaymentInfoLoading(true);
      if (data.id) {
        await paymentApi.updatePaymentInfo(data.id, data);
        toast.success(t('payments.paymentInfoUpdated'));
      } else {
        await paymentApi.savePaymentInfo(data);
        toast.success(t('payments.paymentInfoSaved'));
      }
      setIsPaymentInfoModalOpen(false);
      setEditingPaymentInfo(null);
      fetchPaymentInfo();
    } catch (err) {
      toast.error(err.response?.data?.message || t('payments.failedSavePaymentInfo'));
    } finally {
      setPaymentInfoLoading(false);
    }
  };

  const handleDeletePaymentInfo = async (id) => {
    if (!window.confirm(t('payments.confirmDeletePaymentInfo'))) return;
    try {
      await paymentApi.deletePaymentInfo(id);
      toast.success(t('payments.paymentInfoDeleted'));
      fetchPaymentInfo();
    } catch (err) {
      toast.error(err.response?.data?.message || t('payments.failedDeletePaymentInfo'));
    }
  };

  const handleCardClick = (status) => {
    setStatusFilter(status);
    setPage(0);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const loadPayments = useCallback(async () => {
    if (!selectedProperty) return;
    try {
      setLoading(true);
      setFetchError('');

      const params = { page, size: PAGE_SIZE, propertyId: selectedProperty.id };
      if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;
      if (monthFilter) params.month = monthFilter;

      let res;
      if (statusFilter === 'PENDING' && !monthFilter) {
          res = await paymentApi.getPendingPayments(page, PAGE_SIZE, selectedProperty.id);
      } else {
          res = await paymentApi.getLandlordPayments(params);
      }

      const data = res.data?.data;
      setPayments(data?.content          || []);
      setTotalPages(data?.totalPages     || 0);
      setTotalElements(data?.totalElements || 0);

      const reportParams = { propertyId: selectedProperty.id };
      if (monthFilter) {
          reportParams.from = monthFilter;
          reportParams.to = monthFilter;
      }
      const reportRes = await reportApi.getPaymentReport(reportParams);
      setReportData(reportRes.data?.data);
    } catch {
      setFetchError(t('payments.failedLoadPayments'));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, monthFilter, selectedProperty, t]);

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
          <div className="flex items-center justify-between">
            <PageHeader
              title={t('common.selectProperty')}
              subtitle={t('payments.selectPropertyPayments')}
            />
            <Button onClick={() => { setEditingPaymentInfo(null); setIsPaymentInfoModalOpen(true); }}>
              {t('payments.addPaymentMethod')}
            </Button>
          </div>
          {paymentInfoData && paymentInfoData.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-4">
              {paymentInfoData.map((info) => (
                <div key={info.id} className="group relative text-sm px-4 py-3 pr-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-300 shadow-sm flex flex-col gap-1">
                  <div><span className="font-semibold text-emerald-500">{info.paymentType === 'BANK' ? t('payments.bank') : t('payments.wallet')}</span>: {info.institutionName}</div>
                  <div className="text-slate-500 text-xs">{info.accountHolderName} • {info.accountNumber || info.phoneNumber}</div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingPaymentInfo(info); setIsPaymentInfoModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title={t('common.edit')}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDeletePaymentInfo(info.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title={t('common.delete')}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <PropertySelector
            onSelect={(p) => {
              setSelectedProperty(p);
              setPage(0);
              setStatusFilter('PENDING');
              setMonthFilter('');
            }}
          />
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedProperty(null)}
            className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
          >
            {t('common.backToProperties')}
          </button>
          <div className="flex items-center justify-between">
            <PageHeader
              title={t('payments.paymentsTitle', { name: selectedProperty.name })}
              subtitle={totalElements !== 1 ? t('payments.paymentCount', { count: totalElements }) : t('payments.paymentCountSingular', { count: totalElements })}
            />
            <Button onClick={() => { setEditingPaymentInfo(null); setIsPaymentInfoModalOpen(true); }}>
              {t('payments.addPaymentMethod')}
            </Button>
          </div>
          {paymentInfoData && paymentInfoData.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-4">
              {paymentInfoData.map((info) => (
                <div key={info.id} className="group relative text-sm px-4 py-3 pr-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-300 shadow-sm flex flex-col gap-1">
                  <div><span className="font-semibold text-emerald-500">{info.paymentType === 'BANK' ? t('payments.bank') : t('payments.wallet')}</span>: {info.institutionName}</div>
                  <div className="text-slate-500 text-xs">{info.accountHolderName} • {info.accountNumber || info.phoneNumber}</div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingPaymentInfo(info); setIsPaymentInfoModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title={t('common.edit')}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDeletePaymentInfo(info.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title={t('common.delete')}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('payments.summary')}</h2>
        <div className="w-48">
          <EthiopianMonthPicker
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(0); }}
            placeholder={t('payments.filterByMonth')}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
            label={t('payments.pendingPayments')}
            value={reportData?.pendingCount || 0}
            icon={<svg className="w-5 h-5 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="blue"
            isSelected={statusFilter === 'PENDING'}
            onClick={() => handleCardClick('PENDING')}
        />
        <StatCard 
            label={t('payments.approvedPayments')}
            value={reportData?.approvedCount || 0}
            icon={<svg className="w-5 h-5 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
            color="green"
            isSelected={statusFilter === 'APPROVED'}
            onClick={() => handleCardClick('APPROVED')}
        />
        <StatCard 
            label={t('payments.rejectedPayments')}
            value={reportData?.rejectedCount || 0}
            icon={<svg className="w-5 h-5 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
            color="red"
            isSelected={statusFilter === 'REJECTED'}
            onClick={() => handleCardClick('REJECTED')}
        />
        <StatCard 
            label={t('payments.unpaidTenants')}
            value={reportData?.unpaidCount || 0}
            icon={<svg className="w-5 h-5 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            color="yellow"
            isSelected={statusFilter === 'UNPAID'}
            onClick={() => handleCardClick('UNPAID')}
        />
      </div>

      <div ref={detailsRef} className="mb-6 scroll-mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {t('payments.paymentDetails')}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {statusFilter ? t(`common.status${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()}`, { defaultValue: statusFilter }) : ''}
            </span>
          </h2>
        </div>
        {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

        {loading ? (
            <TableSkeleton rows={8} cols={columns.length} />
          ) : (
            <Table columns={columns} data={payments} emptyMessage={t('payments.noPaymentsFound', { status: statusFilter })} />
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

      <PaymentInfoModal
        isOpen={isPaymentInfoModalOpen}
        onClose={() => {
          setIsPaymentInfoModalOpen(false);
          setEditingPaymentInfo(null);
        }}
        onSave={handleSavePaymentInfo}
        loading={paymentInfoLoading}
        initialData={editingPaymentInfo}
      />
    </>
  );
}