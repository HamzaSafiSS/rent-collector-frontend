import api from './axios';

export const auditApi = {

  getAuditLogs: (params = {}) =>
    api.get('/audit-logs', { params, _skipRefresh: true }),
  // params: { actorId, action, entityType, entityId, from, to, page, size }

  getAuditLogById: (id) =>
    api.get(`/audit-logs/${id}`, { _skipRefresh: true }),
};