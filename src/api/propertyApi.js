import api from './axios';

export const propertyApi = {

  createProperty: (data) =>
    api.post('/properties', data),

  listMyProperties: (page = 0, size = 20) =>
    api.get('/properties', { params: { page, size } }),

  getPropertyDetail: (id) =>
    api.get(`/properties/${id}`),

  updateProperty: (id, data) =>
    api.put(`/properties/${id}`, data),

  deleteProperty: (id) =>
    api.delete(`/properties/${id}`),

  // Admin view — all properties platform-wide
  listAllProperties: (page = 0, size = 20) =>
    api.get('/admin/properties', { params: { page, size } }),
};