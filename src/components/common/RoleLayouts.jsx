import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import PortalLayout from './PortalLayout';
import { LANDLORD_NAV } from '../../pages/landlord/landlordNav';
import { TENANT_NAV } from '../../pages/tenant/tenantNav';

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: '📊' },
  { label: 'Landlords', to: '/admin/landlords', icon: '🏢' },
  { label: 'Tenants', to: '/admin/tenants', icon: '👥' },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: '📋' },
];

const SUPER_ADMIN_NAV = [
  { label: 'Dashboard',     to: '/super-admin/dashboard',  icon: '📊' },
  { label: 'Manage Admins', to: '/super-admin/admins',     icon: '🛡️' },
  { label: 'Audit Logs',    to: '/super-admin/audit-logs', icon: '📋' },
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
