import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import PortalLayout from './PortalLayout';
import { LANDLORD_NAV } from '../../pages/landlord/landlordNav';
import { TENANT_NAV } from '../../pages/tenant/tenantNav';

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { label: 'Landlords', to: '/admin/landlords', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" /></svg> },
  { label: 'Tenants', to: '/admin/tenants', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
];

const SUPER_ADMIN_NAV = [
  { label: 'Dashboard',     to: '/super-admin/dashboard',  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { label: 'Manage Admins', to: '/super-admin/admins',     icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { label: 'Audit Logs',    to: '/super-admin/audit-logs', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
];

function PageLoaderInner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
    </div>
  );
}

export function AdminLayout() {
  return (
    <PortalLayout navItems={ADMIN_NAV} portalLabel="Admin">
      <Suspense fallback={<PageLoaderInner />}>
        <Outlet />
      </Suspense>
    </PortalLayout>
  );
}

export function SuperAdminLayout() {
  return (
    <PortalLayout navItems={SUPER_ADMIN_NAV} portalLabel="Super Admin">
      <Suspense fallback={<PageLoaderInner />}>
        <Outlet />
      </Suspense>
    </PortalLayout>
  );
}

export function LandlordLayout() {
  return (
    <PortalLayout navItems={LANDLORD_NAV} portalLabel="Landlord">
      <Suspense fallback={<PageLoaderInner />}>
        <Outlet />
      </Suspense>
    </PortalLayout>
  );
}

export function TenantLayout() {
  return (
    <PortalLayout navItems={TENANT_NAV} portalLabel="Tenant">
      <Suspense fallback={<PageLoaderInner />}>
        <Outlet />
      </Suspense>
    </PortalLayout>
  );
}
