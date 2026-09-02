import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, Spinner, Alert, Input, Button, StatCard } from '../../components/common';
import { reportApi } from '../../api/reportApi';
import { propertyApi } from '../../api/propertyApi';
import PropertySelector from '../../components/property/PropertySelector';
import useCalendarDate from '../../hooks/useCalendarDate';

export default function ReportsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'Payments';
  const setActiveTab = (tab) => setSearchParams(prev => { const p = new URLSearchParams(prev); p.set('tab', tab); return p; }, { replace: true });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const restoredPropertyId = searchParams.get('propertyId');

  const handleSelectProperty = (p) => {
    setSelectedProperty(p);
    setSearchParams({ propertyId: String(p.id), tab: 'Payments' }, { replace: true });
  };

  const handleBack = () => {
    setSelectedProperty(null);
    setSearchParams({}, { replace: true });
  };
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    propertyApi.listMyProperties(0, 100)
      .then((r) => setProperties(r.data?.data?.content || []))
      .catch(() => {});
  }, []);

  const TABS = [
    { key: 'Payments', label: t('reports.tabPayments') },
    { key: 'Occupancy', label: t('reports.tabOccupancy') },
    { key: 'Revenue', label: t('reports.tabRevenue') },
    { key: 'Tenants', label: t('reports.tabTenants') },
  ];

  return (
    <>
      {!selectedProperty ? (
        <>
          <PageHeader title={t('common.selectProperty')} subtitle={t('reports.selectPropertyReports')} />
          <PropertySelector onSelect={handleSelectProperty} restoredPropertyId={restoredPropertyId} />
        </>
      ) : (
        <>
          <button
            onClick={handleBack}
            className="text-sm text-emerald-400 hover:underline mb-4 flex items-center gap-1"
          >
            {t('common.backToProperties')}
          </button>
          <PageHeader title={t('reports.reportsTitle', { name: selectedProperty.name })} subtitle={t('reports.reportsSubtitle')} />

          {/* Tab bar */}
          <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'Payments'  && <PaymentReport  properties={properties} lockedPropertyId={selectedProperty.id} />}
          {activeTab === 'Occupancy' && <OccupancyReport properties={properties} lockedPropertyId={selectedProperty.id} />}
          {activeTab === 'Revenue'   && <RevenueReport   properties={properties} lockedPropertyId={selectedProperty.id} />}
          {activeTab === 'Tenants'   && <TenantReport    properties={properties} lockedPropertyId={selectedProperty.id} />}
        </>
      )}
    </>
  );
}

// ── helpers ────────────────────────────────────────────────────────────────────
/** Normalise from/to so from <= to (by full YYYY-MM comparison). Returns { from, to, swapped }. */
function normaliseRange(from, to) {
  if (from && to && from > to) return { from: to, to: from, swapped: true };
  return { from, to, swapped: false };
}

