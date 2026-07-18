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
  { label: 'Dashboard',     to: '/super-admin/dashboard',  icon: '📊' },
  { label: 'Manage Admins', to: '/super-admin/admins',     icon: '👥' },
  { label: 'Audit Logs',    to: '/super-admin/audit-logs', icon: '📋' },
];

const PAGE_SIZE = 10;

/* ─── Category config ──────────────────────────────────────────────────────── */
const CATEGORIES = {
  admins: {
    title: 'All Admins',
    icon: '👤',
    fetchList: (page) => adminApi.listAdmins(page, PAGE_SIZE),
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
    // (or return all and filter, depending on the API)
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
      { key: 'description', header: 'Description', render: (r) => r.description ? (r.description.length > 50 ? r.description.slice(0, 50) + '…' : r.description) : '—' },
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
    title: 'Active Leases',
    icon: '📄',
    fetchList: (page) => leaseApi.listLeases(page, PAGE_SIZE, 'ACTIVE'),
    columns: [
      { key: 'id',              header: 'ID' },
      { key: 'tenantFullName',  header: 'Tenant',   render: (r) => r.tenantFullName || '—' },
      { key: 'tenantEmail',     header: 'Email',    render: (r) => <span className="text-xs">{r.tenantEmail || '—'}</span> },
      { key: 'unitNumber',      header: 'Unit' },
      { key: 'propertyName',    header: 'Property' },
      { key: 'monthlyRent',     header: 'Rent (ETB)', render: (r) => Number(r.monthlyRent).toLocaleString() },
      { key: 'startDate',       header: 'Start Date' },
      { key: 'status',          header: 'Status',   render: (r) => <Badge label={r.status} /> },
    ],
    detailFields: [
      { label: 'Lease ID',       key: 'id' },
      { label: 'Tenant',         key: 'tenantFullName' },
      { label: 'Tenant Email',   key: 'tenantEmail' },
      { label: 'Unit',           key: 'unitNumber' },
      { label: 'Property',       key: 'propertyName' },
      { label: 'Monthly Rent',   key: 'monthlyRent', currency: true },
      { label: 'Start Date',     key: 'startDate' },
      { label: 'End Date',       key: 'endDate' },
      { label: 'Status',         key: 'status', badge: true },
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
export default function ViewListPage() {
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

  const loadData = useCallback(async () => {
    if (!config) return;
    try {
      setLoading(true);
      setError('');
      const res  = await config.fetchList(page);
      const data = res.data?.data;
      let content = data?.content || [];

      // Apply client-side filter if defined (e.g. suspended landlords)
      if (config.filterFn) {
        content = config.filterFn(content);
      }

      setItems(content);
      setTotalPages(config.filterFn ? 1 : (data?.totalPages || 0));
      setTotalElements(config.filterFn ? content.length : (data?.totalElements || 0));
    } catch {
      setError(`Failed to load ${config?.title || 'data'}.`);
    } finally {
      setLoading(false);
    }
  }, [page, config]);

  useEffect(() => { loadData(); }, [loadData]);

  // If invalid category, show error
  if (!config) {
    return (
      <PortalLayout navItems={NAV} portalLabel="Super Admin">
        <Alert type="error" message="Invalid category." />
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/super-admin/dashboard')}>
          ← Back to Dashboard
        </Button>
      </PortalLayout>
    );
  }

  // Add a "View" action column to the table
  const columnsWithView = [
    ...config.columns,
    {
      key: '_view',
      header: '',
      render: (row) => (
        <Button size="sm" variant="ghost" onClick={() => setSelectedItem(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <PortalLayout navItems={NAV} portalLabel="Super Admin">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/super-admin/dashboard')}
        className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
      >
        ← Back to Dashboard
      </button>

      <PageHeader
        title={config.title}
        subtitle={`${totalElements} record${totalElements !== 1 ? 's' : ''}`}
      />

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
