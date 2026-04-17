import api from '../app/axios';

export const profileService = {
  getProfile: async () => {
    const res = await api.get('/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.patch('/profile', data);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await api.patch('/profile/change-password', data);
    return res.data;
  },
  updateReminderPreferences: async (data) => {
    const res = await api.patch('/profile/reminder-preferences', data);
    return res.data;
  },
};
