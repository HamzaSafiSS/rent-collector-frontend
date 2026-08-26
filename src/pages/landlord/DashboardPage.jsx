import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StatCard, PageHeader, Spinner, Badge } from '../../components/common';
import { reportApi } from '../../api/reportApi';
import { propertyApi } from '../../api/propertyApi';
import { auditApi } from '../../api/auditApi';
import { formatRelativeTime } from '../../utils/dateUtils';
import { StatCardsSkeleton } from '../../components/common';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function LandlordDashboard() {
  const { t }                 = useTranslation();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const navigate = useNavigate();

  const timeAgo = (dateString) => formatRelativeTime(dateString, t);

  const ActivityIcon = ({ action }) => {
    if (action?.includes('PAYMENT')) return <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm shrink-0 border border-emerald-500/20">💳</div>;
    if (action?.includes('LEASE')) return <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm shrink-0 border border-emerald-500/20">📄</div>;
    if (action?.includes('TENANT')) return <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-sm shrink-0 border border-emerald-500/20">👤</div>;
    if (action?.includes('UNIT') || action?.includes('PROPERTY')) return <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm shrink-0 border border-slate-200 dark:border-slate-700">🏢</div>;
    return <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm shrink-0 border border-slate-200 dark:border-slate-700">📝</div>;
  };

  const getActionLabel = (log) => {
    if (log.action) {
      return t(`audit.action_${log.action}`, {
        defaultValue: log.action
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/^\w/, (c) => c.toUpperCase())
      });
    }
    return log.description || t('audit.action');
  };

  useEffect(() => {
    async function load() {
      try {
        const [propRes, occRes, payRes] = await Promise.all([
          propertyApi.listMyProperties(0, 1),
          reportApi.getOccupancyReport({}),
          reportApi.getPaymentReport({}),
        ]);
        setStats({
          totalProperties:   propRes.data?.data?.totalElements ?? 0,
          occupiedUnits:     occRes.data?.data?.occupiedUnits  ?? 0,
          availableUnits:    occRes.data?.data?.availableUnits ?? 0,
          maintenanceUnits:  occRes.data?.data?.maintenanceUnits ?? 0,
          totalUnits:        occRes.data?.data?.totalUnits     ?? 0,
          occupancyRate:     occRes.data?.data?.occupancyRate  ?? 0,
          dueSoonCount:      payRes.data?.data?.dueSoonCount   ?? 0,
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
        const res = await auditApi.getAuditLogs({ size: 7 });
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
        const today = new Date();
        const currentYear = today.getFullYear();
        
        const [resCurrent, resPrev] = await Promise.all([
          reportApi.getRevenueReport({ year: currentYear }).catch(() => null),
          reportApi.getRevenueReport({ year: currentYear - 1 }).catch(() => null)
        ]);

        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        const parseMonthly = (res) => {
          if (!res) return Array(12).fill(0);
          const dataObj = res.data?.data;
          const monthly = dataObj?.byMonth || dataObj?.monthlyRevenue || (Array.isArray(dataObj) ? dataObj : []);
          
          let parsed = Array(12).fill(0);
          if (Array.isArray(monthly)) {
            monthly.forEach((item, idx) => {
              let mIdx = idx;
              if (item.month !== undefined) {
                if (typeof item.month === 'number') {
                  mIdx = item.month - 1;
                } else if (typeof item.month === 'string') {
                  if (item.month.includes('-')) {
                    const parts = item.month.split('-');
                    if (parts.length >= 2) {
                      mIdx = parseInt(parts[1], 10) - 1;
                    }
                  } else {
                    const num = parseInt(item.month, 10);
                    if (!isNaN(num)) {
                      mIdx = num - 1;
                    } else {
                      const formatted = item.month.charAt(0).toUpperCase() + item.month.slice(1, 3).toLowerCase();
                      const found = months.indexOf(formatted);
                      if (found >= 0) mIdx = found;
                    }
                  }
                }
              }
              if (mIdx >= 0 && mIdx < 12) {
                parsed[mIdx] = Number(item.revenue ?? item.amount ?? item.total ?? 0);
              }
            });
          } else if (typeof monthly === 'object') {
            Object.entries(monthly).forEach(([key, value]) => {
              const parts = key.split('-');
              if (parts.length >= 2) {
                const mIdx = parseInt(parts[1], 10) - 1;
                if (mIdx >= 0 && mIdx < 12) parsed[mIdx] = typeof value === 'number' ? value : Number(value || 0);
              } else {
                const mIdx = months.indexOf(key);
                if (mIdx >= 0) parsed[mIdx] = typeof value === 'number' ? value : Number(value || 0);
              }
            });
          }
          return parsed;
        };

        const currentYearData = parseMonthly(resCurrent);
        const prevYearData = parseMonthly(resPrev);

        let chartData = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - 1 - i, 1);
          const y = d.getFullYear();
          const m = d.getMonth();
          const revenue = y === currentYear ? currentYearData[m] : (y === currentYear - 1 ? prevYearData[m] : 0);
          
          let monthLabel = months[m];
          
          chartData.push({
            month: monthLabel,
            revenue: revenue || 0
          });
        }
        setRevenueData(chartData);
      } catch {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const today = new Date();
        let chartData = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - 1 - i, 1);
          const y = d.getFullYear();
          const m = d.getMonth();
          
          let monthLabel = months[m];
          
          chartData.push({ month: monthLabel, revenue: 0 });
        }
        setRevenueData(chartData);
      } finally {
        setRevenueLoading(false);
      }
    }
    loadRevenue();
  }, []);

  return (
    <div>
      <PageHeader title={t('dashboard.landlordTitle')}/>

      {loading ? (
        <StatCardsSkeleton count={6} />
      ) : !stats ? (
        <p className="text-slate-400 text-sm">{t('common.couldNotLoadStats')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            label={t('dashboard.myProperties')}
            value={stats.totalProperties}
            icon={<svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" /></svg>}
            color="blue" 
            onClick={() => navigate('/landlord/properties')} 
          />
          <StatCard 
            label={t('dashboard.totalUnits')}      
            value={stats.totalUnits}       
            icon={<svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} 
            color="slate" 
            onClick={() => navigate('/landlord/units?status=ALL')} 
          />
          <StatCard 
            label={t('dashboard.occupiedUnits')}   
            value={stats.occupiedUnits}    
            icon={<svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} 
            color="green" 
            subtitle={t('dashboard.occupancy', { rate: stats.occupancyRate })} 
            onClick={() => navigate('/landlord/units?status=OCCUPIED')} 
          />
          <StatCard 
            label={t('dashboard.availableUnits')}  
            value={stats.availableUnits}   
            icon={<svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
            color="green" 
            onClick={() => navigate('/landlord/units?status=AVAILABLE')} 
          />
          <StatCard 
            label={t('dashboard.maintenanceUnits')} 
            value={stats.maintenanceUnits} 
            icon={<svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} 
            color="yellow" 
            onClick={() => navigate('/landlord/units?status=MAINTENANCE')} 
          />
          <StatCard 
            label={t('dashboard.dueSoon')}
            value={stats.dueSoonCount}
            icon={<svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="orange" 
            onClick={() => navigate('/landlord/due-soon')} 
          />
        </div>
      )}

      {/* Charts & Activity Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gradient-to-br dark:from-[#111827] dark:to-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('dashboard.revenueTitle')}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{t('dashboard.revenueSubtitle')}</p>
            </div>
            <button 
              onClick={() => navigate('/landlord/reports')}
              className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {t('dashboard.viewDetailedReport')}
            </button>
          </div>

          {revenueLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={revenueData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid-color)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--chart-text-color)', fontSize: 13, fontWeight: 500 }}
                  axisLine={{ stroke: 'var(--chart-axis-color)' }}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: 'var(--chart-text-color)', fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100000]}
                  ticks={[0, 20000, 40000, 60000, 80000, 100000]}
                  tickFormatter={(v) => v >= 1000000 ? `ETB ${(v / 1000000).toFixed(0)}M` : (v >= 1000 ? `ETB ${(v / 1000).toFixed(0)}k` : `ETB ${v}`)}
                  dx={-10}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(150, 150, 150, 0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 shadow-xl text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          ETB {Number(payload[0].value).toLocaleString()}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                  fillOpacity={0.8}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">{t('dashboard.recentActivity')}</h2>
          
          <div className="flex-1 overflow-y-auto space-y-5">
            {activityLoading ? (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <Spinner size="md" />
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center mt-10">{t('dashboard.noRecentActivity')}</p>
            ) : (
              recentActivity.map((log) => (
                <div key={log.id} className="flex gap-3 items-start">
                  <ActivityIcon action={log.action} />
                  <div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-tight">
                      {getActionLabel(log)}{log.actorEmail ? `: ${log.actorEmail}` : ''}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {timeAgo(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}