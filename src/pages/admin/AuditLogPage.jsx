import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    } catch { setError(t('audit.failedLoadLogs')); }
    finally  { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, applied, user?.email]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  return (
    <>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
      >
        {t('common.backToDashboard')}
      </button>

      <PageHeader title={t('audit.auditLogsTitle')} subtitle={t('audit.entriesCount', { count: totalElements })} />

      <form
        onSubmit={(e) => { e.preventDefault(); setPage(0); setApplied({ ...filters }); }}
        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 mb-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('audit.action')}</label>
            <select
              name="action"
              value={filters.action}
              onChange={(e) => setFilters((p) => ({ ...p, action: e.target.value }))}
              className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{a ? t(`audit.action_${a}`) : t('audit.allActions')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('audit.entityType')}</label>
            <select
              name="entityType"
              value={filters.entityType}
              onChange={(e) => setFilters((p) => ({ ...p, entityType: e.target.value }))}
              className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>{type ? t(`audit.type_${type}`) : t('audit.allTypes')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('audit.fromDate')}</label>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
              className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('audit.toDate')}</label>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
              className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <Button type="button" variant="secondary" size="sm" className="w-full" onClick={() => { setFilters({ action:'', entityType:'', from:'', to:'' }); setApplied({}); setPage(0); }}>
              {t('audit.clearFilters')}
            </Button>
          </div>
          <div>
            <Button type="submit" size="sm" className="w-full">
              {t('audit.applyFilters')}
            </Button>
          </div>
        </div>
      </form>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <AuditLogTable data={logs} loading={loading} page={page} pageSize={PAGE_SIZE} />
        <div className="px-4 border-t border-slate-100">
          <Pagination page={page} totalPages={totalPages} totalElements={totalElements} size={PAGE_SIZE} onPageChange={setPage} />
        </div>
      </div>
    </>
  );
}