// ── Payment Report ─────────────────────────────────────────────────────────────
function PaymentReport({ properties, lockedPropertyId }) {
  const { t } = useTranslation();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [filters, setFilters] = useState({ from: '', to: '', propertyId: lockedPropertyId ? String(lockedPropertyId) : '' });
  const [rangeWarning, setRangeWarning] = useState('');

  const load = useCallback(async (activeFilters) => {
    try {
      setLoading(true); setError(''); setRangeWarning('');
      const { from, to, swapped } = normaliseRange(activeFilters.from, activeFilters.to);
      if (swapped) {
        setFilters((p) => ({ ...p, from, to }));
        setRangeWarning(t('reports.rangeSwappedWarning'));
      }
      const params = {};
      if (from)                      params.from       = from;
      if (to)                        params.to         = to;
      if (activeFilters.propertyId)  params.propertyId = activeFilters.propertyId;
      const res = await reportApi.getPaymentReport(params);
      setData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || t('reports.failedLoadPaymentReport'));
    } finally { setLoading(false); }
  }, [t]);

  // Load on mount using locked property
  useEffect(() => { load(filters); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Filters */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('reports.fromMonth')}</label>
            <input type="month" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('reports.toMonth')}</label>
            <input type="month" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-[#111827] border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200" />
          </div>
          {!lockedPropertyId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('reports.property')}</label>
              <select
                value={filters.propertyId}
                onChange={(e) => setFilters((p) => ({ ...p, propertyId: e.target.value }))}
                className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">{t('reports.allProperties')}</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <Button onClick={() => load(filters)} loading={loading}>{t('reports.refresh')}</Button>
        </div>
      </div>

      {rangeWarning && <Alert type="warning" message={rangeWarning} className="mb-4" />}
      {error   && <Alert type="error" message={error} className="mb-4" />}
      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {data && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard label={t('reports.collectedETB')} value={Number(data.totalCollected).toLocaleString()} color="green"  subtitle={t('reports.paymentsCount', { count: data.approvedCount })} />
          <StatCard label={t('reports.pendingETB')}   value={Number(data.totalPending).toLocaleString()}   color="yellow" subtitle={t('reports.paymentsCount', { count: data.pendingCount })} />
          <StatCard label={t('reports.rejectedETB')}  value={Number(data.totalRejected).toLocaleString()}  color="red"    subtitle={t('reports.paymentsCount', { count: data.rejectedCount })} />
          <StatCard label={t('reports.grandTotal')}     value={Number(data.grandTotal).toLocaleString()}     color="blue"   subtitle={t('reports.totalCount', { count: data.totalCount })} />
        </div>
      )}
    </div>
  );
}

