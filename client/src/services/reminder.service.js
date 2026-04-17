import api from '../app/axios';

export const reminderService = {
  getNotifications: async () => {
    const res = await api.get('/reminders');
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.patch(`/reminders/${id}/read`);
    return res.data;
  },
};
