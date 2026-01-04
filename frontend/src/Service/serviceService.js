import api from './api';

export const serviceService = {
  async getAllServices() {
    const response = await api.get('/services');
    return response.data;
  },

  async getServiceById(id) {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  async getServicesByCategory(category) {
    const backendCategory = category.toUpperCase().replace(/-/g, '_');
    const response = await api.get(`/services/category/${backendCategory}`);
    return response.data;
  },

  async getServicesByProvider(providerId) {
    const response = await api.get(`/services/provider/${providerId}`);
    return response.data;
  },

  async createService(service) {
    const response = await api.post('/services', service);
    return response.data;
  },

  async searchNearby(latitude, longitude, radius = 5, category) {
    const backendCategory = category?.toUpperCase().replace(/-/g, '_');
    const response = await api.get('/services/search/nearby', {
      params: { latitude, longitude, radius, category: backendCategory }
    });
    return response.data;
  },

  async deleteService(id) {
    await api.delete(`/services/${id}`);
  },

  async updateService(id,data) {
     const response = await api.put(`/services/${id}`, data);
  return response.data;
  },
};
