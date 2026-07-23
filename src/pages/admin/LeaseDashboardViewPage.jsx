import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, Table, Badge, Pagination, Spinner, Alert } from '../../components/common';
import { adminApi } from '../../api/adminApi';

const NAV = [
  { label: 'Dashboard',  to: '/admin/dashboard',  icon: '📊' },
  { label: 'Landlords',  to: '/admin/landlords',  icon: '🏢' },
  { label: 'Tenants',    to: '/admin/tenants',    icon: '👥' },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: '📋' },
];

const PAGE_SIZE = 10;

export default function LeaseDashboardViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('payments');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Table state
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadTabData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      let res;
      if (activeTab === 'payments') {
        res = await adminApi.getLeasePayments(id, page, PAGE_SIZE);
      }
      const data = res?.data?.data;
      setItems(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error(err);
      setItems([]);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [id, activeTab, page]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  const getColumns = () => {
    if (activeTab === 'payments') {
      return [
        { key: 'paymentMonth', header: 'Month' },
        { key: 'amount', header: 'Amount', render: (r) => `ETB ${Number(r.amount).toLocaleString()}` },
        { key: 'status', header: 'Status', render: (r) => <Badge label={r.status} /> },
        { key: 'uploadedAt', header: 'Date', render: (r) => new Date(r.uploadedAt).toLocaleDateString() },
      ];
    }
    return [];
  };

  return (
    <PortalLayout navItems={NAV} portalLabel="Admin">
      <button
        onClick={() => navigate('/admin/view/leases')}
        className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
      >
        ← Back to Leases
      </button>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="flex items-center justify-between mb-6">
        <PageHeader title={`Lease Dashboard`} subtitle={`Lease ID: ${id}`} />
        <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 shadow-sm">
          Read-Only View
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {['payments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800 capitalize">{activeTab}</h3>
        </div>
        
        <div className="relative min-h-[200px]">
          {loading ? (
            <div className="absolute inset-0 bg-white/50 flex justify-center pt-10 z-10">
              <Spinner size="md" />
            </div>
          ) : null}
          <Table 
            columns={getColumns()} 
            data={items} 
            emptyMessage={`No ${activeTab} found.`} 
          />
        </div>

        <div className="px-4 border-t border-slate-100">
          <Pagination
            page={page}
            totalPages={totalPages}
            size={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </PortalLayout>
  );
}
