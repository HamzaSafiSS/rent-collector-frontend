import api from './axios';

export const leaseApi = {

  createLease: (data) =>
    api.post('/leases', data),

  listLeases: (page = 0, size = 20, status = null) =>
    api.get('/leases', {
      params: { page, size, ...(status && { status }) },
    }),

  getLeaseDetail: (id) =>
    api.get(`/leases/${id}`),

  terminateLease: (id, reason = null) =>
    api.patch(`/leases/${id}/terminate`, reason ? { reason } : {}),

  getTenantLeaseHistory: (tenantId, page = 0, size = 20) =>
    api.get(`/tenants/${tenantId}/leases`, { params: { page, size } }),
};