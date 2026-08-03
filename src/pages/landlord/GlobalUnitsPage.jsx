import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader, Table, Badge, Button, Spinner } from '../../components/common';
import { propertyApi } from '../../api/propertyApi';
import { unitApi } from '../../api/unitApi';

export default function GlobalUnitsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterStatus = searchParams.get('status') || 'ALL';

  const [units, setUnits]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function loadAllUnits() {
      setLoading(true);
      try {
        // Fetch properties
        const propRes = await propertyApi.listMyProperties(0, 100);
        const properties = propRes.data?.data?.content || [];

        // Fetch units for each property
        const unitPromises = properties.map(async (p) => {
          try {
            const uRes = await unitApi.listUnits(p.id, 0, 200);
            const propertyUnits = uRes.data?.data?.content || [];
            return propertyUnits.map(u => ({ ...u, propertyName: p.name, propertyId: p.id }));
          } catch {
            return [];
          }
        });

        const unitsArrays = await Promise.all(unitPromises);
        setUnits(unitsArrays.flat());
      } catch (err) {
        setError(t('units.failedLoadGlobalUnits'));
      } finally {
        setLoading(false);
      }
    }
    loadAllUnits();
  }, [t]);

  const columns = [
    { key: 'propertyName', header: t('units.property'), render: (r) => <span className="font-medium text-slate-300">{r.propertyName}</span> },
    { key: 'unitNumber',   header: t('units.unit'),     render: (r) => <span className="font-bold text-slate-100">{r.unitNumber}</span> },
    { key: 'status',       header: t('units.status'),   render: (r) => <Badge label={r.status ? t(`common.status${r.status.charAt(0) + r.status.slice(1).toLowerCase()}`, { defaultValue: r.status }) : ''} /> },
    { key: 'baseRent',     header: t('units.baseRent'),render: (r) => `ETB ${Number(r.baseRent).toLocaleString()}` },
    { key: 'actions',      header: t('common.actions'),  render: (r) => (
      <Button size="sm" variant="secondary" onClick={() => navigate(`/landlord/properties/${r.propertyId}`)}>{t('common.viewProperty')}</Button>
    )}
  ];

  const filteredUnits = units.filter(u => filterStatus === 'ALL' || u.status === filterStatus);

  return (
    <>
      <PageHeader title={t('units.globalUnitsTitle')} subtitle={t('units.globalUnitsSubtitle')} />

      {error && <div className="mb-4 text-red-400 bg-red-500/10 p-4 rounded-xl">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        {['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map((s) => {
          const count = s === 'ALL' ? units.length : units.filter((u) => u.status === s).length;
          const isSelected = filterStatus === s;
          const labelText = s === 'ALL' ? t('common.all') : t(`dashboard.${s.toLowerCase()}Units`, { defaultValue: s });
          return (
            <div 
              key={s} 
              onClick={() => setSearchParams(s === 'ALL' ? {} : { status: s })}
              className={`rounded-2xl p-6 border text-center shadow-sm relative overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 ${
              isSelected ? 'ring-2 ring-emerald-500/50 shadow-md' : ''
            } ${
              s === 'AVAILABLE'   ? 'bg-[#111827] border-emerald-500/20'  :
              s === 'OCCUPIED'    ? 'bg-[#111827] border-sky-500/20'   :
              s === 'MAINTENANCE' ? 'bg-[#111827] border-amber-500/20'  :
                                    'bg-[#111827] border-slate-700/50/60'
            }`}>
              <div className={`absolute inset-0 opacity-10 ${
                s === 'AVAILABLE' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                s === 'OCCUPIED'  ? 'bg-gradient-to-br from-blue-400 to-indigo-600' :
                s === 'MAINTENANCE' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                                    'bg-gradient-to-br from-slate-400 to-slate-600'
              }`}></div>
              <p className={`text-3xl font-extrabold relative z-10 ${
                s === 'AVAILABLE' ? 'text-emerald-400' :
                s === 'OCCUPIED'  ? 'text-emerald-400' :
                s === 'MAINTENANCE' ? 'text-amber-600' :
                                    'text-slate-300'
              }`}>{count}</p>
              <p className="text-xs font-bold mt-2 uppercase tracking-wider text-slate-500 relative z-10">{labelText}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100">{filterStatus === 'ALL' ? t('units.allUnits') : t(`common.status${filterStatus.charAt(0) + filterStatus.slice(1).toLowerCase()}`, { defaultValue: filterStatus })} <span className="text-slate-400 font-medium text-base ml-1">({filteredUnits.length})</span></h2>
        </div>
        <Table
          columns={columns}
          data={filteredUnits}
          loading={loading}
          emptyMessage={t('common.noResultsFilter')}
        />
      </div>
    </>
  );
}
