import { useCallback, useEffect, useState } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, Badge, Spinner, Alert, Pagination } from '../../components/common';
import { paymentApi } from '../../api/paymentApi';
import { TENANT_NAV } from './tenantNav';

const PAGE_SIZE = 10;

export default function PaymentHistoryPage() {
  const [payments, setPayments]       = useState([]);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const res  = await paymentApi.getMyPayments(page, PAGE_SIZE);
      const data = res.data?.data;
      setPayments(data?.content          || []);
      setTotalPages(data?.totalPages     || 0);
      setTotalElements(data?.totalElements || 0);
    } catch { setError('Failed to load payment history.'); }
    finally  { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <PortalLayout navItems={TENANT_NAV} portalLabel="Tenant">
      <PageHeader title="Payment History" subtitle={`${totalElements} payment${totalElements !== 1 ? 's' : ''}`} />

      {error   && <Alert type="error" message={error} />}
      {loading && <div className="flex justify-center py-20"><Spinner size="lg" /></div>}

      {!loading && !error && payments.length === 0 && (
        <div className="text-center py-20">
          <p className="text-3xl mb-3">💳</p>
          <p className="text-slate-500">No payments yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">💳</div>
                <div>
                  <p className="font-semibold text-slate-800">ETB {Number(p.amount).toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {p.paymentMonth} · Uploaded {p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
              <Badge label={p.status} />
            </div>

            {p.status === 'REJECTED' && p.landLoardComment && (
              <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <p className="text-xs font-medium text-red-700">Rejection reason:</p>
                <p className="text-xs text-red-600 mt-0.5">{p.landLoardComment}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} size={PAGE_SIZE} onPageChange={setPage} />
      </div>
    </PortalLayout>
  );
}