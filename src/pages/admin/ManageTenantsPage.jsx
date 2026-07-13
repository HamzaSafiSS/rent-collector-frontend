import { useCallback, useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, Table, Badge, Pagination, Alert } from '../../components/common';
import { tenantApi } from '../../api/tenantApi';

const NAV = [
  { label: 'Dashboard',  to: '/admin/dashboard',  icon: '📊' },
  { label: 'Landlords',  to: '/admin/landlords',  icon: '🏢' },
  { label: 'Tenants',    to: '/admin/tenants',    icon: '👥' },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: '📋' },
];

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: 'fullName',    header: 'Name' },
  { key: 'email',       header: 'Email' },
  { key: 'phoneNumber', header: 'Phone',      render: (r) => r.phoneNumber || '—' },
  { key: 'status',      header: 'Status',     render: (r) => <Badge label={r.status} /> },
  { key: 'unitNumber',  header: 'Current Unit',render: (r) => r.unitNumber || '—' },
  { key: 'moveInDate',  header: 'Move-in',    render: (r) => r.moveInDate || '—' },
  { key: 'activeLeaseCount', header: 'Active Leases', render: (r) => r.activeLeaseCount ?? 0 },
];

export default function ManageTenantsPage() {
  const [tenants, setTenants]         = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

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
    <PortalLayout navItems={NAV} portalLabel="Admin">
      <PageHeader
        title="All Tenants"
        subtitle={`${totalElements} tenant${totalElements !== 1 ? 's' : ''} platform-wide`}
      />

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table columns={COLUMNS} data={tenants} loading={loading} emptyMessage="No tenants found." />
        <div className="px-4 border-t border-slate-100">
          <Pagination
            page={page} totalPages={totalPages}
            totalElements={totalElements} size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </PortalLayout>
  );
}