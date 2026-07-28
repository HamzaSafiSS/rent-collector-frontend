import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader, Button, Modal, ConfirmDialog,
  Alert, Spinner, Pagination,
} from '../../components/common';
import PropertyForm from '../../components/property/PropertyForm';
import { propertyApi } from '../../api/propertyApi';
import { useToast } from '../../context/ToastContext';
import { CardGridSkeleton } from '../../components/common';

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
    <>
      <PageHeader
        title="My Properties"
        subtitle={`${totalElements} propert${totalElements !== 1 ? 'ies' : 'y'}`}
        actions={<Button onClick={() => { setCreateOpen(true); setFormError(''); }}>+ Add Property</Button>}
      />

      {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : properties.length === 0 ? (
        <div className="text-center py-24 bg-[#111827] rounded-3xl border border-slate-700/50 shadow-sm">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <p className="text-4xl">🏗️</p>
          </div>
          <p className="text-xl text-slate-200 font-bold">No properties yet</p>
          <p className="text-slate-500 text-sm mt-2 mb-6 max-w-sm mx-auto">You haven't added any properties to your portfolio. Create your first property to get started.</p>
          <Button className="shadow-md" onClick={() => setCreateOpen(true)}>+ Add Property</Button>
        </div>
      ) : (
        <>
          {/* Property cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <div
                key={p.id}
                className="bg-[#111827] rounded-2xl border border-slate-700/50 p-6 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                onClick={() => navigate(`/landlord/properties/${p.id}`)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="flex items-start justify-between mb-4 z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-2xl shadow-md text-white">
                    🏗️
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      onClick={() => { setEditTarget(p); setFormError(''); }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/100/10 rounded-lg transition-colors"
                      onClick={() => setDeleteTarget(p)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-100 truncate z-10">{p.name}</h3>
                <p className="text-sm text-slate-500 mt-1 truncate z-10">{p.address}</p>
                {p.description && (
                  <p className="text-sm text-slate-500 mt-3 line-clamp-2 z-10">{p.description}</p>
                )}
                <div className="mt-5 flex items-center text-sm font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors z-10">
                  View units <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
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
    </>
  );
}