// ── Occupancy Report ───────────────────────────────────────────────────────────
function OccupancyReport({ properties, lockedPropertyId }) {
  const { t } = useTranslation();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [propertyId, setPropertyId] = useState(lockedPropertyId ? String(lockedPropertyId) : '');

  const load = useCallback(async (pid) => {
    try {
      setLoading(true); setError('');
      const params = pid ? { propertyId: pid } : {};
      const res = await reportApi.getOccupancyReport(params);
      setData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || t('reports.failedLoadOccupancyReport'));
    } finally { setLoading(false); }
  }, [t]);

  useEffect(() => { load(propertyId); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 mb-5 flex gap-3 items-end">
        {!lockedPropertyId && (
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('reports.property')}</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">{t('reports.allProperties')}</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
        <Button onClick={() => load(propertyId)} loading={loading}>{t('reports.refresh')}</Button>
      </div>

      {error   && <Alert type="error" message={error} className="mb-4" />}
      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            <StatCard label={t('reports.totalUnits')}    value={data.totalUnits}       color="blue"   />
            <StatCard label={t('reports.occupied')}       value={data.occupiedUnits}    color="green"  />
            <StatCard label={t('reports.available')}      value={data.availableUnits}   color="slate"  />
            <StatCard label={t('reports.maintenance')}    value={data.maintenanceUnits} color="yellow" />
          </div>
          {/* Occupancy rate bar */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 shadow-sm rounded-2xl p-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">{t('reports.occupancyRate')}</span>
              <span className="font-bold text-emerald-400">{data.occupancyRate}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4">
              <div
                className="bg-emerald-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(data.occupancyRate, 100)}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Revenue Report ─────────────────────────────────────────────────────────────
function RevenueReport({ properties, lockedPropertyId }) {
  const { t } = useTranslation();
  const { formatMonth } = useCalendarDate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Year state: always Gregorian
  const currentGregYear = new Date().getFullYear();
  const [gregYear, setGregYear] = useState(currentGregYear);
  const [propertyId, setPropertyId] = useState(lockedPropertyId ? String(lockedPropertyId) : '');

  // Generate year options (Gregorian)
  const yearOptions = [2024, 2025, 2026, 2027].map((gy) => ({
    gregYear: gy,
    label: String(gy),
  }));

  const load = useCallback(async (y, pid) => {
    try {
      setLoading(true); setError('');
      const params = { year: y };
      if (pid) params.propertyId = pid;
      const res = await reportApi.getRevenueReport(params);
      setData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || t('reports.failedLoadRevenueReport'));
    } finally { setLoading(false); }
  }, [t]);

  useEffect(() => { load(gregYear, propertyId); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 mb-5 flex gap-3 items-end flex-wrap">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('reports.year')}</label>
          <select
            value={gregYear}
            onChange={(e) => setGregYear(Number(e.target.value))}
            className="px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {yearOptions.map((opt) => (
              <option key={opt.gregYear} value={opt.gregYear}>{opt.label}</option>
            ))}
          </select>
        </div>
        {!lockedPropertyId && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('reports.property')}</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">{t('reports.allProperties')}</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
        <Button onClick={() => load(gregYear, propertyId)} loading={loading}>{t('reports.refresh')}</Button>
      </div>

      {error   && <Alert type="error" message={error} className="mb-4" />}
      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard label={t('reports.totalRevenueETB')} value={Number(data.totalRevenue).toLocaleString()} color="green" />
            <StatCard label={t('reports.avgMonthlyETB')}   value={Number(data.averageMonthlyRevenue).toLocaleString()} color="blue" />
          </div>

          {/* Monthly breakdown */}
          {data.byMonth?.length > 0 && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden mb-4 shadow-sm">
              <p className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-100 bg-slate-50 dark:bg-slate-800/50/50">{t('reports.monthlyBreakdown')}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50/50 border-b border-slate-200 dark:border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{t('reports.monthCol')}</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('reports.revenueETBCol')}</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">{t('reports.paymentsCol')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {data.byMonth.map((m) => (
                      <tr key={m.month} className="hover:bg-emerald-500/5/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">{formatMonth(m.month)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-emerald-400">{Number(m.revenue).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500 font-medium">{m.paymentCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Tenant Report ──────────────────────────────────────────────────────────────
function TenantReport({ properties, lockedPropertyId }) {
  const { t } = useTranslation();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [propertyId, setPropertyId] = useState(lockedPropertyId ? String(lockedPropertyId) : '');

  const load = useCallback(async (pid) => {
    try {
      setLoading(true); setError('');
      const params = pid ? { propertyId: pid } : {};
      const res = await reportApi.getTenantReport(params);
      setData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || t('reports.failedLoadTenantReport'));
    } finally { setLoading(false); }
  }, [t]);

  useEffect(() => { load(propertyId); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 mb-5 flex gap-3 items-end">
        {!lockedPropertyId && (
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('reports.property')}</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3 py-2 text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">{t('reports.allProperties')}</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
        <Button onClick={() => load(propertyId)} loading={loading}>{t('reports.refresh')}</Button>
      </div>

      {error   && <Alert type="error" message={error} className="mb-4" />}
      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard label={t('reports.activeTenants')}     value={data.totalActiveTenants}     color="green" />
            <StatCard label={t('reports.historicalTenants')} value={data.totalHistoricalTenants} color="slate" />
            <StatCard label={t('reports.totalUniqueTenants')}value={data.totalTenants}           color="blue"  />
          </div>
          {data.tenants?.length > 0 && (
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50/50 border-b border-slate-200 dark:border-slate-100">
                    <tr>
                      {[t('tenants.name'), t('tenants.email'), t('tenants.status'), t('tenants.currentUnit'), t('tenants.activeLeases'), t('reports.totalLeasesCol')].map((h) => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {data.tenants.map((t) => (
                      <tr key={t.tenantId} className="hover:bg-emerald-500/5/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900 dark:text-slate-100">{t.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">{t.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${t.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-medium">{t.currentUnit || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-slate-300">{t.activeLeases}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-slate-500">{t.totalLeases}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}