import api from './api';

export const reportService = {
  async createReport(data) {
    const response = await api.post('/reports', data);
    return response.data;
  },

  async getMyReports() {
    const response = await api.get('/reports/my-reports');
    return response.data;
  },
};
