import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Table, Badge, Pagination, Spinner, Alert } from '../../components/common';
import { propertyApi } from '../../api/propertyApi';
import { adminApi } from '../../api/adminApi';
import { unitApi } from '../../api/unitApi';

import { useAuth } from '../../context/AuthContext';



const PAGE_SIZE = 10;

export default function PropertyDashboardViewPage() {
  const { t } = useTranslation();

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';


  const backUrl = isSuperAdmin ? '/super-admin/view/properties' : '/admin/view/properties';

  const [property, setProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('leases');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Table state
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (id) {
      propertyApi.getPropertyDetail(id)
        .then(res => setProperty(res.data.data))
        .catch(err => console.error('Failed to load property', err));
    }
  }, [id]);

  const loadTabData = useCallback(async () => {
    if (!id || !property) return;
    setLoading(true);
    try {
      let res;
      if (activeTab === 'leases') {
        res = await adminApi.getPropertyLeases(id, page, PAGE_SIZE);
      } else if (activeTab === 'units') {
        res = await unitApi.listUnits(id, page, PAGE_SIZE);
      } else if (activeTab === 'tenants') {
        res = await adminApi.getLandlordTenants(property.landlordId, page, PAGE_SIZE, id);
      }
      const data = res?.data?.data;
      let content = data?.content || [];
      if (statusFilter) {
        content = content.filter(item => 
          item.status && String(item.status).toUpperCase() === String(statusFilter).toUpperCase()
        );
      }
      setItems(content);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error(err);
      setItems([]);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [id, activeTab, page, property, statusFilter]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  const getColumns = () => {
    if (activeTab === 'leases') {
      return [
        { key: 'tenantFullName', header: 'Tenant', render: (r) => r.tenantFullName || r.tenantEmail || '—' },
        { key: 'unitNumber', header: 'Unit' },
        { key: 'monthlyRent', header: 'Rent', render: (r) => `ETB ${Number(r.monthlyRent).toLocaleString()}` },
        { key: 'status', header: 'Status', render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
      ];
    }
    if (activeTab === 'units') {
      return [
        { key: 'unitNumber', header: 'Unit No.' },
        { key: 'status', header: 'Status', render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
        { key: 'baseRent', header: 'Base Rent', render: (r) => r.baseRent ? `ETB ${Number(r.baseRent).toLocaleString()}` : '—' },
      ];
    }
    if (activeTab === 'tenants') {
      return [
        { key: 'fullName', header: 'Name', render: (r) => r.fullName || '—' },
        { key: 'email', header: 'Email' },
        { key: 'phoneNumber', header: 'Phone', render: (r) => r.phoneNumber || '—' },
        { key: 'status', header: 'Status', render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
      ];
    }
    return [];
  };

  const getStatusOptions = () => {
    if (activeTab === 'leases') return ['ACTIVE', 'TERMINATED', 'CANCELLED'];
    if (activeTab === 'units') return ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'];
    if (activeTab === 'tenants') return ['Active', 'Suspended', 'PendingPasswordChange'];
    return [];
  };

  return (
    <>
      <button
        onClick={() => navigate(backUrl)}
        className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
      >
        ← Back to Properties
      </button>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="flex items-center justify-between mb-6">
        <PageHeader title={`Property Dashboard`} subtitle={`Property ID: ${id}`} />
        <div className="bg-amber-500/15 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 shadow-sm">
          Read-Only View
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4 justify-between items-center border-b border-slate-700/50">
        <div className="flex gap-2">
          {['leases', 'units', 'tenants'].map(tab => (
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
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-medium text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-600/50 rounded px-2 py-1 outline-none focus:border-emerald-500/50"
          >
            <option value="">All</option>
            {getStatusOptions().map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
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
