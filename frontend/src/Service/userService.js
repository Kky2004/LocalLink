import api from './api';

export const userService = {
  updateProfile: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};
