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

          {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

          <div className="mb-6">
            {loading ? (
              <TableSkeleton rows={8} cols={6} />
            ) : (
              <TenantTable data={tenants} />
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