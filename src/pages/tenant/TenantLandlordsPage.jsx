import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, Table, Badge, Alert, TableSkeleton } from '../../components/common';
import { leaseApi } from '../../api/leaseApi';
import { useToast } from '../../context/ToastContext';

export default function TenantLandlordsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [landlords, setLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');

    leaseApi.getMyLeases(0, 50, 'ACTIVE')
      .then((res) => {
        if (ignore) return;
        const leases = res.data?.data?.content || [];
        const landlordMap = new Map();

        leases.forEach((lease) => {
          if (lease.landlordFullName || lease.landlordPhone || lease.landlordEmail) {
            const key = (lease.landlordEmail || lease.landlordPhone || lease.landlordFullName || '').toLowerCase();
            if (!landlordMap.has(key)) {
              landlordMap.set(key, {
                id: key,
                name: lease.landlordFullName,
                phone: lease.landlordPhone,
                email: lease.landlordEmail,
                property: lease.propertyName,
                unitNumber: lease.unitNumber,
                monthlyRent: lease.monthlyRent,
                status: lease.status || 'ACTIVE',
              });
            }
          }
        });

        setLandlords(Array.from(landlordMap.values()));
      })
      .catch((err) => {
        if (!ignore) setError(err.response?.data?.message || t('common.failedToLoadData', 'Failed to load data.'));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [t]);

  const filteredLandlords = useMemo(() => {
    if (!searchQuery.trim()) return landlords;
    const q = searchQuery.toLowerCase().trim();
    return landlords.filter(
      (l) =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.phone && l.phone.toLowerCase().includes(q)) ||
        (l.property && l.property.toLowerCase().includes(q)) ||
        (l.unitNumber && l.unitNumber.toLowerCase().includes(q))
    );
  }, [landlords, searchQuery]);

  function copyToClipboard(text, successMessage) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(successMessage);
  }

  const columns = [
    {
      key: 'name',
      header: t('tenant.landlordName', 'Landlord Name'),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase shrink-0">
            {row.name?.charAt(0) || 'L'}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {row.name || t('common.landlord', 'Landlord')}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('common.landlord', 'Landlord')}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: t('payments.phone', 'Phone Number'),
      render: (row) =>
        row.phone ? (
          <div className="flex items-center gap-2">
            <a
              href={`tel:${row.phone}`}
              className="inline-flex items-center gap-1.5 font-mono text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
              title={t('common.call', 'Call')}
            >
              <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{row.phone}</span>
            </a>
            <button
              type="button"
              onClick={() => copyToClipboard(row.phone, t('common.phoneCopied', 'Phone number copied to clipboard!'))}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title={t('common.copy', 'Copy')}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        ) : (
          <span className="text-slate-400 italic">—</span>
        ),
    },
    {
      key: 'email',
      header: t('auth.emailLabel', 'Email'),
      render: (row) =>
        row.email ? (
          <div className="flex items-center gap-2">
            <a
              href={`mailto:${row.email}`}
              className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline truncate max-w-[220px]"
              title={row.email}
            >
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{row.email}</span>
            </a>
            <button
              type="button"
              onClick={() => copyToClipboard(row.email, t('common.emailCopied', 'Email address copied to clipboard!'))}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title={t('common.copy', 'Copy')}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        ) : (
          <span className="text-slate-400 italic">—</span>
        ),
    },
    {
      key: 'property',
      header: t('tenant.propertyAndUnit', 'Property & Unit'),
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">
            {row.property || t('properties.unnamedProperty', 'Property')}
          </p>
          {row.unitNumber && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('units.unit', 'Unit')} {row.unitNumber}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'monthlyRent',
      header: t('leases.monthlyRent', 'Monthly Rent'),
      render: (row) =>
        row.monthlyRent ? (
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            ETB {Number(row.monthlyRent).toLocaleString()}
          </span>
        ) : (
          <span className="text-slate-400 italic">—</span>
        ),
    },
    {
      key: 'status',
      header: t('leases.status', 'Status'),
      render: (row) => (
        <Badge
          statusKey={row.status}
          label={t(`common.status${row.status?.charAt(0) + row.status?.slice(1).toLowerCase()}`, { defaultValue: row.status })}
        />
      ),
    },
    {
      key: 'actions',
      header: t('common.actions', 'Actions'),
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.phone && (
            <a
              href={`tel:${row.phone}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t('common.call', 'Call')}
            </a>
          )}
          {row.email && (
            <a
              href={`mailto:${row.email}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('common.email', 'Email')}
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t('nav.landlords', 'Landlords')}
        subtitle={
          landlords.length === 1
            ? t('common.recordsSingular', { count: 1 })
            : t('common.records', { count: landlords.length })
        }
      />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('tenant.searchLandlordsPlaceholder', 'Search by name, phone, email, property...')}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm shadow-sm"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {loading ? (
        <TableSkeleton rows={4} cols={columns.length} />
      ) : (
        <Table
          columns={columns}
          data={filteredLandlords}
          emptyMessage={
            searchQuery
              ? t('common.noResultsFilter', 'No results match the current filter.')
              : t('tenant.noLandlordFound', 'No active landlord found.')
          }
        />
      )}
    </>
  );
}
