import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, PageHeader, Spinner } from '../../components/common';
import { reportApi } from '../../api/reportApi';
import { propertyApi } from '../../api/propertyApi';
import { auditApi } from '../../api/auditApi';
import { leaseApi } from '../../api/leaseApi';
import { StatCardsSkeleton } from '../../components/common';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';


export default function LandlordDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function for relative time
  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const ActivityIcon = ({ action }) => {
    if (action?.includes('PAYMENT')) return <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm shrink-0 border border-emerald-500/20">💳</div>;
    if (action?.includes('LEASE')) return <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm shrink-0 border border-emerald-500/20">📄</div>;
    if (action?.includes('TENANT')) return <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm shrink-0 border border-emerald-500/20">👤</div>;
    if (action?.includes('UNIT') || action?.includes('PROPERTY')) return <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-sm shrink-0 border border-slate-700">🏢</div>;
    return <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-sm shrink-0 border border-slate-700">📝</div>;
  };

  useEffect(() => {
    async function load() {
      try {
        const [propRes, occRes] = await Promise.all([
          propertyApi.listMyProperties(0, 1),
          reportApi.getOccupancyReport({}),
        ]);
        setStats({
          totalProperties:   propRes.data?.data?.totalElements ?? 0,
          occupiedUnits:     occRes.data?.data?.occupiedUnits  ?? 0,
          availableUnits:    occRes.data?.data?.availableUnits ?? 0,
          maintenanceUnits:  occRes.data?.data?.maintenanceUnits ?? 0,
          totalUnits:        occRes.data?.data?.totalUnits     ?? 0,
          occupancyRate:     occRes.data?.data?.occupancyRate  ?? 0,
        });
      } catch {
        // stats remain null
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Load recent activity
  useEffect(() => {
    async function loadActivity() {
      try {
        setActivityLoading(true);
        const res = await auditApi.getAuditLogs({ size: 5 });
        setRecentActivity(res.data?.data?.content || []);
      } catch {
        setRecentActivity([]);
      } finally {
        setActivityLoading(false);
      }
    }
    loadActivity();
  }, []);

  // Load revenue chart data
  useEffect(() => {
    async function loadRevenue() {
      try {
        setRevenueLoading(true);
        const year = new Date().getFullYear();
        const res = await reportApi.getRevenueReport({ year });
        const monthly = res.data?.data?.monthlyRevenue || res.data?.data || [];
        
        // Normalize into chart-friendly format
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let chartData = [];

        if (Array.isArray(monthly)) {
          // If API returns array of {month, revenue} or similar
          chartData = monthly.map((item, idx) => ({
            month: item.month || months[idx] || `M${idx + 1}`,
            revenue: item.revenue ?? item.amount ?? item.total ?? 0,
          }));
        } else if (typeof monthly === 'object') {
          // If API returns { "2026-01": 1200, "2026-02": 1500 } or similar
          chartData = Object.entries(monthly).map(([key, value]) => ({
            month: key,
            revenue: typeof value === 'number' ? value : 0,
          }));
        }

        // If we got empty data, generate placeholder months
        if (chartData.length === 0) {
          chartData = months.map(m => ({ month: m, revenue: 0 }));
        }

        setRevenueData(chartData);
      } catch {
        // Chart will show empty state
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        setRevenueData(months.map(m => ({ month: m, revenue: 0 })));
      } finally {
        setRevenueLoading(false);
      }
    }
    loadRevenue();
  }, []);

  return (
    <div>
      <PageHeader title="Landlord Dashboard"/>

      {loading ? (
        <StatCardsSkeleton count={6} />
      ) : !stats ? (
        <p className="text-slate-400 text-sm">Could not load statistics.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="My Properties"    value={stats.totalProperties}  icon="🏗️" color="blue" onClick={() => navigate('/landlord/properties')} />
          <StatCard label="Total Units"      value={stats.totalUnits}       icon="🚪" color="slate" onClick={() => navigate('/landlord/units?status=ALL')} />
          <StatCard label="Occupied Units"   value={stats.occupiedUnits}    icon="👥" color="green" subtitle={`${stats.occupancyRate}% occupancy`} onClick={() => navigate('/landlord/units?status=OCCUPIED')} />
          <StatCard label="Available Units"  value={stats.availableUnits}   icon="✅" color="green" onClick={() => navigate('/landlord/units?status=AVAILABLE')} />
          <StatCard label="Maintenance Units" value={stats.maintenanceUnits} icon="🔧" color="yellow" onClick={() => navigate('/landlord/units?status=MAINTENANCE')} />
        </div>
      )}

      {/* Charts & Activity Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#111827] to-[#1e293b] rounded-2xl border border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Rent Collection Trends (Last 6 Months)</h2>
              <p className="text-sm text-slate-500 mt-0.5">Monthly rent collection overview</p>
            </div>
            <button 
              onClick={() => navigate('/landlord/reports')}
              className="px-4 py-1.5 rounded-lg border border-slate-700/50 text-xs font-medium text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              View Detailed Report
            </button>
          </div>

          {revenueLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    color: '#e2e8f0',
                    fontSize: '13px',
                  }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ r: 4, fill: '#10b981', stroke: '#0b1120', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#0b1120', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#111827] rounded-2xl border border-slate-700/50 p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-100 mb-6">Recent Activity</h2>
          
          <div className="flex-1 overflow-y-auto space-y-5">
            {activityLoading ? (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <Spinner size="md" />
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center mt-10">No recent activity.</p>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className="flex gap-3 items-start">
                  <ActivityIcon action={log.action} />
                  <div>
                    <p className="text-sm text-slate-200 font-medium leading-tight">
                      {log.description || `${log.action} on ${log.entityType}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {timeAgo(log.createdAt)} · {log.actorEmail}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => navigate('/landlord/reports')}
            className="w-full mt-6 py-2.5 rounded-xl border border-slate-700/50 text-sm font-medium text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            View All Activity
          </button>
        </div>

      </div>
    </div>
  );
}