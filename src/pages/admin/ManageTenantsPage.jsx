import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Table, Badge, Pagination, Alert, Button } from '../../components/common';
import { tenantApi } from '../../api/tenantApi';

const PAGE_SIZE = 10;

export default function ManageTenantsPage() {
  const navigate = useNavigate();
  const [tenants, setTenants]         = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const COLUMNS = [
    { key: 'fullName',    header: 'Name' },
    { key: 'email',       header: 'Email' },
    { key: 'phoneNumber', header: 'Phone',      render: (r) => r.phoneNumber || '—' },
    { key: 'status',      header: 'Status',     render: (r) => <Badge label={r.status} /> },
    { key: 'unitNumber',  header: 'Current Unit',render: (r) => r.unitNumber || '—' },
    { key: 'moveInDate',  header: 'Move-in',    render: (r) => r.moveInDate || '—' },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (r) => (
        <Button size="sm" variant="primary" onClick={() => navigate(`/admin/view/tenant-dashboard/${r.id}`)}>
          View Dashboard
        </Button>
      )
    }
  ];

  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res  = await tenantApi.listAllTenants(page, PAGE_SIZE);
      const data = res.data?.data;
      setTenants(data?.content          || []);
      setTotalPages(data?.totalPages    || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setError('Failed to load tenants.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadTenants(); }, [loadTenants]);

  return (
    <>
      <PageHeader
        title="All Tenants"
        subtitle={`${totalElements} tenant${totalElements !== 1 ? 's' : ''} platform-wide`}
      />

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="bg-[#111827] rounded-xl border border-slate-700/50 overflow-hidden">
        <Table columns={COLUMNS} data={tenants} loading={loading} emptyMessage="No tenants found." />
        <div className="px-4 border-t border-slate-100">
          <Pagination
            page={page} totalPages={totalPages}
            totalElements={totalElements} size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
}