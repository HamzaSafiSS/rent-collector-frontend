import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button, Input, Pagination, Alert, Spinner } from '../../components/common';
import AuditLogTable from '../../components/audit/AuditLogTable';
import { auditApi } from '../../api/auditApi';


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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [logs, setLogs]           = useState([]);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    from: '',
    to: ''
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
      setError(t('audit.failedLoadLogs'));
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters, t]);

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
    const empty = { action: '', entityType: '', from: '', to: '' };
    setFilters(empty);
    setAppliedFilters({});
    setPage(0);
  }

  return (
    <>
      <button
        onClick={() => navigate('/super-admin/dashboard')}
        className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
      >
        {t('common.backToDashboard')}
      </button>

      <PageHeader title={t('audit.auditLogsTitle')} subtitle={t('audit.totalEntriesCount', { count: totalElements })} />

      {/* Filters */}
      <form onSubmit={handleApplyFilters} className="bg-[#111827] border border-slate-700/50 rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">{t('audit.action')}</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="bg-[#111827] text-slate-100 w-full px-2 py-1.5 text-sm border border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{a || t('audit.allActions')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">{t('audit.entityType')}</label>
            <select
              name="entityType"
              value={filters.entityType}
              onChange={handleFilterChange}
              className="bg-[#111827] text-slate-100 w-full px-2 py-1.5 text-sm border border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>{type || t('audit.allTypes')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">{t('audit.fromDate')}</label>
            <input
              name="from"
              type="date"
              value={filters.from}
              onChange={handleFilterChange}
              className="bg-[#111827] text-slate-100 w-full px-2 py-1.5 text-sm border border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">{t('audit.toDate')}</label>
            <input
              name="to"
              type="date"
              value={filters.to}
              onChange={handleFilterChange}
              className="bg-[#111827] text-slate-100 w-full px-2 py-1.5 text-sm border border-slate-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <Button type="button" variant="secondary" size="sm" className="w-full" onClick={handleClearFilters}>
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

      <div className="bg-[#111827] rounded-xl border border-slate-700/50 overflow-hidden">
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
    </>
  );
}