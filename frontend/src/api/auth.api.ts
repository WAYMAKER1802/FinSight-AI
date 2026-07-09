import api from './client';

export const authApi = {
  login: async (credentials: any) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (token: string, data: any) => api.patch(`/auth/reset-password/${token}`, data),
  googleLogin: (token: string) => api.post('/auth/google', { token }),
  verifyMPin: async (data: { tempToken: string; pin: string }) => {
    const response = await api.post('/auth/verify-mpin', data);
    return response.data;
  },
};
