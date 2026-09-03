import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PageHeader, Table, Badge, Button, Spinner,
  Modal, ConfirmDialog, Input,
} from '../../components/common';
import { propertyApi } from '../../api/propertyApi';
import { unitApi } from '../../api/unitApi';
import { leaseApi } from '../../api/leaseApi';
import { useToast } from '../../context/ToastContext';

export default function GlobalUnitsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterStatus = searchParams.get('status') || 'ALL';

  const [units, setUnits]     = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Unit actions
  const [unitActionLoading, setUnitActionLoading] = useState(false);

  // Rename modal
  const [renameTarget, setRenameTarget]   = useState(null);
  const [renameValue, setRenameValue]     = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError]     = useState('');

  // Delete confirm
  const [deleteUnitTarget, setDeleteUnitTarget] = useState(null);

  // View Unit modal
  const [viewUnitTarget, setViewUnitTarget]   = useState(null);
  const [viewUnitTenant, setViewUnitTenant]   = useState(null);
  const [viewUnitLoading, setViewUnitLoading] = useState(false);

  const loadAllUnits = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch properties
      const propRes = await propertyApi.listMyProperties(0, 100);
      const props = propRes.data?.data?.content || [];
      setProperties(props);

      // Fetch units for each property
      const unitPromises = props.map(async (p) => {
        try {
          const uRes = await unitApi.listUnits(p.id, 0, 200);
          const propertyUnits = uRes.data?.data?.content || [];
          return propertyUnits.map(u => ({ ...u, propertyName: p.name, propertyId: p.id }));
        } catch {
          return [];
        }
      });

      const unitsArrays = await Promise.all(unitPromises);
      setUnits(unitsArrays.flat());
    } catch (err) {
      setError(t('units.failedLoadGlobalUnits'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { loadAllUnits(); }, [loadAllUnits]);

  // ── Unit status toggle ─────────────────────────────────────────────────────
  async function handleStatusToggle(unit) {
    try {
      setUnitActionLoading(true);
      if (unit.status === 'AVAILABLE') {
        await unitApi.setMaintenance(unit.propertyId, unit.id);
        toast.success(t('units.setToMaintenance', { name: unit.unitNumber }));
      } else if (unit.status === 'MAINTENANCE') {
        await unitApi.setAvailable(unit.propertyId, unit.id);
        toast.success(t('units.setToAvailable', { name: unit.unitNumber }));
      } else {
        toast.warning(t('units.cannotChangeOccupied'));
        return;
      }
      loadAllUnits();
    } catch (err) {
      toast.error(err.response?.data?.message || t('units.failedChangeStatus'));
    } finally { setUnitActionLoading(false); }
  }

  // ── Delete unit ────────────────────────────────────────────────────────────
  async function handleDeleteUnit() {
    try {
      setUnitActionLoading(true);
      await unitApi.deleteUnit(deleteUnitTarget.propertyId, deleteUnitTarget.id);
      toast.success(t('units.unitDeleted', { name: deleteUnitTarget.unitNumber }));
      setDeleteUnitTarget(null);
      loadAllUnits();
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
      await unitApi.updateUnit(renameTarget.propertyId, renameTarget.id, { unitNumber: renameValue.trim() });
      toast.success(t('units.unitRenamed'));
      setRenameTarget(null);
      loadAllUnits();
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
        const res = await leaseApi.listLeases(0, 50, 'ACTIVE', unit.propertyId);
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
  const columns = [
    { key: 'propertyName', header: t('units.property'), render: (r) => <span className="font-medium text-slate-700 dark:text-slate-300">{r.propertyName}</span> },
    { key: 'unitNumber',   header: t('units.unit'),     render: (r) => <span className="font-bold text-slate-900 dark:text-slate-100">{r.unitNumber}</span> },
    { key: 'status',       header: t('units.status'),   render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
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
    }
  ];

  const propertyFilter = searchParams.get('propertyId') || '';
  const setPropertyFilter = (propId) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (propId) p.set('propertyId', propId);
      else p.delete('propertyId');
      return p;
    });
  };

  const filteredUnits = units.filter(u => {
    if (filterStatus !== 'ALL' && filterStatus && u.status !== filterStatus) return false;
    if (propertyFilter && String(u.propertyId) !== String(propertyFilter)) return false;
    return true;
  });

  return (
    <>
      <PageHeader title={t('units.globalUnitsTitle')} />

      {error && <div className="mb-4 text-red-400 bg-red-500/10 p-4 rounded-xl">{error}</div>}

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
        {properties.length > 0 && (
          <select
            value={propertyFilter}
            onChange={e => setPropertyFilter(e.target.value)}
            className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50"
          >
            <option value="">{t('properties.allProperties', 'All Properties')}</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        {((filterStatus && filterStatus !== 'ALL') || propertyFilter) && (
          <button 
            onClick={() => setSearchParams({})}
            className="text-sm text-emerald-400 hover:underline"
          >
            {t('common.clear')}
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {filterStatus === 'ALL' ? t('units.allUnits') : t(`common.status${filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()}`, { defaultValue: filterStatus })} 
            <span className="text-slate-500 dark:text-slate-400 font-medium text-base ml-1">({filteredUnits.length})</span>
          </h2>
        </div>
        <Table
          columns={columns}
          data={filteredUnits}
          loading={loading}
          emptyMessage={t('common.noResultsFilter')}
        />
      </div>

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
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{viewUnitTarget.propertyName}</span>
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
