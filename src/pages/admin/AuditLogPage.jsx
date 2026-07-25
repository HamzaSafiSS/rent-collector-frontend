import { useCallback, useEffect, useState } from 'react';
import { PageHeader, Button, Input, Pagination, Alert } from '../../components/common';
import AuditLogTable from '../../components/audit/AuditLogTable';
import { auditApi } from '../../api/auditApi';
import { useAuth } from '../../context/AuthContext';

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


const PAGE_SIZE = 20;

export default function AdminAuditLog() {
  const { user } = useAuth();
  const [logs, setLogs]                 = useState([]);
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filters, setFilters]           = useState({ action: '', entityType: '', from: '', to: '' });
  const [applied, setApplied]           = useState({});

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, size: PAGE_SIZE, ...applied };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res  = await auditApi.getAuditLogs(params);
      const data = res.data?.data;
      
      const content = data?.content || [];
      const filtered = content.filter((log) => {
        if (log.actorRole === 'SUPER_ADMIN') return false;
        if (log.actorRole === 'ADMIN' && log.actorEmail !== user?.email) return false;
        return true;
      });

      setLogs(filtered);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch { setError('Failed to load audit logs.'); }
    finally  { setLoading(false); }
  }, [page, applied, user?.email]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  return (
    <>
      <PageHeader title="Audit Logs" subtitle={`${totalElements} entries`} />

      <form
        onSubmit={(e) => { e.preventDefault(); setPage(0); setApplied({ ...filters }); }}
        className="bg-white border border-slate-200 rounded-xl p-4 mb-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Action</label>
            <select
              name="action"
              value={filters.action}
              onChange={(e) => setFilters((p) => ({ ...p, action: e.target.value }))}
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
              onChange={(e) => setFilters((p) => ({ ...p, entityType: e.target.value }))}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>{t || 'All types'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">From Date</label>
            <input
              name="from"
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">To Date</label>
            <input
              name="to"
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Button type="button" variant="secondary" size="sm" className="w-full" onClick={() => { setFilters({ action:'', entityType:'', from:'', to:'' }); setApplied({}); setPage(0); }}>
              Clear Filters
            </Button>
          </div>
          <div>
            <Button type="submit" size="sm" className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </form>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <AuditLogTable data={logs} loading={loading} />
        <div className="px-4 border-t border-slate-100">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} size={PAGE_SIZE} onPageChange={setPage} />
        </div>
      </div>
    </>
  );
}