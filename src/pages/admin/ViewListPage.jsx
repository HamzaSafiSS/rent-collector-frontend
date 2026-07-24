import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalLayout from '../../components/common/PortalLayout';
import {
  PageHeader, Table, Badge, Pagination, Alert, Modal, Button, Spinner,
} from '../../components/common';
import { adminApi } from '../../api/adminApi';
import { tenantApi } from '../../api/tenantApi';
import { propertyApi } from '../../api/propertyApi';
import { leaseApi } from '../../api/leaseApi';
import { paymentApi } from '../../api/paymentApi';
import { reportApi } from '../../api/reportApi';
import { unitApi } from '../../api/unitApi';
import { TableSkeleton } from '../../components/common';

const NAV = [
  { label: 'Dashboard',  to: '/admin/dashboard',  icon: '📊' },
  { label: 'Landlords',  to: '/admin/landlords',  icon: '🏢' },
  { label: 'Tenants',    to: '/admin/tenants',    icon: '👥' },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: '📋' },
];

const PAGE_SIZE = 10;

/* ─── Category config ──────────────────────────────────────────────────────── */
const CATEGORIES = {
  landlords: {
    title: 'All Landlords',
    icon: '🏢',
    fetchList: (page) => adminApi.listLandlords(page, PAGE_SIZE),
    columns: [
      { key: 'fullName',    header: 'Name' },
      { key: 'email',       header: 'Email' },
      { key: 'phoneNumber', header: 'Phone',   render: (r) => r.phoneNumber || '—' },
      { key: 'status',      header: 'Status',  render: (r) => <Badge label={r.status} /> },
      { key: 'createdAt',   header: 'Joined',  render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
    ],
    detailFields: [
      { label: 'Full Name',    key: 'fullName' },
      { label: 'Email',        key: 'email' },
      { label: 'Phone',        key: 'phoneNumber' },
      { label: 'Status',       key: 'status', badge: true },
      { label: 'Created',      key: 'createdAt', date: true },
    ],
  },

  'suspended-landlords': {
    title: 'Suspended Landlords',
    icon: '🚫',
    fetchList: (page) => adminApi.listLandlords(page, PAGE_SIZE),
    // We'll filter to only show suspended ones client-side 
    filterFn: (items) => items.filter((l) => l.status === 'Suspended'),
    columns: [
      { key: 'fullName',    header: 'Name' },
      { key: 'email',       header: 'Email' },
      { key: 'phoneNumber', header: 'Phone',   render: (r) => r.phoneNumber || '—' },
      { key: 'status',      header: 'Status',  render: (r) => <Badge label={r.status} /> },
      { key: 'createdAt',   header: 'Joined',  render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
    ],
    detailFields: [
      { label: 'Full Name',    key: 'fullName' },
      { label: 'Email',        key: 'email' },
      { label: 'Phone',        key: 'phoneNumber' },
      { label: 'Status',       key: 'status', badge: true },
      { label: 'Created',      key: 'createdAt', date: true },
    ],
  },

  tenants: {
    title: 'All Tenants',
    icon: '👨‍👩‍👧',
    fetchList: (page) => tenantApi.listAllTenants(page, PAGE_SIZE),
    columns: [
      { key: 'fullName',    header: 'Name' },
      { key: 'email',       header: 'Email' },
      { key: 'phoneNumber', header: 'Phone',      render: (r) => r.phoneNumber || '—' },
      { key: 'status',      header: 'Status',     render: (r) => <Badge label={r.status} /> },
      { key: 'unitNumber',  header: 'Current Unit',render: (r) => r.unitNumber || '—' },
      { key: 'moveInDate',  header: 'Move-in',    render: (r) => r.moveInDate || '—' },
    ],
    detailFields: [
      { label: 'Full Name',      key: 'fullName' },
      { label: 'Email',          key: 'email' },
      { label: 'Phone',          key: 'phoneNumber' },
      { label: 'Status',         key: 'status', badge: true },
      { label: 'Current Unit',   key: 'unitNumber' },
      { label: 'Move-in Date',   key: 'moveInDate' },
      { label: 'Active Leases',  key: 'activeLeaseCount' },
    ],
  },

  properties: {
    title: 'All Properties',
    icon: '🏗️',
    fetchList: (page) => propertyApi.listAllProperties(page, PAGE_SIZE),
    columns: [
      { key: 'name',        header: 'Name' },
      { key: 'address',     header: 'Address' },
      { key: 'createdAt',   header: 'Created At',  render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
      { key: 'landlordName',header: 'Landlord',    render: (r) => r.landlordName || r.landlordFullName || '—' },
    ],
    detailFields: [
      { label: 'Property Name',  key: 'name' },
      { label: 'Address',        key: 'address' },
      { label: 'Description',    key: 'description' },
      { label: 'Landlord',       key: 'landlordName', fallbackKey: 'landlordFullName' },
      { label: 'Created',        key: 'createdAt', date: true },
    ],
  },

  units: {
    title: 'All Units',
    icon: '🚪',
    fetchList: async (page) => {
      // Units require loading all properties first, then their units
      const propRes = await propertyApi.listAllProperties(0, 200);
      const properties = propRes.data?.data?.content || [];
      const unitPromises = properties.map(async (p) => {
        try {
          const uRes = await unitApi.listUnits(p.id, 0, 200);
          const propertyUnits = uRes.data?.data?.content || [];
          return propertyUnits.map(u => ({ ...u, propertyName: p.name, landlordName: p.landlordName || p.landlordFullName || '—' }));
        } catch {
          return [];
        }
      });
      const allUnits = (await Promise.all(unitPromises)).flat();
      // Simulate paginated response
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
      { key: 'unitNumber',   header: 'Unit No.' },
      { key: 'propertyName', header: 'Property' },
      { key: 'status',       header: 'Status',   render: (r) => <Badge label={r.status} /> },
      { key: 'baseRent',     header: 'Base Rent', render: (r) => r.baseRent ? `ETB ${Number(r.baseRent).toLocaleString()}` : '—' },
      { key: 'landlordName', header: 'Landlord' },
    ],
    detailFields: [
      { label: 'Unit Number',    key: 'unitNumber' },
      { label: 'Property',       key: 'propertyName' },
      { label: 'Status',         key: 'status', badge: true },
      { label: 'Base Rent',      key: 'baseRent', currency: true },
      { label: 'Landlord',       key: 'landlordName' },
    ],
  },
  leases: {
    title: 'All Leases',
    icon: '📄',
    fetchList: (page) => adminApi.listAllLeases(page, PAGE_SIZE),
    columns: [
      { key: 'tenantFullName', header: 'Tenant', render: (r) => r.tenantFullName || r.tenantEmail || '—' },
      { key: 'propertyName',   header: 'Property' },
      { key: 'unitNumber',     header: 'Unit' },
      { key: 'monthlyRent',    header: 'Rent',   render: (r) => `ETB ${Number(r.monthlyRent).toLocaleString()}` },
      { key: 'status',         header: 'Status', render: (r) => <Badge label={r.status} /> },
    ],
    detailFields: [
      { label: 'Tenant Name',  key: 'tenantFullName' },
      { label: 'Tenant Email', key: 'tenantEmail' },
      { label: 'Property',     key: 'propertyName' },
      { label: 'Unit',         key: 'unitNumber' },
      { label: 'Rent',         key: 'monthlyRent', currency: true },
      { label: 'Status',       key: 'status', badge: true },
      { label: 'Start Date',   key: 'startDate', date: true },
    ],
  },
};

/* ─── Detail Value Renderer ────────────────────────────────────────────────── */
function DetailValue({ field, item }) {
  const value = item[field.key] ?? (field.fallbackKey ? item[field.fallbackKey] : null);
  if (value === null || value === undefined || value === '') return <span className="text-slate-400">—</span>;
  if (field.badge) return <Badge label={value} />;
  if (field.date) return <span>{new Date(value).toLocaleDateString()}</span>;
  if (field.currency) return <span>ETB {Number(value).toLocaleString()}</span>;
  return <span>{value}</span>;
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function AdminViewListPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const config = CATEGORIES[category];

  const [items, setItems]               = useState([]);
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // Detail modal
  const [selectedItem, setSelectedItem] = useState(null);

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
      <PortalLayout navItems={NAV} portalLabel="Admin">
        <Alert type="error" message="Invalid category." />
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/admin/dashboard')}>
          ← Back to Dashboard
        </Button>
      </PortalLayout>
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
            <Button size="sm" variant="primary" onClick={() => navigate(path)}>
              View Dashboard
            </Button>
          );
        }
        
        return (
          <Button size="sm" variant="ghost" onClick={() => setSelectedItem(row)}>
            View
          </Button>
        );
      },
    },
  ];

  return (
    <PortalLayout navItems={NAV} portalLabel="Admin">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
      >
        ← Back to Dashboard
      </button>

      <PageHeader
        title={config.title}
        subtitle={`${totalElements} record${totalElements !== 1 ? 's' : ''}`}
      />

      <div className="mb-4 flex flex-wrap gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="text-sm font-medium text-slate-600">Filters:</div>
        {category !== 'properties' && (
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {category === 'units' ? (
              <>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </>
            ) : category === 'leases' ? (
              <>
                <option value="ACTIVE">Active</option>
                <option value="TERMINATED">Terminated</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            ) : (
              <>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </>
            )}
          </select>
        )}
        {!['properties', 'landlords', 'suspended-landlords', 'tenants'].includes(category) ? (
          <input 
            type="date" 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
          />
        ) : (
          <>
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
            >
              <option value="">All Months</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <input
              type="number"
              placeholder="Year"
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 w-24"
            />
          </>
        )}
        {(statusFilter || dateFilter || monthFilter || yearFilter) && (
          <button 
            onClick={() => { setStatusFilter(''); setDateFilter(''); setMonthFilter(''); setYearFilter(''); }}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={columnsWithView.length} />
        ) : (
          <Table columns={columnsWithView} data={items} emptyMessage="No records found." />
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
        title={`${config.icon} ${config.title.replace(/^All\s/, '')} Details`}
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
                <span className="text-sm font-medium text-slate-800 text-right max-w-[60%] break-words">
                  <DetailValue field={field} item={selectedItem} />
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </PortalLayout>
  );
}
