import api from './axios';

export const propertyApi = {

  createProperty: (data, imageFile) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('address', data.address);
    if (data.description) formData.append('description', data.description);
    if (imageFile) formData.append('image', imageFile);
    return api.post('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  listMyProperties: (page = 0, size = 20) =>
    api.get('/properties', { params: { page, size } }),

  getPropertyDetail: (id) =>
    api.get(`/properties/${id}`),

  updateProperty: (id, data, imageFile) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('address', data.address);
    if (data.description) formData.append('description', data.description);
    if (imageFile) formData.append('image', imageFile);
    return api.put(`/properties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteProperty: (id) =>
    api.delete(`/properties/${id}`),

  getPropertyImageUrl: (id) =>
    `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/properties/${id}/image`,

  getPropertyImageBlob: (id) =>
    api.get(`/properties/${id}/image`, { responseType: 'blob' }),

  // Admin view — all properties platform-wide
  listAllProperties: (page = 0, size = 20) =>
    api.get('/admin/properties', { params: { page, size } }),
};