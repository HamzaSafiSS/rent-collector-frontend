import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, StatCard, StatCardsSkeleton, Alert } from '../../components/common';
import { leaseApi } from '../../api/leaseApi';
import { paymentApi } from '../../api/paymentApi';

export default function TenantDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [leaseRes, payRes] = await Promise.all([
          leaseApi.getMyLeases(0, 100, 'ACTIVE'), 
          paymentApi.getMyPayments({ page: 0, size: 500 }), 
        ]);
        
        const leases = leaseRes.data?.data?.content || [];
        const activeLeases = leaseRes.data?.data?.totalElements || 0;
        const payments = payRes.data?.data?.content || [];
        
        let pendingPayments = 0;
        let rejectedPayments = 0;
        
        payments.forEach(p => {
            if (p.status === 'PENDING') pendingPayments++;
            if (p.status === 'REJECTED') rejectedPayments++;
        });

        const currentDate = new Date();
        let unpaidLeases = 0;
        let dueSoonLeases = 0;

        leases.forEach(lease => {
            const leasePayments = payments.filter(p => p.leaseId === lease.id && ['APPROVED', 'PENDING'].includes(p.status));
            leasePayments.sort((a, b) => b.paymentMonth.localeCompare(a.paymentMonth));
            
            const latestPayment = leasePayments[0];
            
            let targetYearMonthStr;
            let sourceMonthStr = !latestPayment ? lease.startDate.substring(0, 7) : latestPayment.paymentMonth;
            
            const parts = sourceMonthStr.split('-');
            let y = parseInt(parts[0], 10);
            let m = parseInt(parts[1], 10);
            m += 1;
            if (m > 12) { m = 1; y += 1; }
            targetYearMonthStr = `${y}-${String(m).padStart(2, '0')}`;

            const targetParts = targetYearMonthStr.split('-');
            const targetYear = parseInt(targetParts[0], 10);
            const targetMonth = parseInt(targetParts[1], 10) - 1;
            
            const startDateObj = new Date(lease.startDate);
            const startDay = startDateObj.getDate();
            
            const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
            const dueDay = Math.min(startDay, lastDayOfTargetMonth);
            
            const dueDateObj = new Date(targetYear, targetMonth, dueDay);
            dueDateObj.setHours(23, 59, 59, 999);
            
            if (currentDate > dueDateObj) {
                unpaidLeases++;
            } else {
                const diffTime = dueDateObj.getTime() - currentDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays >= 0 && diffDays <= 3) {
                    dueSoonLeases++;
                }
            }
        });

        setStats({
          activeLeases,
          pendingPayments,
          rejectedPayments,
          unpaidLeases,
          dueSoonLeases
        });
      } catch (err) {
        setError(
          err.response?.data?.message || t('dashboard.failedLoadData')
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [t]);

  return (
    <div>
      <PageHeader title={t('dashboard.myDashboard')} subtitle={t('dashboard.rentalSummary')} />

      {error && <Alert type="error" message={error} className="mb-4" />}

      {loading ? (
        <StatCardsSkeleton count={3} />
      ) : !stats && !error ? (
        <p className="text-slate-500 text-sm">{t('dashboard.couldNotLoadStats')}</p>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label={t('dashboard.activeLeases')}    
            value={stats.activeLeases}  
            icon={<svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} 
            color="blue" 
            onClick={() => navigate('/tenant/lease?status=ACTIVE')} 
          />
          <StatCard 
            label={t('payments.pendingPayments')} 
            value={stats.pendingPayments} 
            icon={<svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
            color="yellow" 
            onClick={() => navigate('/tenant/payments?status=PENDING')} 
          />
          <StatCard 
            label={t('payments.rejectedPayments')} 
            value={stats.rejectedPayments} 
            icon={<svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>} 
            color="red" 
            onClick={() => navigate('/tenant/payments?status=REJECTED')} 
          />
          <StatCard 
            label={t('dashboard.unpaidLeases')} 
            value={stats.unpaidLeases} 
            icon={<svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} 
            color="orange" 
            onClick={() => navigate('/tenant/payments')} 
          />
          {stats.dueSoonLeases > 0 && (
            <StatCard 
              label={t('dashboard.dueSoonLabel')}
              value={stats.dueSoonLeases} 
              icon={<svg className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
              color="indigo" 
              onClick={() => navigate('/tenant/payments')} 
            />
          )}
        </div>
      ) : null}
    </div>
  );
}