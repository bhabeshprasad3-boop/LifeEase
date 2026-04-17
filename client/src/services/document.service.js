import api from '../app/axios';

export const documentService = {
  create: async (formData) => {
    const res = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getAll: async (params = {}) => {
    const res = await api.get('/documents', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.patch(`/documents/${id}`, data);
    return res.data;
  },
  archive: async (id) => {
    const res = await api.patch(`/documents/${id}/archive`);
    return res.data;
  },
  unarchive: async (id) => {
    const res = await api.patch(`/documents/${id}/unarchive`);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
};
