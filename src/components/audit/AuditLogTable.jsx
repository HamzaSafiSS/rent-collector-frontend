import { useTranslation } from 'react-i18next';
import { Table, Badge } from '../common';
import useCalendarDate from '../../hooks/useCalendarDate';

const ACTION_COLORS = {
  USER_LOGIN: 'info',
  USER_LOGOUT: 'neutral',
  PASSWORD_CHANGED: 'warning',
  PROPERTY_CREATED: 'success',
  PROPERTY_DELETED: 'danger',
  UNIT_CREATED: 'success',
  UNIT_DELETED: 'danger',
  LEASE_CREATED: 'success',
  LEASE_TERMINATED: 'danger',
  PAYMENT_APPROVED: 'success',
  PAYMENT_REJECTED: 'danger',
  PAYMENT_UPLOADED: 'info',
  LANDLORD_SUSPENDED: 'danger',
  LANDLORD_ACTIVATED: 'success',
  ADMIN_CREATED: 'success',
  ADMIN_DELETED: 'danger',
  TENANT_CREATED: 'success',
  TENANT_DELETED: 'danger',
};

export default function AuditLogTable({ data, loading, emptyMessage }) {
  const { t } = useTranslation();
  const { formatDateTime } = useCalendarDate();

  const columns = [
    { key: 'id', header: t('audit.id') },
    { key: 'actorEmail', header: t('audit.actor'), render: (r) => <span className="font-mono text-xs">{r.actorEmail}</span> },
    { key: 'actorRole', header: t('audit.role'), render: (r) => <Badge label={r.actorRole} variant="neutral" /> },
    { key: 'action', header: t('audit.actionCol'), render: (r) => <Badge label={r.action ? t(`audit.action_${r.action}`) : ''} variant={ACTION_COLORS[r.action] || 'neutral'} /> },
    { key: 'entityType', header: t('audit.entity'), render: (r) => r.entityType ? t(`audit.type_${r.entityType}`) : '—' },
    {
      key: 'description', header: t('audit.description'), render: (r) => (
        <span className="text-xs text-slate-500 max-w-xs truncate block" title={r.description}>
          {r.description || '—'}
        </span>
      )
    },
    { key: 'createdAt', header: t('audit.time'), render: (r) => r.createdAt ? formatDateTime(r.createdAt) : '—' },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      emptyMessage={emptyMessage || t('audit.noAuditEntries')}
    />
  );
}