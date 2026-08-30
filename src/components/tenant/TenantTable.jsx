import { useTranslation } from 'react-i18next';
import { Table, Badge } from '../common';
import useCalendarDate from '../../hooks/useCalendarDate';

export default function TenantTable({ data, loading }) {
  const { t } = useTranslation();
  const { formatDate } = useCalendarDate();
  const columns = [
    { key: 'fullName',        header: t('tenants.name') },
    { key: 'email',           header: t('tenants.email') },
    { key: 'phoneNumber',     header: t('tenants.phone'),        render: (r) => r.phoneNumber || '—' },
    { key: 'status',          header: t('tenants.status'),       render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
    { key: 'unitNumber',      header: t('tenants.currentUnit'), render: (r) => r.unitNumber || '—' },
    { key: 'moveInDate',      header: t('tenants.moveIn'),      render: (r) => formatDate(r.moveInDate) },
    { key: 'activeLeaseCount',header: t('tenants.activeLeases'),render: (r) => r.activeLeaseCount ?? 0 },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      emptyMessage={t('tenants.noTenantsFound')}
    />
  );
}