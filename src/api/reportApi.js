import api from './axios';

export const reportApi = {

  getPaymentReport: (params = {}) =>
    api.get('/reports/payments', { params }),
  // params: { from, to, propertyId }

  getOccupancyReport: (params = {}) =>
    api.get('/reports/occupancy', { params }),
  // params: { propertyId }

  getTenantReport: (params = {}) =>
    api.get('/reports/tenants', { params }),
  // params: { propertyId, status }

  getRevenueReport: (params = {}) =>
    api.get('/reports/revenue', { params }),
  // params: { year, propertyId }

  getAdminOverview: () =>
    api.get('/admin/reports/overview'),
};