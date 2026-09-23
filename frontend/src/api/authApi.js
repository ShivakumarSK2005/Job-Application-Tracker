import api from './client';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data; // { token: "..." }
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data; // { id, name, email }
  },
};
