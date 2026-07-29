import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Table, Alert, Pagination, TableSkeleton } from '../../components/common';
import { paymentApi } from '../../api/paymentApi';

const PAGE_SIZE = 10;

export default function DueSoonPage() {
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const loadDueSoonTenants = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await paymentApi.getLandlordPayments({ status: 'DUE_SOON', page, size: PAGE_SIZE });
      const data = res.data?.data;
      setTenants(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      setFetchError('Failed to load tenants due soon.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadDueSoonTenants();
  }, [loadDueSoonTenants]);

  const columns = [
    { key: 'tenantFullName', header: 'Tenant', render: (r) => r.tenantFullName || '—' },
    { key: 'tenantEmail', header: 'Email' },
    { key: 'propertyName', header: 'Property' },
    { key: 'unitNumber', header: 'Unit' },
    { key: 'amount', header: 'Amount Due (ETB)', render: (r) => Number(r.amount).toLocaleString() },
  ];

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      <PageHeader
        title="Tenants Due Soon (≤ 3 days)"
        subtitle={`${totalElements} tenant${totalElements !== 1 ? 's' : ''} have upcoming payments`}
      />

      {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

      <div className="mb-6">
        {loading ? (
          <TableSkeleton rows={8} cols={columns.length} />
        ) : (
          <Table columns={columns} data={tenants} emptyMessage="No tenants currently due soon." />
        )}
      </div>

      {tenants.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Pagination
            page={page} totalPages={totalPages}
            totalElements={totalElements} size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </>
  );
}
