import api from './client';

export const dashboardApi = {
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data; // { totalApplications, applied, onlineAssessments, interviews, selected, rejected }
  },
};
