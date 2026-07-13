import api from './axios';

export const unitApi = {

  // Bulk create — prefix + numberOfUnits
  createUnits: (propertyId, data) =>
    api.post(`/properties/${propertyId}/units`, data),

  listUnits: (propertyId, page = 0, size = 50) =>
    api.get(`/properties/${propertyId}/units`, { params: { page, size } }),

  getUnit: (propertyId, unitId) =>
    api.get(`/properties/${propertyId}/units/${unitId}`),

  updateUnit: (propertyId, unitId, data) =>
    api.put(`/properties/${propertyId}/units/${unitId}`, data),

  setMaintenance: (propertyId, unitId) =>
    api.patch(`/properties/${propertyId}/units/${unitId}/maintenance`),

  setAvailable: (propertyId, unitId) =>
    api.patch(`/properties/${propertyId}/units/${unitId}/available`),

  deleteUnit: (propertyId, unitId) =>
    api.delete(`/properties/${propertyId}/units/${unitId}`),
};