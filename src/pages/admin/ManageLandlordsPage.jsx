import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, Table, Badge, Button, Pagination, Alert, ConfirmDialog } from '../../components/common';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/common';
import useCalendarDate from '../../hooks/useCalendarDate';

const PAGE_SIZE = 10;

export default function ManageLandlordsPage() {
  const { t } = useTranslation();
  const { formatDate } = useCalendarDate();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [landlords, setLandlords]     = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null); // { landlord, action }
  const [actionLoading, setActionLoading] = useState(false);

  const loadLandlords = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res  = await adminApi.listLandlords(page, PAGE_SIZE);
      const data = res.data?.data;
      setLandlords(data?.content        || []);
      setTotalPages(data?.totalPages    || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setError(t('admin.failedLoadLandlords'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => { loadLandlords(); }, [loadLandlords]);

  async function handleConfirmAction() {
    if (!confirmTarget) return;
    const { landlord, action } = confirmTarget;
    try {
      setActionLoading(true);
      if (action === 'suspend') {
        await adminApi.suspendLandlord(landlord.id);
        toast.success(t('admin.landlordSuspended', { name: landlord.fullName }));
      } else {
        await adminApi.activateLandlord(landlord.id);
        toast.success(t('admin.landlordActivated', { name: landlord.fullName }));
      }
      setConfirmTarget(null);
      loadLandlords();
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.actionFailed'));
    } finally {
      setActionLoading(false);
    }
  }

  const columns = [
    { key: 'fullName',    header: t('admin.name') },
    { key: 'email',       header: t('admin.email') },
    { key: 'phoneNumber', header: t('payments.phoneNumber'),   render: (r) => r.phoneNumber || '—' },
    { key: 'status',      header: t('admin.status'),  render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
    { key: 'createdAt',   header: t('admin.joined'),  render: (r) => r.createdAt ? formatDate(r.createdAt) : '—' },
    {
      key: 'actions', header: t('common.actions'),
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={row.status === 'Suspended' ? 'success' : 'secondary'}
            onClick={() => setConfirmTarget({
              landlord: row,
              action: row.status === 'Suspended' ? 'activate' : 'suspend',
            })}
          >
            {row.status === 'Suspended' ? t('admin.activate') : t('admin.suspend')}
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(`/admin/view/landlord-dashboard/${row.id}`, { state: { from: location.pathname + location.search } })}
          >
            {t('admin.viewDashboard')}
          </Button>
        </div>
      ),
    },
  ];

  const action = confirmTarget?.action;

  return (
    <>
      <PageHeader
        title={t('admin.manageLandlordsTitle')}
        subtitle={totalElements !== 1 ? t('admin.landlordsCount', { count: totalElements }) : t('admin.landlordsCountSingular', { count: totalElements })}
      />

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={columns.length} />
        ) : (
          <Table columns={columns} data={landlords} emptyMessage={t('admin.noLandlordsFound')} />
        )}
        <div className="px-4 border-t border-slate-100">
          <Pagination
            page={page} totalPages={totalPages}
            totalElements={totalElements} size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmAction}
        loading={actionLoading}
        title={action === 'suspend' ? t('admin.suspendLandlordTitle') : t('admin.activateLandlordTitle')}
        message={
          action === 'suspend'
            ? t('admin.suspendLandlordMsg', { name: confirmTarget?.landlord?.fullName })
            : t('admin.activateLandlordMsg', { name: confirmTarget?.landlord?.fullName })
        }
        confirmText={action === 'suspend' ? t('admin.suspend') : t('admin.activate')}
        variant={action === 'suspend' ? 'danger' : 'primary'}
      />
    </>
  );
}