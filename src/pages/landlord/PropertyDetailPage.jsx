import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PageHeader, Table, Badge, Button, Modal,
  ConfirmDialog, Alert, Spinner, Input,
} from '../../components/common';
import { propertyApi } from '../../api/propertyApi';
import { unitApi } from '../../api/unitApi';
import { useToast } from '../../context/ToastContext';

export default function PropertyDetailPage() {
  const { t }       = useTranslation();
  const { id }    = useParams();
  const navigate  = useNavigate();
  const toast     = useToast();

  const [property, setProperty]       = useState(null);
  const [units, setUnits]             = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [error, setError]             = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const filterStatus = searchParams.get('status') || 'ALL';

  // Add units modal
  const [addUnitsOpen, setAddUnitsOpen]  = useState(false);
  const [addForm, setAddForm]            = useState({ prefix: '', numberOfUnits: '' });
  const [addErrors, setAddErrors]        = useState({});
  const [addLoading, setAddLoading]      = useState(false);
  const [addError, setAddError]          = useState('');

  // Unit actions
  const [deleteUnitTarget, setDeleteUnitTarget]   = useState(null);
  const [unitActionLoading, setUnitActionLoading] = useState(false);

  // Rename unit modal
  const [renameTarget, setRenameTarget]   = useState(null);
  const [renameValue, setRenameValue]     = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError]     = useState('');

  const loadProperty = useCallback(async () => {
    try {
      setLoading(true);
      const res = await propertyApi.getPropertyDetail(id);
      setProperty(res.data?.data);
    } catch {
      setError(t('properties.propertyNotFound'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const loadUnits = useCallback(async () => {
    try {
      setUnitsLoading(true);
      const res  = await unitApi.listUnits(id, 0, 200);
      const data = res.data?.data;
      setUnits(data?.content || []);
      setTotalElements(data?.totalElements || 0);
    } catch {} finally { setUnitsLoading(false); }
  }, [id]);

  useEffect(() => { loadProperty(); loadUnits(); }, [loadProperty, loadUnits]);

  // ── Add Units ──────────────────────────────────────────────────────────────
  function validateAddForm() {
    const errs = {};
    if (!addForm.prefix.trim())                 errs.prefix         = t('validation.prefixRequired');
    if (!addForm.numberOfUnits)                 errs.numberOfUnits  = t('validation.numberOfUnitsRequired');
    else if (Number(addForm.numberOfUnits) < 1) errs.numberOfUnits  = t('validation.mustBeAtLeastOne');
    return errs;
  }

  async function handleAddUnits(e) {
    e.preventDefault();
    const errs = validateAddForm();
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return; }
    try {
      setAddLoading(true); setAddError('');
      const res = await unitApi.createUnits(id, {
        prefix: addForm.prefix.trim(),
        numberOfUnits: Number(addForm.numberOfUnits),
      });
      const result = res.data?.data;
      toast.success(
        t('units.createdUnits', { created: result?.totalCreated }) +
        (result?.totalSkipped > 0 ? t('units.skippedDuplicates', { skipped: result.totalSkipped }) : '')
      );
      setAddUnitsOpen(false);
      setAddForm({ prefix: '', numberOfUnits: '' });
      loadUnits();
    } catch (err) {
      setAddError(err.response?.data?.message || t('units.failedCreateUnits'));
    } finally { setAddLoading(false); }
  }

  // ── Unit status toggle ─────────────────────────────────────────────────────
  async function handleStatusToggle(unit) {
    try {
      setUnitActionLoading(true);
      if (unit.status === 'AVAILABLE') {
        await unitApi.setMaintenance(id, unit.id);
        toast.success(t('units.setToMaintenance', { name: unit.unitNumber }));
      } else if (unit.status === 'MAINTENANCE') {
        await unitApi.setAvailable(id, unit.id);
        toast.success(t('units.setToAvailable', { name: unit.unitNumber }));
      } else {
        toast.warning(t('units.cannotChangeOccupied'));
        return;
      }
      loadUnits();
    } catch (err) {
      toast.error(err.response?.data?.message || t('units.failedChangeStatus'));
    } finally { setUnitActionLoading(false); }
  }

  // ── Delete unit ────────────────────────────────────────────────────────────
  async function handleDeleteUnit() {
    try {
      setUnitActionLoading(true);
      await unitApi.deleteUnit(id, deleteUnitTarget.id);
      toast.success(t('units.unitDeleted', { name: deleteUnitTarget.unitNumber }));
      setDeleteUnitTarget(null);
      loadUnits();
    } catch (err) {
      toast.error(err.response?.data?.message || t('units.cannotDeleteUnit'));
      setDeleteUnitTarget(null);
    } finally { setUnitActionLoading(false); }
  }

  // ── Rename unit ────────────────────────────────────────────────────────────
  async function handleRename(e) {
    e.preventDefault();
    if (!renameValue.trim()) { setRenameError(t('validation.unitNumberRequired')); return; }
    try {
      setRenameLoading(true); setRenameError('');
      await unitApi.updateUnit(id, renameTarget.id, { unitNumber: renameValue.trim() });
      toast.success(t('units.unitRenamed'));
      setRenameTarget(null);
      loadUnits();
    } catch (err) {
      setRenameError(err.response?.data?.message || t('units.failedRenameUnit'));
    } finally { setRenameLoading(false); }
  }

  // ── Table columns ──────────────────────────────────────────────────────────
  const unitColumns = [
    { key: 'unitNumber', header: t('units.unitNo') },
    { key: 'status',     header: t('units.status'),  render: (r) => <Badge label={r.status} /> },
    {
      key: 'actions', header: t('common.actions'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => { setRenameTarget(row); setRenameValue(row.unitNumber); setRenameError(''); }}>
            {t('units.rename')}
          </Button>
          {row.status !== 'OCCUPIED' && (
            <Button size="sm" variant="secondary" onClick={() => handleStatusToggle(row)} disabled={unitActionLoading}>
              {row.status === 'AVAILABLE' ? t('units.setMaintenance') : t('units.setAvailable')}
            </Button>
          )}
          {row.status === 'AVAILABLE' && (
            <Button size="sm" variant="danger" onClick={() => setDeleteUnitTarget(row)}>{t('common.delete')}</Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return (
    <>
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </>
  );

  if (error) return (
    <>
      <Alert type="error" message={error} />
      <Button className="mt-4" variant="secondary" onClick={() => navigate('/landlord/properties')}>{t('common.back')}</Button>
    </>
  );

  return (
    <>
      {/* Breadcrumb */}
      <button onClick={() => navigate('/landlord/properties')} className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1">
        {t('common.backToProperties')}
      </button>

      <PageHeader
        title={property?.name || ''}
        subtitle={property?.address}
        actions={
          <Button onClick={() => { setAddUnitsOpen(true); setAddForm({ prefix: '', numberOfUnits: '' }); setAddErrors({}); setAddError(''); }}>
            {t('units.addUnitsBtn')}
          </Button>
        }
      />

      {/* Property info card */}
      {property?.description && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-5 text-sm text-slate-400">
          {property.description}
        </div>
      )}

      {/* Units summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        {['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map((s) => {
          const count = s === 'ALL' ? units.length : units.filter((u) => u.status === s).length;
          const isSelected = filterStatus === s;
          const labelText = s === 'ALL' ? t('common.all') : t(`dashboard.${s.toLowerCase()}Units`, { defaultValue: s });
          return (
            <div 
              key={s} 
              onClick={() => setSearchParams(s === 'ALL' ? {} : { status: s })}
              className={`rounded-2xl p-6 border text-center shadow-sm relative overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 ${
              isSelected ? 'ring-2 ring-emerald-500 shadow-md' : ''
            } ${
              s === 'AVAILABLE'   ? 'bg-[#111827] border-emerald-500/20'  :
              s === 'OCCUPIED'    ? 'bg-[#111827] border-sky-500/20'   :
              s === 'MAINTENANCE' ? 'bg-[#111827] border-amber-500/20'  :
                                    'bg-[#111827] border-slate-700/50'
            }`}>
              <div className={`absolute inset-0 opacity-10 ${
                s === 'AVAILABLE' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                s === 'OCCUPIED'  ? 'bg-gradient-to-br from-sky-400 to-blue-600' :
                s === 'MAINTENANCE' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                                    'bg-gradient-to-br from-slate-400 to-slate-600'
              }`}></div>
              <p className={`text-3xl font-extrabold relative z-10 ${
                s === 'AVAILABLE' ? 'text-emerald-400' :
                s === 'OCCUPIED'  ? 'text-sky-400' :
                s === 'MAINTENANCE' ? 'text-amber-400' :
                                    'text-slate-200'
              }`}>{count}</p>
              <p className="text-xs font-bold mt-2 uppercase tracking-wider text-slate-500 relative z-10">{labelText}</p>
            </div>
          );
        })}
      </div>

      {/* Units table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100">{filterStatus === 'ALL' ? t('units.allUnits') : filterStatus} <span className="text-slate-500 font-medium text-base ml-1">({units.filter((u) => filterStatus === 'ALL' || u.status === filterStatus).length})</span></h2>
        </div>
        <Table
          columns={unitColumns}
          data={units.filter((u) => filterStatus === 'ALL' || u.status === filterStatus)}
          loading={unitsLoading}
          emptyMessage={t('common.noResultsFilter')}
        />
      </div>

      {/* Add Units Modal */}
      <Modal isOpen={addUnitsOpen} onClose={() => setAddUnitsOpen(false)} title={t('units.addUnitsTitle')} footer={null}>
        <form onSubmit={handleAddUnits} className="space-y-4" noValidate>
          {addError && <Alert type="error" message={addError} />}
          <Input
            label={t('units.unitPrefixLabel')}
            name="prefix"
            value={addForm.prefix}
            onChange={(e) => setAddForm((p) => ({ ...p, prefix: e.target.value }))}
            error={addErrors.prefix}
            placeholder={t('units.unitPrefixPlaceholder')}
            disabled={addLoading}
            hint={t('units.unitPrefixHint')}
            required
          />
          <Input
            label={t('units.numberOfUnitsLabel')}
            name="numberOfUnits"
            type="number"
            min="1"
            max="500"
            value={addForm.numberOfUnits}
            onChange={(e) => setAddForm((p) => ({ ...p, numberOfUnits: e.target.value }))}
            error={addErrors.numberOfUnits}
            placeholder={t('units.numberOfUnitsPlaceholder')}
            disabled={addLoading}
            required
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={addLoading}>{t('units.createUnitsBtn')}</Button>
          </div>
        </form>
      </Modal>

      {/* Rename Modal */}
      <Modal isOpen={!!renameTarget} onClose={() => setRenameTarget(null)} title={t('units.renameUnitTitle')} footer={null}>
        <form onSubmit={handleRename} className="space-y-4" noValidate>
          <Input
            label={t('units.newUnitNumberLabel')}
            value={renameValue}
            onChange={(e) => { setRenameValue(e.target.value); setRenameError(''); }}
            error={renameError}
            disabled={renameLoading}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" loading={renameLoading}>{t('common.save')}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Unit Confirm */}
      <ConfirmDialog
        isOpen={!!deleteUnitTarget}
        onClose={() => setDeleteUnitTarget(null)}
        onConfirm={handleDeleteUnit}
        loading={unitActionLoading}
        title={t('units.deleteUnitTitle')}
        message={t('units.deleteUnitMessage', { name: deleteUnitTarget?.unitNumber })}
        confirmText={t('common.delete')}
        variant="danger"
      />
    </>
  );
}