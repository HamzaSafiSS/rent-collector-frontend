import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader, Button, Modal, ConfirmDialog,
  Alert, Spinner, Pagination,
} from '../../components/common';
import PropertyForm from '../../components/property/PropertyForm';
import PropertyImage from '../../components/property/PropertyImage';
import { propertyApi } from '../../api/propertyApi';
import { unitApi } from '../../api/unitApi';
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

  // Per-property unit stats
  const [propertyStats, setPropertyStats] = useState({});

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res  = await propertyApi.listMyProperties(page, PAGE_SIZE);
      const data = res.data?.data;
      const props = data?.content || [];
      setProperties(props);
      setTotalPages(data?.totalPages     || 0);
      setTotalElements(data?.totalElements || 0);

      // Load unit stats for each property
      const statsMap = {};
      await Promise.all(props.map(async (p) => {
        try {
          const unitsRes = await unitApi.listUnits(p.id, 0, 500);
          const units = unitsRes.data?.data?.content || [];
          const total = units.length;
          const occupied = units.filter(u => u.status === 'OCCUPIED').length;
          const available = units.filter(u => u.status === 'AVAILABLE').length;
          statsMap[p.id] = { total, occupied, available };
        } catch {
          statsMap[p.id] = { total: p.unitsCount || 0, occupied: 0, available: 0 };
        }
      }));
      setPropertyStats(statsMap);
    } catch {
      setFetchError('Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  async function handleCreate(form, imageFile) {
    try {
      setFormLoading(true); setFormError('');
      await propertyApi.createProperty(form, imageFile);
      toast.success('Property created.');
      setCreateOpen(false);
      loadProperties();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create property.');
    } finally { setFormLoading(false); }
  }

  async function handleUpdate(form, imageFile) {
    try {
      setFormLoading(true); setFormError('');
      await propertyApi.updateProperty(editTarget.id, form, imageFile);
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

  const propertyNames = properties.map(p => p.name).join(', ');

  return (
    <>
      {/* Portfolio Header */}
      <div className="bg-gradient-to-r from-[#0c1a2e] to-[#111827] rounded-2xl border border-slate-700/50 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-1">Portfolio Management</p>
            <h1 className="text-2xl font-bold text-white">
              {totalElements} Real Estate Propert{totalElements !== 1 ? 'ies' : 'y'}
            </h1>
            {properties.length > 0 && (
              <p className="text-sm text-slate-400 mt-1 max-w-lg">
                Managing {properties.reduce((sum, p) => sum + (propertyStats[p.id]?.total || p.unitsCount || 0), 0)} units across {propertyNames}.
              </p>
            )}
          </div>
          <Button onClick={() => { setCreateOpen(true); setFormError(''); }}>
            + Add New Property
          </Button>
        </div>
      </div>

      {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : properties.length === 0 ? (
        <div className="text-center py-24 bg-[#111827] rounded-3xl border border-slate-700/50 shadow-sm">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" /></svg>
          </div>
          <p className="text-xl text-slate-200 font-bold">No properties yet</p>
          <p className="text-slate-500 text-sm mt-2 mb-6 max-w-sm mx-auto">You haven't added any properties to your portfolio. Create your first property to get started.</p>
          <Button className="shadow-md" onClick={() => setCreateOpen(true)}>+ Add Property</Button>
        </div>
      ) : (
        <>
          {/* Property cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => {
              const stats = propertyStats[p.id] || { total: p.unitsCount || 0, occupied: 0, available: 0 };
              const occupancy = stats.total > 0 ? ((stats.occupied / stats.total) * 100).toFixed(1) : '0.0';

              return (
                <div
                  key={p.id}
                  className="bg-[#111827] rounded-2xl border border-slate-700/50 overflow-hidden hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/landlord/properties/${p.id}`)}
                >
                  {/* Image Hero */}
                  <div className="relative h-48 overflow-hidden">
                    {p.imageUrl ? (
                      <PropertyImage
                        propertyId={p.id}
                        hasImage={!!p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : null}
                    {/* Fallback placeholder — shown when no image */}
                    {!p.imageUrl && (
                      <div className="flex w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 items-center justify-center">
                        <svg className="w-16 h-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
                        </svg>
                      </div>
                    )}
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    {/* Property name & address overlaid on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-bold text-white truncate">{p.name}</h3>
                      <p className="text-sm text-slate-300 flex items-center gap-1 truncate mt-0.5">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {p.address}
                      </p>
                    </div>
                    {/* Edit/Delete overlay */}
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="p-1.5 bg-slate-900/80 backdrop-blur text-slate-300 hover:text-emerald-400 rounded-lg transition-colors"
                        onClick={() => { setEditTarget(p); setFormError(''); }}
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        className="p-1.5 bg-slate-900/80 backdrop-blur text-slate-300 hover:text-red-400 rounded-lg transition-colors"
                        onClick={() => setDeleteTarget(p)}
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="px-4 py-3 border-t border-slate-700/50">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Total Units</p>
                        <p className="text-lg font-bold text-white mt-0.5">{stats.total}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Occupancy</p>
                        <p className="text-lg font-bold text-emerald-400 mt-0.5">{occupancy}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Available</p>
                        <p className="text-lg font-bold text-white mt-0.5">{stats.available}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-slate-700/30 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{stats.occupied} Occupied / {stats.available} Available</span>
                    <span className="text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors flex items-center gap-0.5">
                      Filter Units <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              );
            })}
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