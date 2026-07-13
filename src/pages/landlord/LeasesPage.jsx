import { useCallback, useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import {
  PageHeader, Table, Badge, Button, Modal,
  ConfirmDialog, Alert, Pagination,
} from '../../components/common';
import LeaseForm from '../../components/lease/LeaseForm';
import { leaseApi } from '../../api/leaseApi';
import { unitApi } from '../../api/unitApi';
import { propertyApi } from '../../api/propertyApi';
import { useToast } from '../../context/ToastContext';
import { LANDLORD_NAV } from './landlordNav';

const PAGE_SIZE = 10;

export default function LeasesPage() {
  const toast = useToast();

  const [leases, setLeases]           = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

  const [statusFilter, setStatusFilter] = useState('');

  // Create lease
  const [createOpen, setCreateOpen]   = useState(false);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]     = useState('');

  // Terminate
  const [terminateTarget, setTerminateTarget] = useState(null);
  const [termLoading, setTermLoading] = useState(false);

  const loadLeases = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res  = await leaseApi.listLeases(page, PAGE_SIZE, statusFilter || null);
      const data = res.data?.data;
      setLeases(data?.content          || []);
      setTotalPages(data?.totalPages   || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setFetchError('Failed to load leases.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { loadLeases(); }, [loadLeases]);

  // Load available units for the create form
  async function openCreateModal() {
    setFormError('');
    setCreateOpen(true);
    try {
      // Get all properties then collect their available units
      const propRes    = await propertyApi.listMyProperties(0, 100);
      const properties = propRes.data?.data?.content || [];
      const unitPromises = properties.map((p) =>
        unitApi.listUnits(p.id, 0, 200)
          .then((r) => r.data?.data?.content || [])
          .catch(() => [])
      );
      const allUnitArrays = await Promise.all(unitPromises);
      const available = allUnitArrays
        .flat()
        .filter((u) => u.status === 'AVAILABLE');
      setAvailableUnits(available);
    } catch {
      setAvailableUnits([]);
    }
  }

  async function handleCreate(payload) {
    try {
      setFormLoading(true);
      setFormError('');
      const res = await leaseApi.createLease(payload);
      const msg = res.data?.message || 'Lease created.';
      toast.success(msg);
      setCreateOpen(false);
      loadLeases();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create lease.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleTerminate() {
    try {
      setTermLoading(true);
      await leaseApi.terminateLease(terminateTarget.id, null);
      toast.success('Lease terminated.');
      setTerminateTarget(null);
      loadLeases();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to terminate lease.');
      setTerminateTarget(null);
    } finally {
      setTermLoading(false);
    }
  }

  const columns = [
    { key: 'id',            header: 'ID' },
    { key: 'tenantFullName',header: 'Tenant',     render: (r) => r.tenantFullName || '—' },
    { key: 'tenantEmail',   header: 'Email',      render: (r) => <span className="text-xs">{r.tenantEmail || '—'}</span> },
    { key: 'unitNumber',    header: 'Unit' },
    { key: 'propertyName',  header: 'Property' },
    { key: 'monthlyRent',   header: 'Rent (ETB)', render: (r) => Number(r.monthlyRent).toLocaleString() },
    { key: 'startDate',     header: 'Start Date' },
    { key: 'status',        header: 'Status',     render: (r) => <Badge label={r.status} /> },
    {
      key: 'actions', header: 'Actions',
      render: (row) => row.status === 'ACTIVE' ? (
        <Button size="sm" variant="danger" onClick={() => setTerminateTarget(row)}>
          Terminate
        </Button>
      ) : <span className="text-xs text-slate-400">Terminated</span>,
    },
  ];

  return (
    <PortalLayout navItems={LANDLORD_NAV} portalLabel="Landlord">
      <PageHeader
        title="Leases"
        subtitle={`${totalElements} lease${totalElements !== 1 ? 's' : ''}`}
        actions={
          <Button onClick={openCreateModal}>+ New Lease</Button>
        }
      />

      {/* Status filter */}
      <div className="flex gap-2 mb-4">
        {['', 'ACTIVE', 'TERMINATED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table columns={columns} data={leases} loading={loading} emptyMessage="No leases found." />
        <div className="px-4 border-t border-slate-100">
          <Pagination
            page={page} totalPages={totalPages}
            totalElements={totalElements} size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Lease"
        size="lg"
        footer={null}
      >
        <LeaseForm
          units={availableUnits}
          onSubmit={handleCreate}
          loading={formLoading}
          error={formError}
        />
      </Modal>

      {/* Terminate Confirm */}
      <ConfirmDialog
        isOpen={!!terminateTarget}
        onClose={() => setTerminateTarget(null)}
        onConfirm={handleTerminate}
        loading={termLoading}
        title="Terminate Lease"
        message={`Terminate lease for "${terminateTarget?.tenantFullName}" in unit "${terminateTarget?.unitNumber}"? The unit will be freed immediately.`}
        confirmText="Terminate"
        variant="danger"
      />
    </PortalLayout>
  );
}