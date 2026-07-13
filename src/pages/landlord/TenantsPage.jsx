import { useCallback, useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import {
  PageHeader, Modal, ConfirmDialog,
  Alert, Pagination, Input, Button,
} from '../../components/common';
import TenantTable from '../../components/tenant/TenantTable';
import { tenantApi } from '../../api/tenantApi';
import { useToast } from '../../context/ToastContext';
import { LANDLORD_NAV } from './landlordNav';

const PAGE_SIZE = 10;

export default function TenantsPage() {
  const toast = useToast();

  const [tenants, setTenants]         = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

  // Edit modal
  const [editTarget, setEditTarget]   = useState(null);
  const [editForm, setEditForm]       = useState({ fullName: '', phoneNumber: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError]     = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res  = await tenantApi.listTenants(page, PAGE_SIZE);
      const data = res.data?.data;
      setTenants(data?.content          || []);
      setTotalPages(data?.totalPages    || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setFetchError('Failed to load tenants.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadTenants(); }, [loadTenants]);

  // ── Edit ───────────────────────────────────────────────────────────────────
  function openEdit(tenant) {
    setEditTarget(tenant);
    setEditForm({ fullName: tenant.fullName || '', phoneNumber: tenant.phoneNumber || '' });
    setEditError('');
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      setEditError('Full name is required.');
      return;
    }
    try {
      setEditLoading(true);
      setEditError('');
      await tenantApi.updateTenant(editTarget.id, editForm);
      toast.success('Tenant updated.');
      setEditTarget(null);
      loadTenants();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update tenant.');
    } finally {
      setEditLoading(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    try {
      setDeleteLoading(true);
      await tenantApi.deleteTenant(deleteTarget.id);
      toast.success('Tenant deleted.');
      setDeleteTarget(null);
      loadTenants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete tenant.');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <PortalLayout navItems={LANDLORD_NAV} portalLabel="Landlord">
      <PageHeader
        title="My Tenants"
        subtitle={`${totalElements} tenant${totalElements !== 1 ? 's' : ''}`}
      />

      {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <TenantTable
          data={tenants}
          loading={loading}
          onEdit={openEdit}
          onDelete={(t) => setDeleteTarget(t)}
        />
        <div className="px-4 border-t border-slate-100">
          <Pagination
            page={page} totalPages={totalPages}
            totalElements={totalElements} size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Tenant Contact Info"
        footer={null}
      >
        <form onSubmit={handleEdit} className="space-y-4" noValidate>
          {editError && <Alert type="error" message={editError} />}
          <Input
            label="Full name"
            value={editForm.fullName}
            onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
            disabled={editLoading}
          />
          <Input
            label="Phone number"
            value={editForm.phoneNumber}
            onChange={(e) => setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))}
            disabled={editLoading}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={editLoading}>Save changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Tenant"
        message={`Delete "${deleteTarget?.fullName}"? They must have no active leases. This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </PortalLayout>
  );
}