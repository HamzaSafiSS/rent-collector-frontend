import { useCallback, useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, Button, Input, Pagination, Alert, Spinner } from '../../components/common';
import AuditLogTable from '../../components/audit/AuditLogTable';
import { auditApi } from '../../api/auditApi';

const NAV = [
  { label: 'Dashboard',     to: '/super-admin/dashboard',  icon: '📊' },
  { label: 'Manage Admins', to: '/super-admin/admins',     icon: '👥' },
  { label: 'Audit Logs',    to: '/super-admin/audit-logs', icon: '📋' },
];

const PAGE_SIZE = 20;

const ACTIONS = [
  '', 'USER_LOGIN', 'USER_LOGOUT', 'PASSWORD_CHANGED', 'TEMP_PASSWORD_ISSUED',
  'PROPERTY_CREATED', 'PROPERTY_UPDATED', 'PROPERTY_DELETED',
  'UNIT_CREATED', 'UNIT_UPDATED', 'UNIT_DELETED', 'UNIT_STATUS_CHANGED',
  'LEASE_CREATED', 'LEASE_TERMINATED',
  'PAYMENT_UPLOADED', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED',
  'LANDLORD_SUSPENDED', 'LANDLORD_ACTIVATED',
  'ADMIN_CREATED', 'ADMIN_UPDATED', 'ADMIN_DELETED',
  'TENANT_CREATED', 'TENANT_UPDATED', 'TENANT_DELETED',
];

const ENTITY_TYPES = ['', 'USER', 'PROPERTY', 'UNIT', 'LEASE', 'PAYMENT', 'TENANT'];

export default function AuditLogPage() {
  const [logs, setLogs]           = useState([]);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [filters, setFilters] = useState({
    action: '', entityType: '', actorId: '', entityId: '', from: '', to: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, size: PAGE_SIZE, ...appliedFilters };
      // Remove empty strings from params
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res  = await auditApi.getAuditLogs(params);
      const data = res.data?.data;
      setLogs(data?.content        || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  }

  function handleApplyFilters(e) {
    e.preventDefault();
    setPage(0);
    setAppliedFilters({ ...filters });
  }

  function handleClearFilters() {
    const empty = { action: '', entityType: '', actorId: '', entityId: '', from: '', to: '' };
    setFilters(empty);
    setAppliedFilters({});
    setPage(0);
  }

  return (
    <PortalLayout navItems={NAV} portalLabel="Super Admin">
      <PageHeader title="Audit Logs" subtitle={`${totalElements} total entries`} />

      {/* Filters */}
      <form onSubmit={handleApplyFilters} className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Action</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{a || 'All actions'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Entity Type</label>
            <select
              name="entityType"
              value={filters.entityType}
              onChange={handleFilterChange}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>{t || 'All types'}</option>
              ))}
            </select>
          </div>

          <Input label="Actor ID"   name="actorId"   type="number" value={filters.actorId}   onChange={handleFilterChange} placeholder="e.g. 2" />
          <Input label="Entity ID"  name="entityId"  type="number" value={filters.entityId}  onChange={handleFilterChange} placeholder="e.g. 5" />
          <Input label="From date"  name="from"      type="date"   value={filters.from}       onChange={handleFilterChange} />
          <Input label="To date"    name="to"        type="date"   value={filters.to}         onChange={handleFilterChange} />
        </div>

        <div className="flex gap-2 mt-3 justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={handleClearFilters}>
            Clear
          </Button>
          <Button type="submit" size="sm">
            Apply filters
          </Button>
        </div>
      </form>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <AuditLogTable data={logs} loading={loading} />
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
    </PortalLayout>
  );
}