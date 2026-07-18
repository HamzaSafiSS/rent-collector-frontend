import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PortalLayout from '../../components/common/PortalLayout';
import { PageHeader, Table, Badge, Button, Spinner } from '../../components/common';
import { propertyApi } from '../../api/propertyApi';
import { unitApi } from '../../api/unitApi';
import { LANDLORD_NAV } from './landlordNav';

export default function GlobalUnitsPage() {
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
        setError('Failed to load global units.');
      } finally {
        setLoading(false);
      }
    }
    loadAllUnits();
  }, []);

  const columns = [
    { key: 'propertyName', header: 'Property', render: (r) => <span className="font-medium text-slate-700">{r.propertyName}</span> },
    { key: 'unitNumber',   header: 'Unit',     render: (r) => <span className="font-bold text-slate-800">{r.unitNumber}</span> },
    { key: 'status',       header: 'Status',   render: (r) => <Badge label={r.status} /> },
    { key: 'baseRent',     header: 'Base Rent',render: (r) => `ETB ${Number(r.baseRent).toLocaleString()}` },
    { key: 'actions',      header: 'Actions',  render: (r) => (
      <Button size="sm" variant="secondary" onClick={() => navigate(`/landlord/properties/${r.propertyId}`)}>View Property</Button>
    )}
  ];

  const filteredUnits = units.filter(u => filterStatus === 'ALL' || u.status === filterStatus);

  return (
    <PortalLayout navItems={LANDLORD_NAV} portalLabel="Landlord">
      <PageHeader title="Global Units" subtitle="Manage all units across your properties" />

      {error && <div className="mb-4 text-red-600 bg-red-50 p-4 rounded-xl">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
        {['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map((s) => {
          const count = s === 'ALL' ? units.length : units.filter((u) => u.status === s).length;
          const isSelected = filterStatus === s;
          return (
            <div 
              key={s} 
              onClick={() => setSearchParams(s === 'ALL' ? {} : { status: s })}
              className={`rounded-2xl p-6 border text-center shadow-sm relative overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 ${
              isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
            } ${
              s === 'AVAILABLE'   ? 'bg-white border-emerald-200/60'  :
              s === 'OCCUPIED'    ? 'bg-white border-blue-200/60'   :
              s === 'MAINTENANCE' ? 'bg-white border-amber-200/60'  :
                                    'bg-white border-slate-200/60'
            }`}>
              <div className={`absolute inset-0 opacity-10 ${
                s === 'AVAILABLE' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                s === 'OCCUPIED'  ? 'bg-gradient-to-br from-blue-400 to-indigo-600' :
                s === 'MAINTENANCE' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                                    'bg-gradient-to-br from-slate-400 to-slate-600'
              }`}></div>
              <p className={`text-3xl font-extrabold relative z-10 ${
                s === 'AVAILABLE' ? 'text-emerald-600' :
                s === 'OCCUPIED'  ? 'text-blue-600' :
                s === 'MAINTENANCE' ? 'text-amber-600' :
                                    'text-slate-700'
              }`}>{count}</p>
              <p className="text-xs font-bold mt-2 uppercase tracking-wider text-slate-500 relative z-10">{s}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">{filterStatus === 'ALL' ? 'All' : filterStatus} Units <span className="text-slate-400 font-medium text-base ml-1">({filteredUnits.length})</span></h2>
        </div>
        <Table
          columns={columns}
          data={filteredUnits}
          loading={loading}
          emptyMessage="No units match the current filter."
        />
      </div>
    </PortalLayout>
  );
}
