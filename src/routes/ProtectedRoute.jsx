import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function ProtectedRoute({
  children,
  roles = [],
  redirectTo = '/login',
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to={getDashboardForRole(user.role)} replace />;
  }

  return children;
}

function getDashboardForRole(role) {
  switch (role) {
    case 'SUPER_ADMIN': return '/super-admin/dashboard';
    case 'ADMIN':       return '/admin/dashboard';
    case 'LANDLORD':    return '/landlord/dashboard';
    case 'TENANT':      return '/tenant/dashboard';
    default:            return '/login';
  }
}