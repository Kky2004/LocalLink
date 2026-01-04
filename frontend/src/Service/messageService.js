import api from './api';

export const messageService = {
  async sendMessage(data) {
    const response = await api.post('/messages', data);
    return response.data;
  },

  async getConversation(userId) {
    const response = await api.get(`/messages/conversation/${userId}`);
    return response.data;
  },

  async getUserMessages() {
    const response = await api.get('/messages');
    return response.data;
  },

  async markAsRead(messageId) {
    await api.put(`/messages/${messageId}/read`);
  },

  async getUnreadCount() {
    const response = await api.get('/messages/unread-count');
    return response.data.unreadCount;
  },
};
