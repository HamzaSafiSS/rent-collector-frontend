import { Table, Badge, Button } from '../common';

export default function TenantTable({ data, loading, onEdit, onDelete }) {
  const columns = [
    { key: 'fullName',        header: 'Name' },
    { key: 'email',           header: 'Email' },
    { key: 'phoneNumber',     header: 'Phone',        render: (r) => r.phoneNumber || '—' },
    { key: 'status',          header: 'Status',       render: (r) => <Badge label={r.status} /> },
    { key: 'unitNumber',      header: 'Current Unit', render: (r) => r.unitNumber || '—' },
    { key: 'moveInDate',      header: 'Move-in',      render: (r) => r.moveInDate || '—' },
    { key: 'activeLeaseCount',header: 'Active Leases',render: (r) => r.activeLeaseCount ?? 0 },
    {
      key: 'actions', header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost"  onClick={() => onEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      loading={loading}
      emptyMessage="No tenants found."
    />
  );
}