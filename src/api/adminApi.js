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
};