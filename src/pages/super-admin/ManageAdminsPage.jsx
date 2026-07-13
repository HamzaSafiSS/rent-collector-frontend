import { useCallback, useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import {
  PageHeader, Table, Badge, Button, Modal,
  ConfirmDialog, Pagination, Spinner, Alert,
} from '../../components/common';
import AdminForm from '../../components/admin/AdminForm';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

const NAV = [
  { label: 'Dashboard',     to: '/super-admin/dashboard',  icon: '📊' },
  { label: 'Manage Admins', to: '/super-admin/admins',     icon: '👥' },
  { label: 'Audit Logs',    to: '/super-admin/audit-logs', icon: '📋' },
];

const PAGE_SIZE = 10;

export default function ManageAdminsPage() {
  const toast = useToast();

  const [admins, setAdmins]           = useState([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage]               = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

  // Modal state
  const [createOpen, setCreateOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading]   = useState(false);
  const [formError, setFormError]       = useState('');

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res  = await adminApi.listAdmins(page, PAGE_SIZE);
      const data = res.data?.data;
      setAdmins(data?.content        || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setFetchError('Failed to load admin accounts.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  // ── Create ─────────────────────────────────────────────────────────────────
  async function handleCreate(form) {
    try {
      setFormLoading(true);
      setFormError('');
      await adminApi.createAdmin(form);
      toast.success('Admin account created.');
      setCreateOpen(false);
      loadAdmins();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create admin.');
    } finally {
      setFormLoading(false);
    }
  }

  // ── Update ─────────────────────────────────────────────────────────────────
  async function handleUpdate(form) {
    try {
      setFormLoading(true);
      setFormError('');
      await adminApi.updateAdmin(editTarget.id, form);
      toast.success('Admin updated.');
      setEditTarget(null);
      loadAdmins();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update admin.');
    } finally {
      setFormLoading(false);
    }
  }

  // ── Suspend / Activate ─────────────────────────────────────────────────────
  async function handleToggleStatus(admin) {
    try {
      if (admin.status === 'Suspended') {
        await adminApi.activateAdmin(admin.id);
        toast.success(`${admin.fullName} activated.`);
      } else {
        await adminApi.suspendAdmin(admin.id);
        toast.success(`${admin.fullName} suspended.`);
      }
      loadAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    try {
      setFormLoading(true);
      await adminApi.deleteAdmin(deleteTarget.id);
      toast.success('Admin deleted.');
      setDeleteTarget(null);
      loadAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete admin.');
    } finally {
      setFormLoading(false);
    }
  }

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    { key: 'fullName',  header: 'Name' },
    { key: 'email',     header: 'Email' },
    { key: 'phoneNumber', header: 'Phone', render: (r) => r.phoneNumber || '—' },
    { key: 'status',    header: 'Status', render: (r) => <Badge label={r.status} /> },
    { key: 'createdAt', header: 'Created', render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => { setEditTarget(row); setFormError(''); }}>
            Edit
          </Button>
          <Button
            size="sm"
            variant={row.status === 'Suspended' ? 'success' : 'secondary'}
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === 'Suspended' ? 'Activate' : 'Suspend'}
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PortalLayout navItems={NAV} portalLabel="Super Admin">
      <PageHeader
        title="Manage Admins"
        subtitle={`${totalElements} admin account${totalElements !== 1 ? 's' : ''}`}
        actions={
          <Button onClick={() => { setCreateOpen(true); setFormError(''); }}>
            + New Admin
          </Button>
        }
      />

      {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table
          columns={columns}
          data={admins}
          loading={loading}
          emptyMessage="No admin accounts yet."
        />
        <div className="px-4 border-t border-slate-100">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Admin Account" footer={null}>
        <AdminForm
          onSubmit={handleCreate}
          loading={formLoading}
          error={formError}
          isEdit={false}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Admin" footer={null}>
        <AdminForm
          initial={editTarget}
          onSubmit={handleUpdate}
          loading={formLoading}
          error={formError}
          isEdit={true}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={formLoading}
        title="Delete Admin"
        message={`Are you sure you want to delete "${deleteTarget?.fullName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </PortalLayout>
  );
}