import { useState, useEffect, useCallback } from 'react';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, Spinner, Alert, Input, Button } from '../../components/common';
import { reportApi } from '../../api/reportApi';
import { propertyApi } from '../../api/propertyApi';
import { LANDLORD_NAV } from './landlordNav';

const TABS = ['Payments', 'Occupancy', 'Revenue', 'Tenants'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('Payments');
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    propertyApi.listMyProperties(0, 100)
      .then((r) => setProperties(r.data?.data?.content || []))
      .catch(() => {});
  }, []);

  return (
    <PortalLayout navItems={LANDLORD_NAV} portalLabel="Landlord">
      <PageHeader title="Reports" subtitle="Analyse your portfolio performance" />
      
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Payments'  && <PaymentReport  properties={properties} />}
      {activeTab === 'Occupancy' && <OccupancyReport properties={properties} />}
      {activeTab === 'Revenue'   && <RevenueReport   properties={properties} />}
      {activeTab === 'Tenants'   && <TenantReport    properties={properties} />}
    </PortalLayout>
  );
}

// ── Payment Report ─────────────────────────────────────────────────────────────
function PaymentReport({ properties }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [filters, setFilters] = useState({ from: '', to: '', propertyId: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const params = {};
      if (filters.from)       params.from       = filters.from;
      if (filters.to)         params.to         = filters.to;
      if (filters.propertyId) params.propertyId = filters.propertyId;
      const res = await reportApi.getPaymentReport(params);
      setData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payment report.');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <Input label="From month" type="month" value={filters.from}       onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
          <Input label="To month"   type="month" value={filters.to}         onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
            <select
              value={filters.propertyId}
              onChange={(e) => setFilters((p) => ({ ...p, propertyId: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All properties</option>
              {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <Button onClick={load} loading={loading}>Refresh</Button>
        </div>
      </div>

      {error   && <Alert type="error" message={error} className="mb-4" />}
      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {data && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReportCard label="Collected (ETB)" value={Number(data.totalCollected).toLocaleString()} color="green"  sub={`${data.approvedCount} payments`} />
          <ReportCard label="Pending (ETB)"   value={Number(data.totalPending).toLocaleString()}   color="yellow" sub={`${data.pendingCount} payments`} />
          <ReportCard label="Rejected (ETB)"  value={Number(data.totalRejected).toLocaleString()}  color="red"    sub={`${data.rejectedCount} payments`} />
          <ReportCard label="Grand Total"     value={Number(data.grandTotal).toLocaleString()}     color="blue"   sub={`${data.totalCount} total`} />
        </div>
      )}
    </div>
  );
}

// ── Occupancy Report ───────────────────────────────────────────────────────────
function OccupancyReport({ properties }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [propertyId, setPropertyId] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const params = propertyId ? { propertyId } : {};
      const res = await reportApi.getOccupancyReport(params);
      setData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load occupancy report.');
    } finally { setLoading(false); }
  }, [propertyId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 flex gap-3 items-end">
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All properties</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Button onClick={load} loading={loading}>Refresh</Button>
      </div>

      {error   && <Alert type="error" message={error} className="mb-4" />}
      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <ReportCard label="Total Units"    value={data.totalUnits}       color="blue"   />
            <ReportCard label="Occupied"       value={data.occupiedUnits}    color="green"  />
            <ReportCard label="Available"      value={data.availableUnits}   color="slate"  />
            <ReportCard label="Maintenance"    value={data.maintenanceUnits} color="yellow" />
          </div>
          {/* Occupancy rate bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">Occupancy Rate</span>
              <span className="font-bold text-blue-600">{data.occupancyRate}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
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
function RevenueReport({ properties }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [year, setYear]       = useState(String(new Date().getFullYear()));
  const [propertyId, setPropertyId] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const params = { year };
      if (propertyId) params.propertyId = propertyId;
      const res = await reportApi.getRevenueReport(params);
      setData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load revenue report.');
    } finally { setLoading(false); }
  }, [year, propertyId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 flex gap-3 items-end flex-wrap">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All properties</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Button onClick={load} loading={loading}>Refresh</Button>
      </div>

      {error   && <Alert type="error" message={error} className="mb-4" />}
      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <ReportCard label="Total Revenue (ETB)" value={Number(data.totalRevenue).toLocaleString()} color="green" />
            <ReportCard label="Avg Monthly (ETB)"   value={Number(data.averageMonthlyRevenue).toLocaleString()} color="blue" />
          </div>

          {/* Monthly breakdown */}
          {data.byMonth?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
              <p className="px-4 py-3 font-semibold text-slate-700 border-b border-slate-100">Monthly Breakdown</p>
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Month</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Revenue (ETB)</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Payments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.byMonth.map((m) => (
                    <tr key={m.month} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5">{m.month}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-green-700">{Number(m.revenue).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-slate-500">{m.paymentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Tenant Report ──────────────────────────────────────────────────────────────
function TenantReport({ properties }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [propertyId, setPropertyId] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const params = propertyId ? { propertyId } : {};
      const res = await reportApi.getTenantReport(params);
      setData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tenant report.');
    } finally { setLoading(false); }
  }, [propertyId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 flex gap-3 items-end">
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All properties</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Button onClick={load} loading={loading}>Refresh</Button>
      </div>

      {error   && <Alert type="error" message={error} className="mb-4" />}
      {loading && <div className="flex justify-center py-12"><Spinner size="lg" /></div>}

      {data && !loading && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <ReportCard label="Active Tenants"     value={data.totalActiveTenants}     color="green" />
            <ReportCard label="Historical Tenants" value={data.totalHistoricalTenants} color="slate" />
            <ReportCard label="Total Unique"       value={data.totalTenants}           color="blue"  />
          </div>
          {data.tenants?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Name','Email','Status','Current Unit','Active Leases','Total Leases'].map((h) => (
                      <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.tenants.map((t) => (
                    <tr key={t.tenantId} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium">{t.fullName}</td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs">{t.email}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">{t.currentUnit || '—'}</td>
                      <td className="px-4 py-2.5 text-center">{t.activeLeases}</td>
                      <td className="px-4 py-2.5 text-center">{t.totalLeases}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Shared stat card for reports ───────────────────────────────────────────────
function ReportCard({ label, value, color = 'blue', sub }) {
  const colors = {
    blue:   'bg-blue-50   border-blue-200   text-blue-700',
    green:  'bg-green-50  border-green-200  text-green-700',
    red:    'bg-red-50    border-red-200    text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    slate:  'bg-slate-50  border-slate-200  text-slate-700',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color] || colors.blue}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
}