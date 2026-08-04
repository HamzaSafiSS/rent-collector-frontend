import { useTranslation } from 'react-i18next';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, Table, Badge, Pagination, Spinner, Alert } from '../../components/common';
import { adminApi } from '../../api/adminApi';

import { useAuth } from '../../context/AuthContext';



const PAGE_SIZE = 10;

export default function LandlordDashboardViewPage() {
  const { t } = useTranslation();

  const { landlordId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';


  const backUrl = isSuperAdmin ? '/super-admin/view/landlords' : '/admin/landlords';

  const [landlord, setLandlord] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Table state
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isTableLoading, setIsTableLoading] = useState(false);

  useEffect(() => {
    adminApi.getLandlord(landlordId)
      .then(res => setLandlord(res.data?.data))
      .catch(() => setError(t('admin.failedToLoadLandlord', 'Failed to load landlord profile.')))
      .finally(() => setLoading(false));
  }, [landlordId]);

  const loadTabData = useCallback(async () => {
    if (!landlordId) return;
    setIsTableLoading(true);
    try {
      let res;
      if (activeTab === 'properties') {
        res = await adminApi.getLandlordProperties(landlordId, page, PAGE_SIZE);
      } else if (activeTab === 'tenants') {
        res = await adminApi.getLandlordTenants(landlordId, page, PAGE_SIZE);
      } else if (activeTab === 'leases') {
        res = await adminApi.getLandlordLeases(landlordId, page, PAGE_SIZE);
      }
      const data = res?.data?.data;
      setItems(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setIsTableLoading(false);
    }
  }, [landlordId, activeTab, page]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // Reset page when tab changes
  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  const getColumns = () => {
    if (activeTab === 'properties') {
      return [
        { key: 'name', header: t('properties.propertyNameLabel', 'Property Name') },
        { key: 'address', header: t('properties.addressLabel', 'Address') },
        { key: 'unitsCount', header: t('properties.units', 'Units'), render: (r) => r.unitsCount || 0 },
      ];
    }
    if (activeTab === 'tenants') {
      return [
        { key: 'fullName', header: t('tenants.name', 'Name') },
        { key: 'email', header: t('tenants.email', 'Email') },
        { key: 'status', header: t('tenants.status', 'Status'), render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
        { key: 'unitNumber', header: t('admin.currentUnit', 'Unit'), render: (r) => r.unitNumber || '—' },
      ];
    }
    if (activeTab === 'leases') {
      return [
        { key: 'tenantFullName', header: t('nav.tenants', 'Tenant'), render: (r) => r.tenantFullName || r.tenantEmail || '—' },
        { key: 'propertyName', header: t('nav.properties', 'Property') },
        { key: 'unitNumber', header: t('units.unitNumber', 'Unit') },
        { key: 'monthlyRent', header: t('leases.monthlyRentETB', 'Rent'), render: (r) => `ETB ${Number(r.monthlyRent).toLocaleString()}` },
        { key: 'status', header: t('leases.status', 'Status'), render: (r) => <Badge statusKey={r.status} label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
      ];
    }
    return [];
  };

  if (loading) {
    return (
      <>
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      </>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(backUrl)}
        className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
      >
        ← {t('common.backToLandlords', 'Back to Landlords')}
      </button>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {landlord && (
        <>
          <div className="flex items-center justify-between mb-6">
            <PageHeader 
              title={t('dashboard.userDashboard', { name: landlord.fullName, defaultValue: `${landlord.fullName}'s Dashboard` })} 
              subtitle={landlord.email}
            />
            <div className="bg-amber-500/15 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 shadow-sm">
              {t('common.readOnlyView', 'Read-Only View')}
            </div>
          </div>

          <div className="mb-6 flex gap-2 border-b border-slate-700/50">
            {['properties', 'tenants', 'leases'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-emerald-600 text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-100'
                }`}
              >
                {t(`nav.${tab}`)}
              </button>
            ))}
          </div>

          <div className="bg-[#111827] rounded-xl border border-slate-700/50 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-semibold text-slate-100 capitalize">{t(`nav.${activeTab}`)}</h3>
            </div>
            <div className="relative min-h-[200px]">
              {isTableLoading ? (
                <div className="absolute inset-0 bg-[#111827]/70 flex justify-center pt-10 z-10">
                  <Spinner size="md" />
                </div>
              ) : null}
              <Table 
                columns={getColumns()} 
                data={items} 
                emptyMessage={t('empty.noRecordsForTab', { tab: t(`nav.${activeTab}`), defaultValue: `No ${activeTab} found.` })} 
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
      )}
    </>
  );
}
