import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  PageHeader, Table, Badge, Button, Modal,
  ConfirmDialog, Alert, Pagination, Spinner,
} from '../../components/common';
import LeaseAgreementForm from '../../components/lease/LeaseAgreementForm';
import PropertySelector from '../../components/property/PropertySelector';
import DocumentViewer from '../../components/lease/DocumentViewer';
import { leaseApi } from '../../api/leaseApi';
import { unitApi } from '../../api/unitApi';
import { useToast } from '../../context/ToastContext';
import useCalendarDate from '../../hooks/useCalendarDate';

const PAGE_SIZE = 10;

export default function LeasesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { formatDate } = useCalendarDate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const restoredPropertyId = searchParams.get('propertyId');
  const page = Number(searchParams.get('page')) || 0;
  const setPage = (pg) => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('page', String(pg)); return p; }, { replace: true });
  const statusFilter = searchParams.get('status') || '';
  const monthFilter  = searchParams.get('month') || '';
  const yearFilter   = searchParams.get('year') || '';

  const setStatusFilter = (s) => setSearchParams(prev => { const p = new URLSearchParams(prev); if (s) p.set('status', s); else p.delete('status'); p.delete('page'); return p; }, { replace: true });
  const setMonthFilter  = (m) => setSearchParams(prev => { const p = new URLSearchParams(prev); if (m) p.set('month', m); else p.delete('month'); p.delete('page'); return p; }, { replace: true });
  const setYearFilter   = (y) => setSearchParams(prev => { const p = new URLSearchParams(prev); if (y) p.set('year', y); else p.delete('year'); p.delete('page'); return p; }, { replace: true });

  const handleSelectProperty = (p) => {
    setSelectedProperty(p);
    setSearchParams({ propertyId: String(p.id) }, { replace: true });
  };

  const handleBack = () => {
    setSelectedProperty(null);
    setSearchParams({}, { replace: true });
  };

  const [leases, setLeases]           = useState([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, selectedProperty]);

  useEffect(() => { loadLeases(); }, [loadLeases, selectedProperty]);

  const filteredLeases = leases.filter(l => {
    if (monthFilter || yearFilter) {
      const d = l.startDate || l.createdAt;
      if (!d) return false;
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return false;
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const y = String(dateObj.getFullYear());
      if (monthFilter && m !== monthFilter) return false;
      if (yearFilter && y !== yearFilter) return false;
    }
    return true;
  });

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

  async function handleCreate(payload, agreementDocument) {
    try {
      setFormLoading(true);
      setFormError('');
      const res = await leaseApi.createLease(payload, agreementDocument);
      const msg = res.data?.message || t('leases.leaseCreated');
      toast.success(msg);
      setCreateOpen(false);
      loadLeases();
    } catch (err) {
      let errMsg = err.response?.data?.message || t('leases.failedCreateLease');
      if (errMsg.includes('already exists') && errMsg.includes('tenant account')) {
        const match = errMsg.match(/email '([^']+)'/);
        const email = match ? match[1] : payload.tenantEmail;
        errMsg = t('errors.accountNotTenant', { email });
      }
      setFormError(errMsg);
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
    { key: '_no',           header: t('common.noCol', 'No.'), render: (_, idx) => (page * PAGE_SIZE) + idx + 1 },
    { key: 'tenantFullName',header: t('leases.tenant'),     render: (r) => r.tenantFullName || '—' },
    { key: 'tenantEmail',   header: t('leases.email'),      render: (r) => <span className="text-xs">{r.tenantEmail || '—'}</span> },
    { key: 'unitNumber',    header: t('units.unit') },
    { key: 'propertyName',  header: t('leases.property') },
    { key: 'monthlyRent',   header: t('leases.rentETB'), render: (r) => Number(r.monthlyRent).toLocaleString() },
    { key: 'startDate',     header: t('leases.startDateCol'), render: (r) => r.startDate ? formatDate(r.startDate) : '—' },
    { key: 'status',        header: t('leases.status'),     render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
    {
      key: 'document', header: t('leases.document'),
      render: (r) => r.agreementDocumentUrl ? (
        <DocumentViewer leaseId={r.id} documentUrl={r.agreementDocumentUrl} />
      ) : '—'
    },
    {
      key: 'actions', header: t('common.actions'),
      render: (row) => (row.status === 'ACTIVE' || row.status === 'PENDING') ? (
        <Button size="sm" variant="danger" onClick={() => setTerminateTarget(row)}>
          {t('leases.terminate')}
        </Button>
      ) : <span className="text-xs text-slate-400">{row.status ? t(`common.status${row.status.charAt(0) + row.status.slice(1).toLowerCase()}`, { defaultValue: row.status }) : '—'}</span>,
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
          <PropertySelector onSelect={handleSelectProperty} restoredPropertyId={restoredPropertyId} />
        </>
      ) : (
        <>
          <button 
            onClick={handleBack} 
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

          <div className="mb-4 flex flex-wrap gap-4 items-center bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('common.filters')}</div>
            <select 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); }}
              className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50"
            >
              <option value="">{t('common.allStatuses')}</option>
              <option value="ACTIVE">{t('common.statusActive')}</option>
              <option value="PENDING">{t('common.statusPending')}</option>
              <option value="REJECTED">{t('common.statusRejected')}</option>
              <option value="TERMINATED">{t('common.statusTerminated')}</option>
              <option value="CANCELLED">{t('common.statusCancelled')}</option>
            </select>
            <select
              value={monthFilter}
              onChange={e => { setMonthFilter(e.target.value); }}
              className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50"
            >
              <option value="">{t('common.allMonths')}</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
                const val = String(m).padStart(2, '0');
                return <option key={val} value={val}>{t(`common.month${val}`)}</option>;
              })}
            </select>
            <input
              type="number"
              placeholder={t('common.yearPlaceholder')}
              value={yearFilter}
              onChange={e => { setYearFilter(e.target.value); }}
              className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50 w-24"
            />
            {(statusFilter || monthFilter || yearFilter) && (
              <button 
                onClick={() => {
                  setSearchParams(prev => {
                    const p = new URLSearchParams(prev);
                    p.delete('status');
                    p.delete('month');
                    p.delete('year');
                    p.delete('page');
                    return p;
                  }, { replace: true });
                }}
                className="text-sm text-emerald-400 hover:underline"
              >
                {t('common.clear')}
              </button>
            )}
          </div>

          {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

          <div className="mb-6">
            {loading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : (
              <Table columns={columns} data={filteredLeases} emptyMessage={t('leases.noLeasesFound')} />
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
        size="xl"
        footer={null}
      >
        <LeaseAgreementForm
          units={availableUnits}
          totalUnits={totalUnits}
          onSubmit={handleCreate}
          loading={formLoading}
          error={formError}
          onClearError={() => setFormError('')}
          property={selectedProperty}
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