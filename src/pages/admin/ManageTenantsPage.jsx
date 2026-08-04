import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, Table, Badge, Pagination, Alert, Button } from '../../components/common';
import { tenantApi } from '../../api/tenantApi';
import useCalendarDate from '../../hooks/useCalendarDate';

const PAGE_SIZE = 10;

export default function ManageTenantsPage() {
  const { t } = useTranslation();
  const { formatDate } = useCalendarDate();
  const navigate = useNavigate();
  const location = useLocation();
  const [tenants, setTenants]         = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const COLUMNS = [
    { key: 'fullName',    header: t('tenants.name') },
    { key: 'email',       header: t('tenants.email') },
    { key: 'phoneNumber', header: t('tenants.phone'),      render: (r) => r.phoneNumber || '—' },
    { key: 'status',      header: t('tenants.status'),     render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
    { key: 'unitNumber',  header: t('admin.currentUnit'),render: (r) => r.unitNumber || '—' },
    { key: 'moveInDate',  header: t('leases.startDateCol'),    render: (r) => r.moveInDate ? formatDate(r.moveInDate) : '—' },
    { 
      key: 'actions', 
      header: t('common.actions'),
      render: (r) => (
        <Button size="sm" variant="primary" onClick={() => navigate(`/admin/view/tenant-dashboard/${r.id}`, { state: { from: location.pathname + location.search } })}>
          {t('admin.viewDashboard')}
        </Button>
      )
    }
  ];

  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res  = await tenantApi.listAllTenants(page, PAGE_SIZE);
      const data = res.data?.data;
      setTenants(data?.content          || []);
      setTotalPages(data?.totalPages    || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setError(t('tenants.failedLoadTenants'));
    } finally {
      setLoading(false);
    }
  }, [page, t]);

  useEffect(() => { loadTenants(); }, [loadTenants]);

  return (
    <>
      <PageHeader
        title={t('admin.manageTenantsTitle')}
        subtitle={totalElements !== 1 ? t('admin.tenantsCount', { count: totalElements }) : t('admin.tenantsCountSingular', { count: totalElements })}
      />

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="bg-[#111827] rounded-xl border border-slate-700/50 overflow-hidden">
        <Table columns={COLUMNS} data={tenants} loading={loading} emptyMessage={t('admin.noTenantsFound')} />
        <div className="px-4 border-t border-slate-100">
          <Pagination
            page={page} totalPages={totalPages}
            totalElements={totalElements} size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
}