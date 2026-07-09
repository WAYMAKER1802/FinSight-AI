import api from './client';

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  uploadAvatar: async (formData: FormData) => {
    const response = await api.post('/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  changePassword: (data: any) => api.post('/users/change-password', data),
  setupMPin: (data: { pin: string }) => api.post('/users/mpin/setup', data),
  resetMPin: (data: { password?: string; newPin: string }) => api.put('/users/mpin/reset', data),
  disableMPin: (data: { password?: string }) => api.put('/users/mpin/disable', data),
};
