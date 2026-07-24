import api from './axios';

export const adminApi = {

  // ── Super Admin — Admin management ───────────────────────────────────────
  createAdmin: (data) =>
    api.post('/super-admin/admins', data),

  listAdmins: (page = 0, size = 20) =>
    api.get('/super-admin/admins', { params: { page, size } }),

  getAdmin: (id) =>
    api.get(`/super-admin/admins/${id}`),

  updateAdmin: (id, data) =>
    api.put(`/super-admin/admins/${id}`, data),

  suspendAdmin: (id) =>
    api.patch(`/super-admin/admins/${id}/suspend`),

  activateAdmin: (id) =>
    api.patch(`/super-admin/admins/${id}/activate`),

  deleteAdmin: (id) =>
    api.delete(`/super-admin/admins/${id}`),

  // ── Admin — Landlord management ──────────────────────────────────────────
  listLandlords: (page = 0, size = 20) =>
    api.get('/users/landlords', { params: { page, size } }),

  getLandlord: (id) =>
    api.get(`/users/landlords/${id}`),

  suspendLandlord: (id) =>
    api.patch(`/users/landlords/${id}/suspend`),

  activateLandlord: (id) =>
    api.patch(`/users/landlords/${id}/activate`),

  // ── Admin — Platform-wide leases ─────────────────────────────────────────
  listAllLeases: (page = 0, size = 20) =>
    api.get('/admin/leases', { params: { page, size } }),

  // ── Admin — Landlord scoped read-only views ──────────────────────────────
  getLandlordProperties: (id, page = 0, size = 20) =>
    api.get(`/admin/landlords/${id}/properties`, { params: { page, size } }),

  getLandlordTenants: (id, page = 0, size = 20, propertyId = null) =>
    api.get(`/tenants/admin/landlords/${id}`, { params: { page, size, ...(propertyId && { propertyId }) } }),

  getLandlordLeases: (id, page = 0, size = 20) =>
    api.get(`/admin/landlords/${id}/leases`, { params: { page, size } }),

  // ── Admin — Tenant scoped read-only views ────────────────────────────────
  getTenantLeases: (id, page = 0, size = 20) =>
    api.get(`/admin/tenants/${id}/leases`, { params: { page, size } }),

  getTenantPayments: (id, page = 0, size = 20) =>
    api.get(`/admin/tenants/${id}/payments`, { params: { page, size } }),

  // ── Admin — Property scoped read-only views ──────────────────────────────
  getPropertyLeases: (id, page = 0, size = 20) =>
    api.get(`/admin/properties/${id}/leases`, { params: { page, size } }),

  // ── Admin — Unit scoped read-only views ──────────────────────────────────
  getUnitLeases: (id, page = 0, size = 20) =>
    api.get(`/admin/units/${id}/leases`, { params: { page, size } }),

  // ── Admin — Lease scoped read-only views ─────────────────────────────────
  getLeasePayments: (id, page = 0, size = 20) =>
    api.get(`/admin/leases/${id}/payments`, { params: { page, size } }),
};