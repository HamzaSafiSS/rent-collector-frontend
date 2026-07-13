import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalLayout from '../../components/common/PortalLayout';
import {
  PageHeader, Table, Badge, Button, Modal,
  ConfirmDialog, Alert, Spinner, Input,
} from '../../components/common';
import { propertyApi } from '../../api/propertyApi';
import { unitApi } from '../../api/unitApi';
import { useToast } from '../../context/ToastContext';

const NAV = [
  { label: 'Dashboard',  to: '/landlord/dashboard',  icon: '📊' },
  { label: 'Properties', to: '/landlord/properties', icon: '🏗️' },
  { label: 'Tenants',    to: '/landlord/tenants',    icon: '👥' },
  { label: 'Leases',     to: '/landlord/leases',     icon: '📄' },
  { label: 'Payments',   to: '/landlord/payments',   icon: '💳' },
  { label: 'Reports',    to: '/landlord/reports',    icon: '📈' },
];

export default function PropertyDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const toast     = useToast();

  const [property, setProperty]       = useState(null);
  const [units, setUnits]             = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [error, setError]             = useState('');

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
      setError('Property not found.');
    } finally {
      setLoading(false);
    }
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
    if (!addForm.prefix.trim())                 errs.prefix         = 'Prefix is required.';
    if (!addForm.numberOfUnits)                 errs.numberOfUnits  = 'Number of units is required.';
    else if (Number(addForm.numberOfUnits) < 1) errs.numberOfUnits  = 'Must be at least 1.';
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
      toast.success(`Created ${result?.totalCreated} unit(s).${result?.totalSkipped > 0 ? ` Skipped ${result.totalSkipped} duplicates.` : ''}`);
      setAddUnitsOpen(false);
      setAddForm({ prefix: '', numberOfUnits: '' });
      loadUnits();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create units.');
    } finally { setAddLoading(false); }
  }

  // ── Unit status toggle ─────────────────────────────────────────────────────
  async function handleStatusToggle(unit) {
    try {
      setUnitActionLoading(true);
      if (unit.status === 'AVAILABLE') {
        await unitApi.setMaintenance(id, unit.id);
        toast.success(`${unit.unitNumber} set to MAINTENANCE.`);
      } else if (unit.status === 'MAINTENANCE') {
        await unitApi.setAvailable(id, unit.id);
        toast.success(`${unit.unitNumber} set to AVAILABLE.`);
      } else {
        toast.warning('Cannot change status of an OCCUPIED unit.');
        return;
      }
      loadUnits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change status.');
    } finally { setUnitActionLoading(false); }
  }

  // ── Delete unit ────────────────────────────────────────────────────────────
  async function handleDeleteUnit() {
    try {
      setUnitActionLoading(true);
      await unitApi.deleteUnit(id, deleteUnitTarget.id);
      toast.success(`Unit ${deleteUnitTarget.unitNumber} deleted.`);
      setDeleteUnitTarget(null);
      loadUnits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete unit.');
      setDeleteUnitTarget(null);
    } finally { setUnitActionLoading(false); }
  }

  // ── Rename unit ────────────────────────────────────────────────────────────
  async function handleRename(e) {
    e.preventDefault();
    if (!renameValue.trim()) { setRenameError('Unit number is required.'); return; }
    try {
      setRenameLoading(true); setRenameError('');
      await unitApi.updateUnit(id, renameTarget.id, { unitNumber: renameValue.trim() });
      toast.success('Unit renamed.');
      setRenameTarget(null);
      loadUnits();
    } catch (err) {
      setRenameError(err.response?.data?.message || 'Failed to rename unit.');
    } finally { setRenameLoading(false); }
  }

  // ── Table columns ──────────────────────────────────────────────────────────
  const unitColumns = [
    { key: 'unitNumber', header: 'Unit No.' },
    { key: 'status',     header: 'Status',  render: (r) => <Badge label={r.status} /> },
    {
      key: 'actions', header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => { setRenameTarget(row); setRenameValue(row.unitNumber); setRenameError(''); }}>
            Rename
          </Button>
          {row.status !== 'OCCUPIED' && (
            <Button size="sm" variant="secondary" onClick={() => handleStatusToggle(row)} disabled={unitActionLoading}>
              {row.status === 'AVAILABLE' ? 'Set Maintenance' : 'Set Available'}
            </Button>
          )}
          {row.status === 'AVAILABLE' && (
            <Button size="sm" variant="danger" onClick={() => setDeleteUnitTarget(row)}>Delete</Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return (
    <PortalLayout navItems={NAV} portalLabel="Landlord">
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </PortalLayout>
  );

  if (error) return (
    <PortalLayout navItems={NAV} portalLabel="Landlord">
      <Alert type="error" message={error} />
      <Button className="mt-4" variant="secondary" onClick={() => navigate('/landlord/properties')}>← Back</Button>
    </PortalLayout>
  );

  return (
    <PortalLayout navItems={NAV} portalLabel="Landlord">
      {/* Breadcrumb */}
      <button onClick={() => navigate('/landlord/properties')} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
        ← Back to Properties
      </button>

      <PageHeader
        title={property?.name || ''}
        subtitle={property?.address}
        actions={
          <Button onClick={() => { setAddUnitsOpen(true); setAddForm({ prefix: '', numberOfUnits: '' }); setAddErrors({}); setAddError(''); }}>
            + Add Units
          </Button>
        }
      />

      {/* Property info card */}
      {property?.description && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-sm text-slate-600">
          {property.description}
        </div>
      )}

      {/* Units summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map((s) => {
          const count = units.filter((u) => u.status === s).length;
          const colors = { AVAILABLE: 'green', OCCUPIED: 'blue', MAINTENANCE: 'yellow' };
          return (
            <div key={s} className={`rounded-xl p-4 border text-center ${
              s === 'AVAILABLE'   ? 'bg-green-50  border-green-200  text-green-700'  :
              s === 'OCCUPIED'    ? 'bg-blue-50   border-blue-200   text-blue-700'   :
                                    'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-medium mt-1">{s}</p>
            </div>
          );
        })}
      </div>

      {/* Units table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Units ({totalElements})</h2>
        </div>
        <Table
          columns={unitColumns}
          data={units}
          loading={unitsLoading}
          emptyMessage="No units yet. Click 'Add Units' to create some."
        />
      </div>

      {/* Add Units Modal */}
      <Modal isOpen={addUnitsOpen} onClose={() => setAddUnitsOpen(false)} title="Add Units" footer={null}>
        <form onSubmit={handleAddUnits} className="space-y-4" noValidate>
          {addError && <Alert type="error" message={addError} />}
          <Input
            label="Unit prefix"
            name="prefix"
            value={addForm.prefix}
            onChange={(e) => setAddForm((p) => ({ ...p, prefix: e.target.value }))}
            error={addErrors.prefix}
            placeholder="e.g. A, Block-B, Studio"
            disabled={addLoading}
            hint="Units will be named: prefix-1, prefix-2 ..."
          />
          <Input
            label="Number of units"
            name="numberOfUnits"
            type="number"
            min="1"
            max="500"
            value={addForm.numberOfUnits}
            onChange={(e) => setAddForm((p) => ({ ...p, numberOfUnits: e.target.value }))}
            error={addErrors.numberOfUnits}
            placeholder="e.g. 20"
            disabled={addLoading}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={addLoading}>Create units</Button>
          </div>
        </form>
      </Modal>

      {/* Rename Modal */}
      <Modal isOpen={!!renameTarget} onClose={() => setRenameTarget(null)} title="Rename Unit" footer={null}>
        <form onSubmit={handleRename} className="space-y-4" noValidate>
          <Input
            label="New unit number"
            value={renameValue}
            onChange={(e) => { setRenameValue(e.target.value); setRenameError(''); }}
            error={renameError}
            disabled={renameLoading}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={renameLoading}>Save</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Unit Confirm */}
      <ConfirmDialog
        isOpen={!!deleteUnitTarget}
        onClose={() => setDeleteUnitTarget(null)}
        onConfirm={handleDeleteUnit}
        loading={unitActionLoading}
        title="Delete Unit"
        message={`Delete unit "${deleteUnitTarget?.unitNumber}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </PortalLayout>
  );
}