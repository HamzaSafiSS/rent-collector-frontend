import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Table, Badge, Pagination, Spinner, Alert } from '../../components/common';
import { adminApi } from '../../api/adminApi';

import { useAuth } from '../../context/AuthContext';



const PAGE_SIZE = 10;

export default function UnitDashboardViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const navItems = isSuperAdmin ? SUPER_ADMIN_NAV : ADMIN_NAV;
  const portalLabel = isSuperAdmin ? 'Super Admin' : 'Admin';
  const backUrl = isSuperAdmin ? '/super-admin/view/units' : '/admin/view/units';

  const [activeTab, setActiveTab] = useState('leases');
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
      if (activeTab === 'leases') {
        res = await adminApi.getUnitLeases(id, page, PAGE_SIZE);
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
    if (activeTab === 'leases') {
      return [
        { key: 'tenantFullName', header: 'Tenant' },
        { key: 'propertyName', header: 'Property' },
        { key: 'monthlyRent', header: 'Rent', render: (r) => `ETB ${Number(r.monthlyRent).toLocaleString()}` },
        { key: 'status', header: 'Status', render: (r) => <Badge label={r.status} /> },
      ];
    }
    return [];
  };

  return (
    <>
      <button
        onClick={() => navigate(backUrl)}
        className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
      >
        ← Back to Units
      </button>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="flex items-center justify-between mb-6">
        <PageHeader title={`Unit Dashboard`} subtitle={`Unit ID: ${id}`} />
        <div className="bg-amber-500/15 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 shadow-sm">
          Read-Only View
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-slate-700/50">
        {['leases'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-[#111827] rounded-xl border border-slate-700/50 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-800/50">
          <h3 className="font-semibold text-slate-100 capitalize">{activeTab}</h3>
        </div>
        
        <div className="relative min-h-[200px]">
          {loading ? (
            <div className="absolute inset-0 bg-[#111827]/70 flex justify-center pt-10 z-10">
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
    </>
  );
}
