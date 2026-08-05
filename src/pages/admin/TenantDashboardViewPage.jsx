import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Table, Badge, Pagination, Spinner, Alert } from '../../components/common';
import { adminApi } from '../../api/adminApi';

import { useAuth } from '../../context/AuthContext';



const PAGE_SIZE = 10;

export default function TenantDashboardViewPage() {
  const { t } = useTranslation();

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const backUrl = isSuperAdmin ? '/super-admin/view/tenants' : '/admin/tenants';

  const [activeTab, setActiveTab] = useState('leases');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Table state
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadTabData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      let res;
      if (activeTab === 'leases') {
        res = await adminApi.getTenantLeases(id, page, PAGE_SIZE);
      } else if (activeTab === 'payments') {
        res = await adminApi.getTenantPayments(id, page, PAGE_SIZE);
      }
      const data = res?.data?.data;
      setItems(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error(err);
      setItems([]);
      setError(t('common.failedToLoadData', 'Failed to load data.'));
    } finally {
      setLoading(false);
    }
  }, [id, activeTab, page]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  const getColumns = () => {
    if (activeTab === 'leases') {
      return [
        { key: 'propertyName', header: t('nav.properties', 'Property') },
        { key: 'unitNumber', header: t('units.unitNumber', 'Unit') },
        { key: 'monthlyRent', header: t('leases.monthlyRentETB', 'Rent'), render: (r) => `ETB ${Number(r.monthlyRent).toLocaleString()}` },
        { key: 'status', header: t('leases.status', 'Status'), render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
      ];
    }
    if (activeTab === 'payments') {
      return [
        { key: 'propertyName', header: t('nav.properties', 'Property') },
        { key: 'unitNumber', header: t('units.unitNumber', 'Unit') },
        { key: 'paymentMonth', header: t('payments.month', 'Month') },
        { key: 'amount', header: t('payments.amount', 'Amount'), render: (r) => `ETB ${Number(r.amount).toLocaleString()}` },
        { key: 'status', header: t('payments.status', 'Status'), render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
      ];
    }
    return [];
  };

  return (
    <>
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(backUrl)}
        className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
      >
        ← {t('common.backToTenants', 'Back to Tenants')}
      </button>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="flex items-center justify-between mb-6">
        <PageHeader title={t('dashboard.tenantDashboardTitle', 'Tenant Dashboard')} subtitle={t('tenants.tenantId', { id, defaultValue: `Tenant ID: ${id}` })} />
        <div className="bg-amber-500/15 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 shadow-sm">
          {t('common.readOnlyView', 'Read-Only View')}
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-700/50">
        {['leases', 'payments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {t(`nav.${tab}`)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{t(`nav.${activeTab}`)}</h3>
        </div>
        <div className="relative min-h-[200px]">
          {loading ? (
            <div className="absolute inset-0 bg-white/70 dark:bg-[#111827]/70 flex justify-center pt-10 z-10">
              <Spinner size="md" />
            </div>
          ) : null}
          <Table 
            columns={getColumns()} 
            data={items} 
            emptyMessage={t('empty.noRecordsForTab', { tab: t(`nav.${activeTab}`), defaultValue: `No ${activeTab} found.` })} 
          />
        </div>

        <div className="px-4 border-t border-slate-100">
          <Pagination
            page={page}
            totalPages={totalPages}
            size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
}
