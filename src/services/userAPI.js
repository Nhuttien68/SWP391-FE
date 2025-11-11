import apiClient from './apiClient';

const userAPI = {
  getUserById: (userId) => apiClient.get(`/User/${userId?.toString().toUpperCase()}`),
};

export default userAPI;
