import api from './axios';

export const tenantApi = {

  listTenants: (page = 0, size = 20, propertyId = null) =>
    api.get('/tenants', { params: { page, size, ...(propertyId && { propertyId }) } }),

  getTenant: (id) =>
    api.get(`/tenants/${id}`),

  updateTenant: (id, data) =>
    api.put(`/tenants/${id}`, data),

  deleteTenant: (id) =>
    api.delete(`/tenants/${id}`),

  // Admin view — all tenants platform-wide
  listAllTenants: (page = 0, size = 20) =>
    api.get('/tenants/all', { params: { page, size } }),
};