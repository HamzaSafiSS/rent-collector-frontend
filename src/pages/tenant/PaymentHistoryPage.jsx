import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, Badge, Spinner, Alert, Pagination, Input } from '../../components/common';
import { paymentApi } from '../../api/paymentApi';
import PaymentDetailModal from '../../components/payment/PaymentDetailModal';

const PAGE_SIZE = 10;

export default function PaymentHistoryPage() {
  const { t } = useTranslation();
  const [payments, setPayments]       = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [monthFilter, setMonthFilter]   = useState('');

  // Detail modal state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailOpen, setDetailOpen]           = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      
      const params = { page, size: PAGE_SIZE };
      if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;
      if (monthFilter) params.month = monthFilter;
      
      const res  = await paymentApi.getMyPayments(params);
      const data = res.data?.data;
      setPayments(data?.content          || []);
      setTotalPages(data?.totalPages     || 0);
      setTotalElements(data?.totalElements || 0);
    } catch { setError(t('payments.failedLoadPaymentHistory')); }
    finally  { setLoading(false); }
  }, [page, statusFilter, monthFilter, t]);

  useEffect(() => { load(); }, [load]);

  function openDetail(payment) {
    setSelectedPayment(payment);
    setDetailOpen(true);
  }

  function closeDetail() {
    setDetailOpen(false);
    setSelectedPayment(null);
  }

  return (
    <>
      <PageHeader title={t('payments.paymentHistoryTitle')} subtitle={totalElements !== 1 ? t('payments.paymentCount', { count: totalElements }) : t('payments.paymentCountSingular', { count: totalElements })} />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-slate-300 mb-1">{t('leases.status')}</label>
          <select
            className="w-full px-3 py-2 bg-[#111827] text-slate-100 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option className="bg-[#111827] text-slate-100" value="ALL">{t('payments.allStatuses')}</option>
            <option className="bg-[#111827] text-slate-100" value="PENDING">{t('payments.statusPending')}</option>
            <option className="bg-[#111827] text-slate-100" value="APPROVED">{t('payments.statusApproved')}</option>
            <option className="bg-[#111827] text-slate-100" value="REJECTED">{t('payments.statusRejected')}</option>
          </select>
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-slate-300 mb-1">{t('payments.month')}</label>
          <Input 
            type="month" 
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(0); }}
            placeholder={t('payments.filterByMonth')}
          />
        </div>
      </div>

      {error   && <Alert type="error" message={error} />}
      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

      {!loading && !error && payments.length === 0 && (
        <div className="text-center py-20 bg-[#111827] border border-slate-700/50 rounded-xl">
          <p className="text-3xl mb-3">💳</p>
          <p className="text-slate-500">{t('payments.noPaymentsFoundSimple')}</p>
        </div>
      )}

      {!loading && !error && payments.length > 0 && (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="bg-[#111827] border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/15 rounded-lg flex items-center justify-center text-lg">💳</div>
                  <div>
                    <p className="font-semibold text-slate-100">ETB {Number(p.amount).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.paymentMonth} · {t('payments.uploaded')} {p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.status === 'REJECTED' && (
                    <button
                      onClick={() => openDetail(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-blue-200 rounded-lg hover:bg-emerald-500/15 hover:text-emerald-300 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {t('common.view')}
                    </button>
                  )}
                  <Badge statusKey={p.status} label={p.status ? t(`common.status${p.status.charAt(0) + p.status.slice(1).toLowerCase()}`, { defaultValue: p.status }) : ''} />
                </div>
              </div>

              {p.status === 'REJECTED' && p.landLoardComment && (
                <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <p className="text-xs font-medium text-red-400">{t('payments.rejectionReasonDisplay')}</p>
                  <p className="text-xs text-red-400 mt-0.5">{p.landLoardComment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && payments.length > 0 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} size={PAGE_SIZE} onPageChange={setPage} />
        </div>
      )}

      {/* Payment detail modal */}
      <PaymentDetailModal
        payment={selectedPayment}
        isOpen={detailOpen}
        onClose={closeDetail}
      />
    </>
  );
}