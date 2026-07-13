import { Table, Badge } from '../common';

const ACTION_COLORS = {
  USER_LOGIN:          'info',
  USER_LOGOUT:         'neutral',
  PASSWORD_CHANGED:    'warning',
  PROPERTY_CREATED:    'success',
  PROPERTY_DELETED:    'danger',
  UNIT_CREATED:        'success',
  UNIT_DELETED:        'danger',
  LEASE_CREATED:       'success',
  LEASE_TERMINATED:    'danger',
  PAYMENT_APPROVED:    'success',
  PAYMENT_REJECTED:    'danger',
  PAYMENT_UPLOADED:    'info',
  LANDLORD_SUSPENDED:  'danger',
  LANDLORD_ACTIVATED:  'success',
  ADMIN_CREATED:       'success',
  ADMIN_DELETED:       'danger',
  TENANT_CREATED:      'success',
  TENANT_DELETED:      'danger',
};

const COLUMNS = [
  { key: 'id',         header: 'ID' },
  { key: 'actorEmail', header: 'Actor',       render: (r) => <span className="font-mono text-xs">{r.actorEmail}</span> },
  { key: 'actorRole',  header: 'Role',        render: (r) => <Badge label={r.actorRole} variant="neutral" /> },
  { key: 'action',     header: 'Action',      render: (r) => <Badge label={r.action} variant={ACTION_COLORS[r.action] || 'neutral'} /> },
  { key: 'entityType', header: 'Entity' },
  { key: 'entityId',   header: 'Entity ID',   render: (r) => r.entityId ?? '—' },
  { key: 'description',header: 'Description', render: (r) => (
    <span className="text-xs text-slate-500 max-w-xs truncate block" title={r.description}>
      {r.description || '—'}
    </span>
  )},
  { key: 'createdAt',  header: 'Time',        render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : '—' },
];

export default function AuditLogTable({ data, loading, emptyMessage }) {
  return (
    <Table
      columns={COLUMNS}
      data={data}
      loading={loading}
      emptyMessage={emptyMessage || 'No audit log entries.'}
    />
  );
}