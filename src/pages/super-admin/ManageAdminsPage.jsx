import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageHeader, Table, Badge, Button, Modal,
  Pagination, Spinner, Alert,
} from '../../components/common';
import AdminForm from '../../components/admin/AdminForm';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import useCalendarDate from '../../hooks/useCalendarDate';


const PAGE_SIZE = 10;

export default function ManageAdminsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { formatDate } = useCalendarDate();

  const [admins, setAdmins]           = useState([]);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage]               = useState(0);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState('');

  // Modal state
  const [createOpen, setCreateOpen]     = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [formLoading, setFormLoading]   = useState(false);
  const [formError, setFormError]       = useState('');

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res  = await adminApi.listAdmins(page, PAGE_SIZE);
      const data = res.data?.data;
      setAdmins(data?.content        || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch {
      setFetchError(t('admin.failedLoadAdmins'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => { loadAdmins(); }, [loadAdmins]);

  // ── Create ─────────────────────────────────────────────────────────────────
  async function handleCreate(form) {
    try {
      setFormLoading(true);
      setFormError('');
      await adminApi.createAdmin(form);
      toast.success(t('admin.adminCreated'));
      setCreateOpen(false);
      loadAdmins();
    } catch (err) {
      let errMsg = err.response?.data?.message || t('admin.failedCreateAdmin');
      if (errMsg.includes('already exists') && errMsg.includes('email')) {
        const match = errMsg.match(/email '([^']+)'/);
        const email = match ? match[1] : form.email;
        errMsg = t('errors.accountAlreadyExists', { email });
      }
      setFormError(errMsg);
    } finally {
      setFormLoading(false);
    }
  }

  // ── Update ─────────────────────────────────────────────────────────────────
  async function handleUpdate(form) {
    try {
      setFormLoading(true);
      setFormError('');
      await adminApi.updateAdmin(editTarget.id, form);
      toast.success(t('admin.adminUpdated'));
      setEditTarget(null);
      loadAdmins();
    } catch (err) {
      setFormError(err.response?.data?.message || t('admin.failedUpdateAdmin'));
    } finally {
      setFormLoading(false);
    }
  }

  // ── Suspend / Activate ─────────────────────────────────────────────────────
  async function handleToggleStatus(admin) {
    try {
      if (admin.status === 'Suspended') {
        await adminApi.activateAdmin(admin.id);
        toast.success(t('admin.adminActivated', { name: admin.fullName }));
      } else {
        await adminApi.suspendAdmin(admin.id);
        toast.success(t('admin.adminSuspended', { name: admin.fullName }));
      }
      loadAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.actionFailed'));
    }
  }

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    { key: 'fullName',  header: t('admin.name') },
    { key: 'email',     header: t('admin.email') },
    { key: 'phoneNumber', header: t('payments.phoneNumber'), render: (r) => r.phoneNumber || '—' },
    { key: 'status',    header: t('admin.status'), render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
    { key: 'createdAt', header: t('admin.joined'), render: (r) => r.createdAt ? formatDate(r.createdAt) : '—' },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => { setEditTarget(row); setFormError(''); }}>
            {t('common.edit')}
          </Button>
          <Button
            size="sm"
            variant={row.status === 'Suspended' ? 'success' : 'secondary'}
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === 'Suspended' ? t('admin.activate') : t('admin.suspend')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <button
        onClick={() => navigate('/super-admin/dashboard')}
        className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
      >
        {t('common.backToDashboard')}
      </button>

      <PageHeader
        title={t('admin.manageAdminsTitle')}
        subtitle={totalElements !== 1 ? t('admin.adminsCount', { count: totalElements }) : t('admin.adminsCountSingular', { count: totalElements })}
        actions={
          <Button onClick={() => { setCreateOpen(true); setFormError(''); }}>
            {t('admin.newAdminBtn')}
          </Button>
        }
      />

      {fetchError && <Alert type="error" message={fetchError} className="mb-4" />}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <Table columns={columns} data={admins} emptyMessage={t('admin.noAdminsFound')} />
          <div className="px-4 border-t border-slate-100">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              size={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title={t('admin.createAdminTitle')} footer={null}>
        <AdminForm
          onSubmit={handleCreate}
          loading={formLoading}
          error={formError}
          isEdit={false}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={t('admin.editAdminTitle')} footer={null}>
        <AdminForm
          initial={editTarget}
          onSubmit={handleUpdate}
          loading={formLoading}
          error={formError}
          isEdit={true}
        />
      </Modal>

    </>
  );
}