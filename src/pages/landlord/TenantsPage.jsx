import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageHeader, Modal, ConfirmDialog,
  Alert, Pagination, Input, Button,
} from '../../components/common';
import TenantTable from '../../components/tenant/TenantTable';
import PropertySelector from '../../components/property/PropertySelector';
import { tenantApi } from '../../api/tenantApi';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/common';

const PAGE_SIZE = 10;

export default function TenantsPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [selectedProperty, setSelectedProperty] = useState(null);

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
    if (!selectedProperty) return;
    try {
      setLoading(true);
      setFetchError('');
      const res  = await tenantApi.listTenants(page, PAGE_SIZE, selectedProperty.id);
      const data = res.data?.data;
      setTenants(data?.content          || []);
      setTotalPages(data?.totalPages    || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setFetchError(t('tenants.failedLoadTenants'));
    } finally {
      setLoading(false);
    }
  }, [page, selectedProperty, t]);

  useEffect(() => { loadTenants(); }, [loadTenants, selectedProperty]);

  // ── Edit ───────────────────────────────────────────────────────────────────
  function openEdit(tenant) {
    setEditTarget(tenant);
    setEditForm({ fullName: tenant.fullName || '', phoneNumber: tenant.phoneNumber || '' });
    setEditError('');
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      setEditError(t('validation.fullNameRequired'));
      return;
    }
    try {
      setEditLoading(true);
      setEditError('');
      await tenantApi.updateTenant(editTarget.id, editForm);
      toast.success(t('tenants.tenantUpdated'));
      setEditTarget(null);
      loadTenants();
    } catch (err) {
      setEditError(err.response?.data?.message || t('tenants.failedUpdateTenant'));
    } finally {
      setEditLoading(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete() {
    try {
      setDeleteLoading(true);
      await tenantApi.deleteTenant(deleteTarget.id);
      toast.success(t('tenants.tenantDeleted'));
      setDeleteTarget(null);
      loadTenants();
    } catch (err) {
      toast.error(err.response?.data?.message || t('tenants.cannotDeleteTenant'));
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      {!selectedProperty ? (
        <>
          <PageHeader
            title={t('common.selectProperty')}
            subtitle={t('tenants.selectPropertyTenants')}
          />
          <PropertySelector onSelect={(p) => { setSelectedProperty(p); setPage(0); }} />
        </>
      ) : (
        <>
          <button 
            onClick={() => setSelectedProperty(null)} 
            className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
          >
            {t('common.backToProperties')}
          </button>
          <PageHeader
            title={t('tenants.tenantsTitle', { name: selectedProperty.name })}
            subtitle={totalElements !== 1 ? t('tenants.tenantCount', { count: totalElements }) : t('tenants.tenantCountSingular', { count: totalElements })}
          />

          {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

      <div className="mb-6">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : (
          <TenantTable data={tenants} onEdit={openEdit} onDelete={setDeleteTarget} />
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

      {/* Edit Modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={t('tenants.editTenantTitle')}
        footer={null}
      >
        <form onSubmit={handleEdit} className="space-y-4" noValidate>
          {editError && <Alert type="error" message={editError} />}
          <Input
            label={t('auth.fullNameLabel')}
            value={editForm.fullName}
            onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
            disabled={editLoading}
            required
          />
          <Input
            label={t('auth.phoneNumberLabel')}
            value={editForm.phoneNumber}
            onChange={(e) => setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))}
            disabled={editLoading}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={editLoading}>{t('common.saveChanges')}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title={t('tenants.deleteTenantTitle')}
        message={t('tenants.deleteTenantMessage', { name: deleteTarget?.fullName })}
        confirmText={t('common.delete')}
        variant="danger"
      />
        </>
      )}
    </>
  );
}