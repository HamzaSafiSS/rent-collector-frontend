import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, Table, Alert, Pagination, TableSkeleton } from '../../components/common';
import { paymentApi } from '../../api/paymentApi';

const PAGE_SIZE = 10;

export default function DueSoonPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const loadDueSoonTenants = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await paymentApi.getLandlordPayments({ status: 'DUE_SOON', page, size: PAGE_SIZE });
      const data = res.data?.data;
      setTenants(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      setFetchError(t('dueSoon.failedLoad'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    loadDueSoonTenants();
  }, [loadDueSoonTenants]);

  const columns = [
    { key: 'tenantFullName', header: t('leases.tenant'), render: (r) => r.tenantFullName || '—' },
    { key: 'tenantEmail', header: t('leases.email') },
    { key: 'propertyName', header: t('leases.property') },
    { key: 'unitNumber', header: t('units.unit') },
    { key: 'amount', header: t('dueSoon.amountDueETB'), render: (r) => Number(r.amount).toLocaleString() },
  ];

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
      >
        {t('common.back')}
      </button>

      <PageHeader
        title={t('dueSoon.title')}
        subtitle={totalElements !== 1 ? t('dueSoon.subtitle', { count: totalElements }) : t('dueSoon.subtitleSingular', { count: totalElements })}
      />

      {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

      <div className="mb-6">
        {loading ? (
          <TableSkeleton rows={8} cols={columns.length} />
        ) : (
          <Table columns={columns} data={tenants} emptyMessage={t('dueSoon.noTenantsDue')} />
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
  );
}
