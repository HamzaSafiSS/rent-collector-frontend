import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { 
  AdminLayout, 
  SuperAdminLayout, 
  LandlordLayout, 
  TenantLayout 
} from '../components/common/RoleLayouts';

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
const AdminDashboardViewPage    = lazy(() => import('../pages/admin/AdminDashboardViewPage'));
const LandlordDashboardViewPage = lazy(() => import('../pages/admin/LandlordDashboardViewPage'));
const TenantDashboardViewPage   = lazy(() => import('../pages/admin/TenantDashboardViewPage'));
const PropertyDashboardViewPage = lazy(() => import('../pages/admin/PropertyDashboardViewPage'));
const UnitDashboardViewPage     = lazy(() => import('../pages/admin/UnitDashboardViewPage'));
const LeaseDashboardViewPage    = lazy(() => import('../pages/admin/LeaseDashboardViewPage'));

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
        <Route path="/super-admin" element={<ProtectedRoute roles={['SUPER_ADMIN']}><SuperAdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="admins" element={<ManageAdminsPage />} />
          <Route path="audit-logs" element={<SuperAdminAuditLog />} />
          <Route path="view/:category" element={<SuperAdminViewList />} />
          <Route path="view/admin-dashboard/:adminId" element={<AdminDashboardViewPage />} />
          <Route path="view/landlord-dashboard/:landlordId" element={<LandlordDashboardViewPage />} />
          <Route path="view/tenant-dashboard/:id" element={<TenantDashboardViewPage />} />
          <Route path="view/property-dashboard/:id" element={<PropertyDashboardViewPage />} />
          <Route path="view/unit-dashboard/:id" element={<UnitDashboardViewPage />} />
          <Route path="view/lease-dashboard/:id" element={<LeaseDashboardViewPage />} />
        </Route>

        {/* ── Admin Routes ── */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="landlords" element={<ManageLandlordsPage />} />
          <Route path="tenants" element={<ManageTenantsPage />} />
          <Route path="audit-logs" element={<AdminAuditLog />} />
          <Route path="view/:category" element={<AdminViewList />} />
          <Route path="view/landlord-dashboard/:landlordId" element={<LandlordDashboardViewPage />} />
          <Route path="view/tenant-dashboard/:id" element={<TenantDashboardViewPage />} />
          <Route path="view/property-dashboard/:id" element={<PropertyDashboardViewPage />} />
          <Route path="view/unit-dashboard/:id" element={<UnitDashboardViewPage />} />
          <Route path="view/lease-dashboard/:id" element={<LeaseDashboardViewPage />} />
        </Route>

        {/* ── Landlord Routes ── */}
        <Route path="/landlord" element={<ProtectedRoute roles={['LANDLORD']}><LandlordLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<LandlordDashboard />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="units" element={<GlobalUnitsPage />} />
          <Route path="properties/:id" element={<PropertyDetailPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="leases" element={<LeasesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* ── Tenant Routes ── */}
        <Route path="/tenant" element={<ProtectedRoute roles={['TENANT']}><TenantLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<TenantDashboard />} />
          <Route path="lease" element={<MyLeasePage />} />
          <Route path="upload-payment" element={<UploadPaymentPage />} />
          <Route path="payments" element={<PaymentHistoryPage />} />
        </Route>

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