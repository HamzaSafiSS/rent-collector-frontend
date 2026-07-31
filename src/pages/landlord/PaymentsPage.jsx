import { useCallback, useEffect, useState, useRef } from 'react';
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

const PAGE_SIZE = 10;

export default function PaymentsPage() {
  const toast = useToast();
  const detailsRef = useRef(null);

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
      setFetchError('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, monthFilter, selectedProperty]);

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
    <>
      {!selectedProperty ? (
        <>
          <PageHeader
            title="Select Property"
            subtitle="Choose a property to view its payments"
          />
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
            ← Back to Properties
          </button>
          <PageHeader
            title={`Payments — ${selectedProperty.name}`}
            subtitle={`${totalElements} payment${totalElements !== 1 ? 's' : ''}`}
          />

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-100">Summary</h2>
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
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="blue"
            isSelected={statusFilter === 'PENDING'}
            onClick={() => handleCardClick('PENDING')}
        />
        <StatCard 
            label="Approved Payments"
            value={reportData?.approvedCount || 0}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
            color="green"
            isSelected={statusFilter === 'APPROVED'}
            onClick={() => handleCardClick('APPROVED')}
        />
        <StatCard 
            label="Rejected Payments"
            value={reportData?.rejectedCount || 0}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
            color="red"
            isSelected={statusFilter === 'REJECTED'}
            onClick={() => handleCardClick('REJECTED')}
        />
        <StatCard 
            label="Unpaid Tenants"
            value={reportData?.unpaidCount || 0}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            color="yellow"
            isSelected={statusFilter === 'UNPAID'}
            onClick={() => handleCardClick('UNPAID')}
        />
      </div>

      <div ref={detailsRef} className="mb-6 scroll-mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Payment Details
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {statusFilter}
            </span>
          </h2>
        </div>
        {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

        {loading ? (
            <TableSkeleton rows={8} cols={columns.length} />
          ) : (
            <Table columns={columns} data={payments} emptyMessage={`No ${statusFilter.toLowerCase()} payments found.`} />
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