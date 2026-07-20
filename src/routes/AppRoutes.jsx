import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// ── Lazy-loaded pages — loaded only when needed, reduces initial bundle ────────

// Auth pages
const LoginPage           = lazy(() => import('../pages/auth/LoginPage'));
const LandlordSignupPage  = lazy(() => import('../pages/auth/LandlordSignupPage'));
const ChangePasswordPage  = lazy(() => import('../pages/auth/ChangePasswordPage'));

// Super Admin pages
const SuperAdminDashboard = lazy(() => import('../pages/super-admin/DashboardPage'));
const ManageAdminsPage    = lazy(() => import('../pages/super-admin/ManageAdminsPage'));
const SuperAdminAuditLog  = lazy(() => import('../pages/super-admin/AuditLogPage'));
const SuperAdminViewList  = lazy(() => import('../pages/super-admin/ViewListPage'));

// Admin pages
const AdminDashboard      = lazy(() => import('../pages/admin/DashboardPage'));
const ManageLandlordsPage = lazy(() => import('../pages/admin/ManageLandlordsPage'));
const ManageTenantsPage   = lazy(() => import('../pages/admin/ManageTenantsPage'));
const AdminAuditLog       = lazy(() => import('../pages/admin/AuditLogPage'));
const AdminViewList       = lazy(() => import('../pages/admin/ViewListPage'));

// Landlord pages
const LandlordDashboard   = lazy(() => import('../pages/landlord/DashboardPage'));
const PropertiesPage      = lazy(() => import('../pages/landlord/PropertiesPage'));
const PropertyDetailPage  = lazy(() => import('../pages/landlord/PropertyDetailPage'));
const GlobalUnitsPage     = lazy(() => import('../pages/landlord/GlobalUnitsPage'));
const TenantsPage         = lazy(() => import('../pages/landlord/TenantsPage'));
const LeasesPage          = lazy(() => import('../pages/landlord/LeasesPage'));
const PaymentsPage        = lazy(() => import('../pages/landlord/PaymentsPage'));
const ReportsPage         = lazy(() => import('../pages/landlord/ReportsPage'));

// Tenant pages
const TenantDashboard     = lazy(() => import('../pages/tenant/DashboardPage'));
const MyLeasePage         = lazy(() => import('../pages/tenant/MyLeasePage'));
const UploadPaymentPage   = lazy(() => import('../pages/tenant/UploadPaymentPage'));
const PaymentHistoryPage  = lazy(() => import('../pages/tenant/PaymentHistoryPage'));
const AccountSettingsPage = lazy(() => import('../pages/tenant/AccountSettingsPage'));

// ── Loading fallback ──────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );
}

// ── Root redirect — sends user to their dashboard if already logged in ─────────
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  switch (user?.role) {
    case 'SUPER_ADMIN': return <Navigate to="/super-admin/dashboard" replace />;
    case 'ADMIN':       return <Navigate to="/admin/dashboard" replace />;
    case 'LANDLORD':    return <Navigate to="/landlord/dashboard" replace />;
    case 'TENANT':      return <Navigate to="/tenant/dashboard" replace />;
    default:            return <Navigate to="/login" replace />;
  }
}

// ── Main routes ────────────────────────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* ── Root ── */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Public Auth Routes ── */}
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/signup"         element={<LandlordSignupPage />} />
        <Route path="/change-password" element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        } />

        {/* ── Super Admin Routes ── */}
        <Route path="/super-admin/dashboard" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/super-admin/admins" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <ManageAdminsPage />
          </ProtectedRoute>
        } />
        <Route path="/super-admin/audit-logs" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <SuperAdminAuditLog />
          </ProtectedRoute>
        } />
        <Route path="/super-admin/view/:category" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <SuperAdminViewList />
          </ProtectedRoute>
        } />

        {/* ── Admin Routes ── */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/landlords" element={
          <ProtectedRoute roles={['ADMIN']}>
            <ManageLandlordsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/tenants" element={
          <ProtectedRoute roles={['ADMIN']}>
            <ManageTenantsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/audit-logs" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminAuditLog />
          </ProtectedRoute>
        } />
        <Route path="/admin/view/:category" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminViewList />
          </ProtectedRoute>
        } />

        {/* ── Landlord Routes ── */}
        <Route path="/landlord/dashboard" element={
          <ProtectedRoute roles={['LANDLORD']}>
            <LandlordDashboard />
          </ProtectedRoute>
        } />
        <Route path="/landlord/properties" element={
          <ProtectedRoute roles={['LANDLORD']}>
            <PropertiesPage />
          </ProtectedRoute>
        } />
        <Route path="/landlord/units" element={
          <ProtectedRoute roles={['LANDLORD']}>
            <GlobalUnitsPage />
          </ProtectedRoute>
        } />
        <Route path="/landlord/properties/:id" element={
          <ProtectedRoute roles={['LANDLORD']}>
            <PropertyDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/landlord/tenants" element={
          <ProtectedRoute roles={['LANDLORD']}>
            <TenantsPage />
          </ProtectedRoute>
        } />
        <Route path="/landlord/leases" element={
          <ProtectedRoute roles={['LANDLORD']}>
            <LeasesPage />
          </ProtectedRoute>
        } />
        <Route path="/landlord/payments" element={
          <ProtectedRoute roles={['LANDLORD']}>
            <PaymentsPage />
          </ProtectedRoute>
        } />
        <Route path="/landlord/reports" element={
          <ProtectedRoute roles={['LANDLORD']}>
            <ReportsPage />
          </ProtectedRoute>
        } />

        {/* ── Tenant Routes ── */}
        <Route path="/tenant/dashboard" element={
          <ProtectedRoute roles={['TENANT']}>
            <TenantDashboard />
          </ProtectedRoute>
        } />
        <Route path="/tenant/lease" element={
          <ProtectedRoute roles={['TENANT']}>
            <MyLeasePage />
          </ProtectedRoute>
        } />
        <Route path="/tenant/upload-payment" element={
          <ProtectedRoute roles={['TENANT']}>
            <UploadPaymentPage />
          </ProtectedRoute>
        } />
        <Route path="/tenant/payments" element={
          <ProtectedRoute roles={['TENANT']}>
            <PaymentHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/tenant/settings" element={
          <ProtectedRoute roles={['TENANT']}>
            <AccountSettingsPage />
          </ProtectedRoute>
        } />

        {/* ── 404 Fallback ── */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-slate-700">404</h1>
            <p className="text-slate-500 mt-2">Page not found.</p>
            <a href="/" className="mt-4 text-primary-600 hover:underline">
              Go home
            </a>
          </div>
        } />

      </Routes>
    </Suspense>
  );
}