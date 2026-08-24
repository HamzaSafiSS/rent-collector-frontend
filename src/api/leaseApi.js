import api from './axios';

export const leaseApi = {

  // ── Landlord endpoints ────────────────────────────────────────────────────
  createLease: (data, agreementDocument) => {
    const formData = new FormData();
    if (data.tenantEmail) formData.append('tenantEmail', data.tenantEmail);
    if (data.tenantName) formData.append('tenantName', data.tenantName);
    if (data.tenantPhone) formData.append('tenantPhone', data.tenantPhone);
    if (data.tenantId) formData.append('tenantId', data.tenantId);
    formData.append('unitId', data.unitId);
    formData.append('startDate', data.startDate);
    formData.append('monthlyRent', data.monthlyRent);
    if (agreementDocument) formData.append('agreementDocument', agreementDocument);

    return api.post('/leases', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  listLeases: (page = 0, size = 20, status = null, propertyId = null) =>
    api.get('/leases', {
      params: { page, size, ...(status && { status }), ...(propertyId && { propertyId }) },
    }),

  getLeaseDetail: (id) =>
    api.get(`/leases/${id}`),

  getDocumentBlob: (id) =>
    api.get(`/leases/${id}/document`, { responseType: 'blob' }),

  terminateLease: (id, reason = null) =>
    api.patch(`/leases/${id}/terminate`, reason ? { reason } : {}),

  getTenantLeaseHistory: (tenantId, page = 0, size = 20) =>
    api.get(`/tenants/${tenantId}/leases`, { params: { page, size } }),

  // ── Tenant endpoint — scoped to the logged-in tenant only ─────────────────
  // Uses /tenant/my-leases which the backend scopes to the authenticated user.
  // Tenants must NOT call /leases (landlord-only endpoint).
  getMyLeases: (page = 0, size = 50, status = null) =>
    api.get('/tenant/my-leases', {
      params: { page, size, ...(status && { status }) },
    }),
};