import { useCallback, useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import {
  PageHeader, Table, Badge, Button, Alert, Pagination,
} from '../../components/common';
import ReviewModal from '../../components/payment/ReviewModal';
import { paymentApi } from '../../api/paymentApi';
import { reportApi } from '../../api/reportApi';
import { useToast } from '../../context/ToastContext';
import { LANDLORD_NAV } from './landlordNav';
import { TableSkeleton } from '../../components/common';
import StatCard from '../../components/common/StatCard';
import Input from '../../components/common/Input';

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
  const [monthFilter, setMonthFilter]   = useState('');

  const [reportData, setReportData]   = useState(null);

  const [reviewPayment, setReviewPayment] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError]     = useState('');

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');

      const params = { page, size: PAGE_SIZE };
      if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;
      if (monthFilter) params.month = monthFilter;

      // get pending has its own endpoint, but if we have month filter, we can't use it easily since the endpoint doesn't support it directly. Actually we can just use the landlordPayments endpoint for pending if month is provided.
      let res;
      if (statusFilter === 'PENDING' && !monthFilter) {
          res = await paymentApi.getPendingPayments(page, PAGE_SIZE);
      } else {
          res = await paymentApi.getLandlordPayments(params);
      }

      const data = res.data?.data;
      setPayments(data?.content          || []);
      setTotalPages(data?.totalPages     || 0);
      setTotalElements(data?.totalElements || 0);

      const reportParams = {};
      if (monthFilter) {
          reportParams.from = monthFilter;
          reportParams.to = monthFilter;
      }
      const reportRes = await reportApi.getPaymentReport(reportParams);
      setReportData(reportRes.data?.data);
    } catch {
      setFetchError('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, monthFilter]);

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

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-800">Summary</h2>
        <div className="w-48">
          <Input 
            type="month" 
            value={monthFilter}
            onChange={(e) => { setMonthFilter(e.target.value); setPage(0); }}
            placeholder="Filter by month"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
            label="Pending Payments"
            value={reportData?.pendingCount || 0}
            icon="⏳"
            color={statusFilter === 'PENDING' ? 'blue' : 'slate'} 
            onClick={() => { setStatusFilter('PENDING'); setPage(0); }}
        />
        <StatCard 
            label="Approved Payments"
            value={reportData?.approvedCount || 0}
            icon="✅"
            color={statusFilter === 'APPROVED' ? 'green' : 'slate'} 
            onClick={() => { setStatusFilter('APPROVED'); setPage(0); }}
        />
        <StatCard 
            label="Rejected Payments"
            value={reportData?.rejectedCount || 0}
            icon="❌"
            color={statusFilter === 'REJECTED' ? 'red' : 'slate'} 
            onClick={() => { setStatusFilter('REJECTED'); setPage(0); }}
        />
        <StatCard 
            label="Unpaid Tenants"
            value={reportData?.unpaidCount || 0}
            icon="⚠️"
            color={statusFilter === 'UNPAID' ? 'yellow' : 'slate'} 
            onClick={() => { setStatusFilter('UNPAID'); setPage(0); }}
        />
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