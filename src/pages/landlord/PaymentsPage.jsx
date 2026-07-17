import { useCallback, useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import {
  PageHeader, Table, Badge, Button, Alert, Pagination,
} from '../../components/common';
import ReviewModal from '../../components/payment/ReviewModal';
import { paymentApi } from '../../api/paymentApi';
import { useToast } from '../../context/ToastContext';
import { LANDLORD_NAV } from './landlordNav';
import { TableSkeleton } from '../../components/common';

const PAGE_SIZE = 10;

export default function PaymentsPage() {
  const toast = useToast();

  const [payments, setPayments]       = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

  const [statusFilter, setStatusFilter] = useState('PENDING');

  const [reviewPayment, setReviewPayment] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError]     = useState('');

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');

      const params = { page, size: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;

      const res  = statusFilter === 'PENDING'
        ? await paymentApi.getPendingPayments(page, PAGE_SIZE)
        : await paymentApi.getLandlordPayments(params);

      const data = res.data?.data;
      setPayments(data?.content          || []);
      setTotalPages(data?.totalPages     || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setFetchError('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  async function handleApprove(paymentId) {
    try {
      setReviewLoading(true);
      setReviewError('');
      await paymentApi.approvePayment(paymentId);
      toast.success('Payment approved.');
      setReviewPayment(null);
      loadPayments();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to approve payment.');
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleReject(paymentId, comment) {
    try {
      setReviewLoading(true);
      setReviewError('');
      await paymentApi.rejectPayment(paymentId, comment);
      toast.success('Payment rejected.');
      setReviewPayment(null);
      loadPayments();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to reject payment.');
    } finally {
      setReviewLoading(false);
    }
  }

  const columns = [
    { key: 'id',            header: 'ID' },
    { key: 'tenantFullName',header: 'Tenant',     render: (r) => r.tenantFullName || '—' },
    { key: 'unitNumber',    header: 'Unit' },
    { key: 'propertyName',  header: 'Property' },
    { key: 'paymentMonth',  header: 'Month' },
    { key: 'amount',        header: 'Amount (ETB)', render: (r) => Number(r.amount).toLocaleString() },
    { key: 'status',        header: 'Status',      render: (r) => <Badge label={r.status} /> },
    { key: 'uploadedAt',    header: 'Uploaded',    render: (r) => r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : '—' },
    {
      key: 'actions', header: 'Actions',
      render: (row) => (
        <Button size="sm" variant="ghost" onClick={() => { setReviewPayment(row); setReviewError(''); }}>
          {row.status === 'PENDING' ? 'Review' : 'View'}
        </Button>
      ),
    },
  ];

  return (
    <PortalLayout navItems={LANDLORD_NAV} portalLabel="Landlord">
      <PageHeader
        title="Payments"
        subtitle={`${totalElements} payment${totalElements !== 1 ? 's' : ''}`}
      />

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4">
        {['PENDING', 'APPROVED', 'REJECTED', ''].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

      <div className="mb-6">
        {loading ? (
            <TableSkeleton rows={8} cols={columns.length} />
          ) : (
            <Table columns={columns} data={payments} emptyMessage="No payments found." />
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
    </PortalLayout>
  );
}