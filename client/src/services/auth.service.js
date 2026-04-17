import api from '../app/axios';

export const authService = {
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  verifyEmail: async (data) => {
    const res = await api.post('/auth/verify-email', data);
    return res.data;
  },
  resendVerification: async (data) => {
    const res = await api.post('/auth/resend-verification', data);
    return res.data;
  },
  login: async (data) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
