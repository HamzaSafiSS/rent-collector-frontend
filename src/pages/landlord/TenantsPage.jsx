import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  PageHeader,
  Alert, Pagination, TableSkeleton,
} from '../../components/common';
import TenantTable from '../../components/tenant/TenantTable';
import PropertySelector from '../../components/property/PropertySelector';
import { tenantApi } from '../../api/tenantApi';

const PAGE_SIZE = 10;

export default function TenantsPage() {
  const { t } = useTranslation();

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

  const [tenants, setTenants]         = useState([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

  const loadTenants = useCallback(async () => {
    if (!selectedProperty) return;
    try {
      setLoading(true);
      setFetchError('');
      const res  = await tenantApi.listTenants(page, PAGE_SIZE, selectedProperty.id);
      const data = res.data?.data;
      setTenants(data?.content          || []);
      setTotalPages(data?.totalPages    || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setFetchError(t('tenants.failedLoadTenants'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedProperty]);

  useEffect(() => { loadTenants(); }, [loadTenants, selectedProperty]);

  const filteredTenants = tenants.filter(t => {
    if (statusFilter && (!t.status || !t.status.toLowerCase().includes(statusFilter.toLowerCase()))) return false;
    if (monthFilter || yearFilter) {
      const d = t.moveInDate || t.createdAt;
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

  return (
    <>
      {!selectedProperty ? (
        <>
          <PageHeader
            title={t('common.selectProperty')}
            subtitle={t('tenants.selectPropertyTenants')}
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
            title={t('tenants.tenantsTitle', { name: selectedProperty.name })}
            subtitle={totalElements !== 1 ? t('tenants.tenantCount', { count: totalElements }) : t('tenants.tenantCountSingular', { count: totalElements })}
          />

          <div className="mb-4 flex flex-wrap gap-4 items-center bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('common.filters')}</div>
            <select 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); }}
              className="bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 text-sm border border-slate-300 dark:border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50"
            >
              <option value="">{t('common.allStatuses')}</option>
              <option value="Active">{t('common.statusActive')}</option>
              <option value="Suspended">{t('common.statusSuspended')}</option>
              <option value="Pending">{t('common.statusPending')}</option>
              <option value="PendingPasswordChange">{t('common.statusPendingpasswordchange', { defaultValue: 'Pending Password Change' })}</option>
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
              <TableSkeleton rows={8} cols={6} />
            ) : (
              <TenantTable data={filteredTenants} />
            )}
          </div>
          {tenants.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Pagination
                page={page} totalPages={totalPages}
                totalElements={totalElements} size={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}