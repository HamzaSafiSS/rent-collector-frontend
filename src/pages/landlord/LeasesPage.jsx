import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageHeader, Table, Badge, Button, Modal,
  ConfirmDialog, Alert, Pagination,
} from '../../components/common';
import LeaseForm from '../../components/lease/LeaseForm';
import PropertySelector from '../../components/property/PropertySelector';
import { leaseApi } from '../../api/leaseApi';
import { unitApi } from '../../api/unitApi';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/common';
import useCalendarDate from '../../hooks/useCalendarDate';

const PAGE_SIZE = 10;

export default function LeasesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { formatDate } = useCalendarDate();

  const [selectedProperty, setSelectedProperty] = useState(null);

  const [leases, setLeases]           = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

  const [statusFilter, setStatusFilter] = useState('');

  // Create lease
  const [createOpen, setCreateOpen]   = useState(false);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [totalUnits, setTotalUnits]   = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]     = useState('');

  // Terminate
  const [terminateTarget, setTerminateTarget] = useState(null);
  const [termLoading, setTermLoading] = useState(false);

  const loadLeases = useCallback(async () => {
    if (!selectedProperty) return;
    try {
      setLoading(true);
      setFetchError('');
      const res  = await leaseApi.listLeases(page, PAGE_SIZE, statusFilter || null, selectedProperty.id);
      const data = res.data?.data;
      setLeases(data?.content          || []);
      setTotalPages(data?.totalPages   || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setFetchError(t('leases.failedLoadLeases'));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, selectedProperty, t]);

  useEffect(() => { loadLeases(); }, [loadLeases, selectedProperty]);

  // Load available units for the create form
  async function openCreateModal() {
    if (!selectedProperty) return;
    setFormError('');
    setCreateOpen(true);
    try {
      // Fetch available units for the currently selected property
      const res = await unitApi.listUnits(selectedProperty.id, 0, 200);
      const units = res.data?.data?.content || [];
      setTotalUnits(units.length);
      const available = units.filter((u) => u.status === 'AVAILABLE');
      setAvailableUnits(available);
    } catch {
      setAvailableUnits([]);
      setTotalUnits(0);
    }
  }

  async function handleCreate(payload) {
    try {
      setFormLoading(true);
      setFormError('');
      const res = await leaseApi.createLease(payload);
      const msg = res.data?.message || t('leases.leaseCreated');
      toast.success(msg);
      setCreateOpen(false);
      loadLeases();
    } catch (err) {
      setFormError(err.response?.data?.message || t('leases.failedCreateLease'));
    } finally {
      setFormLoading(false);
    }
  }

  async function handleTerminate() {
    try {
      setTermLoading(true);
      await leaseApi.terminateLease(terminateTarget.id, null);
      toast.success(t('leases.leaseTerminated'));
      setTerminateTarget(null);
      loadLeases();
    } catch (err) {
      toast.error(err.response?.data?.message || t('leases.failedTerminateLease'));
      setTerminateTarget(null);
    } finally {
      setTermLoading(false);
    }
  }

  const columns = [
    { key: 'id',            header: t('leases.id') },
    { key: 'tenantFullName',header: t('leases.tenant'),     render: (r) => r.tenantFullName || '—' },
    { key: 'tenantEmail',   header: t('leases.email'),      render: (r) => <span className="text-xs">{r.tenantEmail || '—'}</span> },
    { key: 'unitNumber',    header: t('units.unit') },
    { key: 'propertyName',  header: t('leases.property') },
    { key: 'monthlyRent',   header: t('leases.rentETB'), render: (r) => Number(r.monthlyRent).toLocaleString() },
    { key: 'startDate',     header: t('leases.startDateCol'), render: (r) => r.startDate ? formatDate(r.startDate) : '—' },
    { key: 'status',        header: t('leases.status'),     render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
    {
      key: 'actions', header: t('common.actions'),
      render: (row) => row.status === 'ACTIVE' ? (
        <Button size="sm" variant="danger" onClick={() => setTerminateTarget(row)}>
          {t('leases.terminate')}
        </Button>
      ) : <span className="text-xs text-slate-400">{t('leases.terminated')}</span>,
    },
  ];

  return (
    <>
      {!selectedProperty ? (
        <>
          <PageHeader
            title={t('common.selectProperty')}
            subtitle={t('leases.selectPropertyLeases')}
          />
          <PropertySelector onSelect={(p) => { setSelectedProperty(p); setPage(0); setStatusFilter(''); }} />
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
            title={t('leases.leasesTitle', { name: selectedProperty.name })}
            subtitle={totalElements !== 1 ? t('leases.leaseCount', { count: totalElements }) : t('leases.leaseCountSingular', { count: totalElements })}
            actions={
              <Button onClick={openCreateModal}>{t('leases.newLease')}</Button>
            }
          />

      {/* Status filter */}
      <div className="flex gap-2 mb-4">
        {['', 'ACTIVE', 'TERMINATED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              statusFilter === s
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {s ? (s === 'ACTIVE' ? t('leases.active') : t('leases.terminated')) : t('common.all')}
          </button>
        ))}
      </div>

      {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

      <div className="mb-6">
        {loading ? (
          <TableSkeleton rows={8} cols={columns.length} />
        ) : (
          <Table columns={columns} data={leases} emptyMessage={t('leases.noLeasesFound')} />
        )}
      </div>
      {leases.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Pagination
            page={page} totalPages={totalPages}
            totalElements={totalElements} size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('leases.createNewLease')}
        size="lg"
        footer={null}
      >
        <LeaseForm
          units={availableUnits}
          totalUnits={totalUnits}
          onSubmit={handleCreate}
          loading={formLoading}
          error={formError}
        />
      </Modal>

      {/* Terminate Confirm */}
      <ConfirmDialog
        isOpen={!!terminateTarget}
        onClose={() => setTerminateTarget(null)}
        onConfirm={handleTerminate}
        loading={termLoading}
        title={t('leases.terminateLeaseTitle')}
        message={t('leases.terminateLeaseMessage', { tenant: terminateTarget?.tenantFullName, unit: terminateTarget?.unitNumber })}
        confirmText={t('leases.terminate')}
        variant="danger"
      />
        </>
      )}
    </>
  );
}