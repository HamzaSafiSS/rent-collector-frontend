import { useCallback, useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, Badge, Spinner, Alert, Pagination, Input } from '../../components/common';
import { paymentApi } from '../../api/paymentApi';
import PaymentDetailModal from '../../components/payment/PaymentDetailModal';
import { TENANT_NAV } from './tenantNav';

const PAGE_SIZE = 10;

export default function PaymentHistoryPage() {
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
    } catch { setError('Failed to load payment history.'); }
    finally  { setLoading(false); }
  }, [page, statusFilter, monthFilter]);

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
    <PortalLayout navItems={TENANT_NAV} portalLabel="Tenant">
      <PageHeader title="Payment History" subtitle={`${totalElements} payment${totalElements !== 1 ? 's' : ''}`} />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div className="w-full sm:w-48">
          <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
          <Input 
            type="month" 
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(0); }}
            placeholder="Filter by month"
          />
        </div>
      </div>

      {error   && <Alert type="error" message={error} />}
      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

      {!loading && !error && payments.length === 0 && (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <p className="text-3xl mb-3">💳</p>
          <p className="text-slate-500">No payments found.</p>
        </div>
      )}

      {!loading && !error && payments.length > 0 && (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">💳</div>
                  <div>
                    <p className="font-semibold text-slate-800">ETB {Number(p.amount).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.paymentMonth} · Uploaded {p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.status === 'REJECTED' && (
                    <button
                      onClick={() => openDetail(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  )}
                  <Badge label={p.status} />
                </div>
              </div>

              {p.status === 'REJECTED' && p.landLoardComment && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <p className="text-xs font-medium text-red-700">Rejection reason:</p>
                  <p className="text-xs text-red-600 mt-0.5">{p.landLoardComment}</p>
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
    </PortalLayout>
  );
}