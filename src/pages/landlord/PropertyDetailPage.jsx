import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PageHeader, Table, Badge, Button, Modal,
  ConfirmDialog, Alert, Spinner, Input,
} from '../../components/common';
import { propertyApi } from '../../api/propertyApi';
import { unitApi } from '../../api/unitApi';
import { leaseApi } from '../../api/leaseApi';
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

  // View Unit modal
  const [viewUnitTarget, setViewUnitTarget]   = useState(null);
  const [viewUnitTenant, setViewUnitTenant]   = useState(null);
  const [viewUnitLoading, setViewUnitLoading] = useState(false);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  // ── View Unit ──────────────────────────────────────────────────────────────
  async function handleViewUnit(unit) {
    setViewUnitTarget(unit);
    setViewUnitTenant(null);

    if (unit.status === 'OCCUPIED') {
      setViewUnitLoading(true);
      try {
        const res = await leaseApi.listLeases(0, 50, 'ACTIVE', id);
        const leases = res.data?.data?.content || [];
        const unitLease = leases.find(l => l.unitId === unit.id);
        if (unitLease) {
          setViewUnitTenant(unitLease.tenantFullName || unitLease.tenantEmail || null);
        }
      } catch {
        // tenant info unavailable
      } finally { setViewUnitLoading(false); }
    }
  }

  // ── Table columns ──────────────────────────────────────────────────────────
  const unitColumns = [
    { key: 'propertyName', header: t('units.property'), render: () => <span className="font-medium text-slate-700 dark:text-slate-300">{property?.name}</span> },
    { key: 'unitNumber', header: t('units.unit'), render: (r) => <span className="font-bold text-slate-900 dark:text-slate-100">{r.unitNumber}</span> },
    { key: 'status',     header: t('units.status'),  render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
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
          <Button size="sm" variant="secondary" onClick={() => handleViewUnit(row)}>
            {t('common.viewUnit')}
          </Button>
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

      {/* Units filter bar */}
      <div className="mb-4 flex flex-wrap gap-4 items-center bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('common.filters')}</div>
        <select 
          value={filterStatus} 
          onChange={e => setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            if (e.target.value && e.target.value !== 'ALL') p.set('status', e.target.value);
            else p.delete('status');
            return p;
          })}
          className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50"
        >
          <option value="ALL">{t('common.allStatuses')}</option>
          <option value="AVAILABLE">{t('common.statusAvailable')}</option>
          <option value="OCCUPIED">{t('common.statusOccupied')}</option>
          <option value="MAINTENANCE">{t('common.statusMaintenance')}</option>
        </select>
        {filterStatus && filterStatus !== 'ALL' && (
          <button 
            onClick={() => setSearchParams({})}
            className="text-sm text-emerald-400 hover:underline"
          >
            {t('common.clear')}
          </button>
        )}
      </div>

      {/* Units table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {filterStatus === 'ALL' ? t('units.allUnits') : t(`common.status${filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()}`, { defaultValue: filterStatus })} 
            <span className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">({units.filter((u) => filterStatus === 'ALL' || u.status === filterStatus).length})</span>
          </h2>
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

      {/* View Unit Modal */}
      <Modal isOpen={!!viewUnitTarget} onClose={() => setViewUnitTarget(null)} title={t('units.unitDetails')} footer={null}>
        {viewUnitTarget && (
          <div className="space-y-5">
            {/* Tenant row — only shown if unit is OCCUPIED */}
            {viewUnitTarget.status === 'OCCUPIED' && (
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700/50">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('units.tenant')}</span>
                {viewUnitLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {viewUnitTenant || t('units.noTenant')}
                  </span>
                )}
              </div>
            )}

            {/* Property row */}
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700/50">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('units.property')}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{property?.name}</span>
            </div>

            {/* Status row */}
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('units.status')}</span>
              <Badge statusKey={viewUnitTarget.status} label={viewUnitTarget.status ? t(`common.status${viewUnitTarget.status.charAt(0) + viewUnitTarget.status.slice(1).toLowerCase()}`, { defaultValue: viewUnitTarget.status }) : ''} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}