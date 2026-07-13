import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../components/common/PortalLayout';
import {
  PageHeader, Button, Modal, ConfirmDialog,
  Alert, Spinner, Pagination,
} from '../../components/common';
import PropertyForm from '../../components/property/PropertyForm';
import { propertyApi } from '../../api/propertyApi';
import { useToast } from '../../context/ToastContext';
import { LANDLORD_NAV } from './landlordNav';

const PAGE_SIZE = 9;

export default function PropertiesPage() {
  const navigate = useNavigate();
  const toast    = useToast();

  const [properties, setProperties]   = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

  const [createOpen, setCreateOpen]   = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]     = useState('');

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res  = await propertyApi.listMyProperties(page, PAGE_SIZE);
      const data = res.data?.data;
      setProperties(data?.content        || []);
      setTotalPages(data?.totalPages     || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setFetchError('Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  async function handleCreate(form) {
    try {
      setFormLoading(true); setFormError('');
      await propertyApi.createProperty(form);
      toast.success('Property created.');
      setCreateOpen(false);
      loadProperties();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create property.');
    } finally { setFormLoading(false); }
  }

  async function handleUpdate(form) {
    try {
      setFormLoading(true); setFormError('');
      await propertyApi.updateProperty(editTarget.id, form);
      toast.success('Property updated.');
      setEditTarget(null);
      loadProperties();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update property.');
    } finally { setFormLoading(false); }
  }

  async function handleDelete() {
    try {
      setFormLoading(true);
      await propertyApi.deleteProperty(deleteTarget.id);
      toast.success('Property deleted.');
      setDeleteTarget(null);
      loadProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete property.');
      setDeleteTarget(null);
    } finally { setFormLoading(false); }
  }

  return (
    <PortalLayout navItems={LANDLORD_NAV} portalLabel="Landlord">
      <PageHeader
        title="My Properties"
        subtitle={`${totalElements} propert${totalElements !== 1 ? 'ies' : 'y'}`}
        actions={<Button onClick={() => { setCreateOpen(true); setFormError(''); }}>+ Add Property</Button>}
      />

      {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🏗️</p>
          <p className="text-slate-600 font-medium">No properties yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first property to get started.</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>Add Property</Button>
        </div>
      ) : (
        <>
          {/* Property cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/landlord/properties/${p.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">🏗️</div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => { setEditTarget(p); setFormError(''); }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(p)}>Delete</Button>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 truncate">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 truncate">{p.address}</p>
                {p.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{p.description}</p>
                )}
                <p className="text-xs text-blue-600 font-medium mt-3">View units →</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} size={PAGE_SIZE} onPageChange={setPage} />
          </div>
        </>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New Property" footer={null}>
        <PropertyForm onSubmit={handleCreate} loading={formLoading} error={formError} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Property" footer={null}>
        <PropertyForm initial={editTarget} onSubmit={handleUpdate} loading={formLoading} error={formError} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={formLoading}
        title="Delete Property"
        message={`Delete "${deleteTarget?.name}"? All associated units must be available. This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </PortalLayout>
  );
}