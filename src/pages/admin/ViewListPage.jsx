import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PageHeader, Table, Badge, Pagination, Alert, Modal, Button, Spinner, ConfirmDialog,
} from '../../components/common';
import { useToast } from '../../context/ToastContext';
import { adminApi } from '../../api/adminApi';
import { tenantApi } from '../../api/tenantApi';
import { propertyApi } from '../../api/propertyApi';
import { leaseApi } from '../../api/leaseApi';
import { paymentApi } from '../../api/paymentApi';
import { reportApi } from '../../api/reportApi';
import { unitApi } from '../../api/unitApi';
import { TableSkeleton } from '../../components/common';
import useCalendarDate from '../../hooks/useCalendarDate';

const PAGE_SIZE = 10;

/* ─── Category config ──────────────────────────────────────────────────────── */
const getCategories = (t, formatDate, page = 0) => ({
  landlords: {
    title: t('admin.manageLandlordsTitle'),
    icon: '🏢',
    fetchList: (page) => adminApi.listLandlords(page, PAGE_SIZE),
    columns: [
      { key: '_no',         header: t('common.noCol', 'No.'), render: (_, idx) => (page * PAGE_SIZE) + idx + 1 },
      { key: 'fullName',    header: t('admin.name') },
      { key: 'email',       header: t('admin.email') },
      { key: 'phoneNumber', header: t('payments.phone'),   render: (r) => r.phoneNumber || '—' },
      { key: 'status',      header: t('admin.status'),  render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
      { key: 'createdAt',   header: t('admin.joined'),  render: (r) => r.createdAt ? formatDate(r.createdAt) : '—' },
    ],
    detailFields: [
      { label: t('admin.name'),    key: 'fullName' },
      { label: t('admin.email'),        key: 'email' },
      { label: t('payments.phone'),        key: 'phoneNumber' },
      { label: t('admin.status'),       key: 'status', badge: true },
      { label: t('admin.joined'),       key: 'createdAt', date: true },
    ],
  },

  'suspended-landlords': {
    title: t('superAdmin.suspendedLandlordsTitle', 'Suspended Landlords'),
    icon: '🚫',
    fetchList: (page) => adminApi.listLandlords(page, PAGE_SIZE),
    filterFn: (items) => items.filter((l) => l.status === 'Suspended'),
    columns: [
      { key: '_no',         header: t('common.noCol', 'No.'), render: (_, idx) => (page * PAGE_SIZE) + idx + 1 },
      { key: 'fullName',    header: t('admin.name') },
      { key: 'email',       header: t('admin.email') },
      { key: 'phoneNumber', header: t('payments.phone'),   render: (r) => r.phoneNumber || '—' },
      { key: 'status',      header: t('admin.status'),  render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
      { key: 'createdAt',   header: t('admin.joined'),  render: (r) => r.createdAt ? formatDate(r.createdAt) : '—' },
    ],
    detailFields: [
      { label: t('admin.name'),    key: 'fullName' },
      { label: t('admin.email'),        key: 'email' },
      { label: t('payments.phone'),        key: 'phoneNumber' },
      { label: t('admin.status'),       key: 'status', badge: true },
      { label: t('admin.joined'),       key: 'createdAt', date: true },
    ],
  },

  tenants: {
    title: t('admin.manageTenantsTitle'),
    icon: '👥',
    fetchList: (page) => tenantApi.listAllTenants(page, PAGE_SIZE),
    columns: [
      { key: '_no',         header: t('common.noCol', 'No.'), render: (_, idx) => (page * PAGE_SIZE) + idx + 1 },
      { key: 'fullName',    header: t('tenants.name') },
      { key: 'email',       header: t('tenants.email') },
      { key: 'phoneNumber', header: t('payments.phone'),   render: (r) => r.phoneNumber || '—' },
      { key: 'status',      header: t('tenants.status'),  render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
      { key: 'moveInDate',  header: t('leases.startDateCol'), render: (r) => r.moveInDate ? formatDate(r.moveInDate) : '—' },
    ],
    detailFields: [
      { label: t('tenants.name'),    key: 'fullName' },
      { label: t('tenants.email'),        key: 'email' },
      { label: t('payments.phone'),        key: 'phoneNumber' },
      { label: t('tenants.status'),       key: 'status', badge: true },
      { label: t('leases.startDateCol'),   key: 'moveInDate', date: true },
    ],
  },

  properties: {
    title: t('dashboard.totalProperties'),
    icon: '🏠',
    fetchList: (page) => propertyApi.listAllProperties(page, PAGE_SIZE),
    columns: [
      { key: '_no',          header: t('common.noCol', 'No.'), render: (_, idx) => (page * PAGE_SIZE) + idx + 1 },
      { key: 'name',         header: t('nav.properties') },
      { key: 'address',      header: t('properties.address', 'Address') },
      { key: 'city',         header: t('properties.city', 'City') },
      { key: 'totalUnits',   header: t('properties.totalUnits', 'Total Units') },
      { key: 'occupiedUnits',header: t('properties.occupied', 'Occupied') },
      { key: 'landlordName', header: t('nav.landlords') },
    ],
    detailFields: [
      { label: t('nav.properties'),       key: 'name' },
      { label: t('properties.address', 'Address'),    key: 'address' },
      { label: t('properties.city', 'City'),       key: 'city' },
      { label: t('properties.totalUnits', 'Total Units'), key: 'totalUnits' },
      { label: t('properties.occupied', 'Occupied'),   key: 'occupiedUnits' },
      { label: t('nav.landlords'),       key: 'landlordName' },
    ],
  },

  units: {
    title: t('dashboard.totalUnits'),
    icon: '🚪',
    fetchList: async (page) => {
      const propRes = await propertyApi.listAllProperties(0, 1000);
      const props = propRes.data?.data?.content || [];
      const unitPromises = props.map(async (p) => {
        try {
          const res = await unitApi.listUnits(p.id, 0, 500);
          const raw = res.data?.data;
          const units = Array.isArray(raw) ? raw : (raw?.content || []);
          return units.map((u) => ({
            ...u,
            propertyName: p.name,
            landlordName: p.landlordName,
          }));
        } catch {
          return [];
        }
      });
      const allUnits = (await Promise.all(unitPromises)).flat();
      const start = page * PAGE_SIZE;
      const content = allUnits.slice(start, start + PAGE_SIZE);
      return {
        data: {
          data: {
            content,
            totalPages: Math.ceil(allUnits.length / PAGE_SIZE),
            totalElements: allUnits.length,
          },
        },
      };
    },
    columns: [
      { key: '_no',          header: t('common.noCol', 'No.'), render: (_, idx) => (page * PAGE_SIZE) + idx + 1 },
      { key: 'unitNumber',   header: t('units.unitNumber', 'Unit No.') },
      { key: 'propertyName', header: t('nav.properties') },
      { key: 'status',       header: t('units.status', 'Status'),   render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
      { key: 'landlordName', header: t('nav.landlords') },
    ],
    detailFields: [
      { label: t('units.unitNumber', 'Unit No.'),    key: 'unitNumber' },
      { label: t('nav.properties'),       key: 'propertyName' },
      { label: t('units.status', 'Status'),         key: 'status', badge: true },
      { label: t('nav.landlords'),       key: 'landlordName' },
    ],
  },
  leases: {
    title: t('dashboard.totalLeases'),
    icon: '📄',
    fetchList: (page) => adminApi.listAllLeases(page, PAGE_SIZE),
    columns: [
      { key: '_no',            header: t('common.noCol', 'No.'), render: (_, idx) => (page * PAGE_SIZE) + idx + 1 },
      { key: 'tenantFullName', header: t('nav.tenants'), render: (r) => r.tenantFullName || r.tenantEmail || '—' },
      { key: 'propertyName',   header: t('nav.properties') },
      { key: 'unitNumber',     header: t('units.unitNumber', 'Unit') },
      { key: 'monthlyRent',    header: t('leases.monthlyRentETB', 'Rent'),   render: (r) => `ETB ${Number(r.monthlyRent).toLocaleString()}` },
      { key: 'status',         header: t('leases.status', 'Status'), render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
      { key: 'startDate',      header: t('leases.startDateCol', 'Start Date'), render: (r) => r.startDate ? formatDate(r.startDate) : '—' },
    ],
    detailFields: [
      { label: t('nav.tenants'),        key: 'tenantFullName', fallbackKey: 'tenantEmail' },
      { label: t('nav.properties'),     key: 'propertyName' },
      { label: t('units.unitNumber', 'Unit'),         key: 'unitNumber' },
      { label: t('leases.monthlyRentETB', 'Rent'),         key: 'monthlyRent', currency: true },
      { label: t('leases.status', 'Status'),       key: 'status', badge: true },
      { label: t('leases.startDate', 'Start Date'),   key: 'startDate', date: true },
    ],
  },
});

/* ─── Detail Value Renderer ────────────────────────────────────────────────── */
function DetailValue({ field, item, formatDate, t }) {
  const value = item[field.key] ?? (field.fallbackKey ? item[field.fallbackKey] : null);
  if (value === null || value === undefined || value === '') return <span className="text-slate-500 dark:text-slate-400">—</span>;
  if (field.badge) return <Badge statusKey={value} label={value ? t(`common.status${value.charAt(0) + value.slice(1).toLowerCase()}`, { defaultValue: value }) : ''} />;
  if (field.date) return <span>{formatDate ? formatDate(value) : new Date(value).toLocaleDateString()}</span>;
  if (field.currency) return <span>ETB {Number(value).toLocaleString()}</span>;
  return <span>{value}</span>;
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function AdminViewListPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { formatDate } = useCalendarDate();

  const [page, setPage]                 = useState(0);
  const config = React.useMemo(() => getCategories(t, formatDate, page)[category], [t, category, formatDate, page]);

  const [items, setItems]               = useState([]);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // Detail modal
  const [selectedItem, setSelectedItem] = useState(null);

  const toast = useToast();
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function handleConfirmAction() {
    if (!confirmTarget) return;
    const { item, action } = confirmTarget;
    try {
      setActionLoading(true);
      if (action === 'suspend') {
        await adminApi.suspendLandlord(item.id);
        toast.success(t('admin.landlordSuspended', { name: item.fullName }));
      } else {
        await adminApi.activateLandlord(item.id);
        toast.success(t('admin.landlordActivated', { name: item.fullName }));
      }
      setConfirmTarget(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  }

  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter]     = useState('');
  const [monthFilter, setMonthFilter]   = useState('');
  const [yearFilter, setYearFilter]     = useState('');

  const loadData = useCallback(async () => {
    if (!config) return;
    try {
      setLoading(true);
      setError('');
      const res  = await config.fetchList(page);
      const data = res.data?.data;
      let content = data?.content || [];

      if (config.filterFn) {
        content = config.filterFn(content);
      }

      if (statusFilter) {
        content = content.filter(l => l.status && l.status.toLowerCase().includes(statusFilter.toLowerCase()));
      }
      if (dateFilter) {
        content = content.filter(l => {
          const d = l.createdAt || l.moveInDate || l.startDate;
          if (!d) return false;
          return String(d).startsWith(dateFilter);
        });
      }
      if (monthFilter || yearFilter) {
        content = content.filter(l => {
          const d = l.createdAt || l.moveInDate || l.startDate;
          if (!d) return false;
          const dateObj = new Date(d);
          if (isNaN(dateObj.getTime())) return false;
          
          const m = String(dateObj.getMonth() + 1).padStart(2, '0');
          const y = String(dateObj.getFullYear());
          
          let match = true;
          if (monthFilter && m !== monthFilter) match = false;
          if (yearFilter && y !== yearFilter) match = false;
          return match;
        });
      }

      setItems(content);
      setTotalPages(config.filterFn ? 1 : (data?.totalPages || 0));
      setTotalElements(config.filterFn ? content.length : (data?.totalElements || 0));
    } catch {
      setError(`Failed to load ${config?.title || 'data'}.`);
    } finally {
      setLoading(false);
    }
  }, [page, config, category, statusFilter, dateFilter, monthFilter, yearFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  if (!config) {
    return (
      <>
        <Alert type="error" message="Invalid category." />
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/admin/dashboard')}>
          ← Back to Dashboard
        </Button>
      </>
    );
  }

  const columnsWithView = [
    ...config.columns,
    {
      key: '_view',
      header: '',
      render: (row) => {
        const pathMap = {
          'landlords': `/admin/view/landlord-dashboard/${row.id}`,
          'suspended-landlords': `/admin/view/landlord-dashboard/${row.id}`,
          'tenants': `/admin/view/tenant-dashboard/${row.id}`,
          'properties': `/admin/view/property-dashboard/${row.id}`,
          'units': `/admin/view/unit-dashboard/${row.id}`,
          'leases': `/admin/view/lease-dashboard/${row.id}`
        };
        const path = pathMap[category];
        
        if (path) {
          return (
            <div className="flex gap-2">
              {(category === 'landlords' || category === 'suspended-landlords') && (
                <Button
                  size="sm"
                  variant={row.status === 'Suspended' ? 'success' : 'secondary'}
                  onClick={() => setConfirmTarget({
                    item: row,
                    action: row.status === 'Suspended' ? 'activate' : 'suspend',
                  })}
                >
                  {row.status === 'Suspended' ? t('admin.activate') : t('admin.suspend')}
                </Button>
              )}
              <Button size="sm" variant="primary" onClick={() => navigate(path, { state: { from: location.pathname + location.search } })}>
                {t('admin.viewDashboard')}
              </Button>
            </div>
          );
        }
        
        return (
          <Button size="sm" variant="ghost" onClick={() => setSelectedItem(row)}>
            {t('common.view')}
          </Button>
        );
      },
    },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
      >
        {t('common.backToDashboard')}
      </button>

      <PageHeader
        title={config.title}
        subtitle={totalElements !== 1 ? t('common.records', { count: totalElements }) : t('common.recordsSingular', { count: totalElements })}
      />

      <div className="mb-4 flex flex-wrap gap-4 items-center bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('common.filters')}</div>
        {category !== 'properties' && (
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50"
          >
            <option value="">{t('common.allStatuses')}</option>
            {category === 'units' ? (
              <>
                <option value="AVAILABLE">{t('common.statusAvailable')}</option>
                <option value="OCCUPIED">{t('common.statusOccupied')}</option>
                <option value="MAINTENANCE">{t('common.statusMaintenance')}</option>
              </>
            ) : category === 'leases' ? (
              <>
                <option value="ACTIVE">{t('common.statusActive')}</option>
                <option value="TERMINATED">{t('common.statusTerminated')}</option>
                <option value="CANCELLED">{t('common.statusCancelled')}</option>
              </>
            ) : (
              <>
                <option value="Active">{t('common.statusActive')}</option>
                <option value="Suspended">{t('common.statusSuspended')}</option>
                <option value="Pending">{t('common.statusPending')}</option>
              </>
            )}
          </select>
        )}
        <>
          <select
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
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
            onChange={e => setYearFilter(e.target.value)}
            className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50 w-24"
          />
        </>
        {(statusFilter || dateFilter || monthFilter || yearFilter) && (
          <button 
            onClick={() => { setStatusFilter(''); setDateFilter(''); setMonthFilter(''); setYearFilter(''); }}
            className="text-sm text-emerald-400 hover:underline"
          >
            {t('common.clear')}
          </button>
        )}
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={columnsWithView.length} />
        ) : (
          <Table columns={columnsWithView} data={items} emptyMessage={t('empty.searchTitle')} />
        )}
        <div className="px-4 border-t border-slate-100">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* ── View-only Detail Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={`${config.icon} ${config.title}`}
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-1">
            {config.detailFields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between py-3 px-1 border-b border-slate-100 last:border-0"
              >
                <span className="text-sm font-semibold text-slate-500">{field.label}</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100 text-right max-w-[60%] break-words">
                  <DetailValue field={field} item={selectedItem} formatDate={formatDate} t={t} />
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmAction}
        loading={actionLoading}
        title={confirmTarget?.action === 'suspend' ? t('admin.suspendLandlordTitle') : t('admin.activateLandlordTitle')}
        message={
          confirmTarget?.action === 'suspend'
            ? t('admin.suspendLandlordMsg', { name: confirmTarget?.item?.fullName })
            : t('admin.activateLandlordMsg', { name: confirmTarget?.item?.fullName })
        }
        confirmText={confirmTarget?.action === 'suspend' ? t('admin.suspend') : t('admin.activate')}
        variant={confirmTarget?.action === 'suspend' ? 'danger' : 'success'}
      />
    </>
  );
}
