import { useCallback, useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, Table, Badge, Button, Pagination, Alert, ConfirmDialog } from '../../components/common';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

const NAV = [
  { label: 'Dashboard',  to: '/admin/dashboard',  icon: '📊' },
  { label: 'Landlords',  to: '/admin/landlords',  icon: '🏢' },
  { label: 'Tenants',    to: '/admin/tenants',    icon: '👥' },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: '📋' },
];

const PAGE_SIZE = 10;

export default function ManageLandlordsPage() {
  const toast = useToast();
  const [landlords, setLandlords]     = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null); // { landlord, action }
  const [actionLoading, setActionLoading] = useState(false);

  const loadLandlords = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res  = await adminApi.listLandlords(page, PAGE_SIZE);
      const data = res.data?.data;
      setLandlords(data?.content        || []);
      setTotalPages(data?.totalPages    || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setError('Failed to load landlords.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadLandlords(); }, [loadLandlords]);

  async function handleConfirmAction() {
    if (!confirmTarget) return;
    const { landlord, action } = confirmTarget;
    try {
      setActionLoading(true);
      if (action === 'suspend') {
        await adminApi.suspendLandlord(landlord.id);
        toast.success(`${landlord.fullName} suspended.`);
      } else {
        await adminApi.activateLandlord(landlord.id);
        toast.success(`${landlord.fullName} activated.`);
      }
      setConfirmTarget(null);
      loadLandlords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    { key: 'fullName',    header: 'Name' },
    { key: 'email',       header: 'Email' },
    { key: 'phoneNumber', header: 'Phone',   render: (r) => r.phoneNumber || '—' },
    { key: 'status',      header: 'Status',  render: (r) => <Badge label={r.status} /> },
    { key: 'createdAt',   header: 'Joined',  render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
    {
      key: 'actions', header: 'Actions',
      render: (row) => (
        <Button
          size="sm"
          variant={row.status === 'Suspended' ? 'success' : 'secondary'}
          onClick={() => setConfirmTarget({
            landlord: row,
            action: row.status === 'Suspended' ? 'activate' : 'suspend',
          })}
        >
          {row.status === 'Suspended' ? 'Activate' : 'Suspend'}
        </Button>
      ),
    },
  ];

  const action = confirmTarget?.action;

  return (
    <PortalLayout navItems={NAV} portalLabel="Admin">
      <PageHeader
        title="Manage Landlords"
        subtitle={`${totalElements} registered landlord${totalElements !== 1 ? 's' : ''}`}
      />

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table columns={columns} data={landlords} loading={loading} emptyMessage="No landlords found." />
        <div className="px-4 border-t border-slate-100">
          <Pagination
            page={page} totalPages={totalPages}
            totalElements={totalElements} size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmAction}
        loading={actionLoading}
        title={action === 'suspend' ? 'Suspend Landlord' : 'Activate Landlord'}
        message={
          action === 'suspend'
            ? `Suspend "${confirmTarget?.landlord?.fullName}"? They will be immediately locked out.`
            : `Activate "${confirmTarget?.landlord?.fullName}"? They will regain full access.`
        }
        confirmText={action === 'suspend' ? 'Suspend' : 'Activate'}
        variant={action === 'suspend' ? 'danger' : 'success'}
      />
    </PortalLayout>
  );
}