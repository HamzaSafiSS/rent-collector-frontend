import api from './axios';

export const authApi = {

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  signup: (fullName, email, password, phoneNumber) =>
    api.post('/auth/signup', { fullName, email, password, phoneNumber }),

  logout: () =>
    api.post('/auth/logout'),

  refresh: () =>
    api.post('/auth/refresh'),

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  getMyProfile: () =>
    api.get('/users/me'),
};