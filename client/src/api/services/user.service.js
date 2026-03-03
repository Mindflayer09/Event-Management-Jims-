import api from '../axios';

export const getAllUsers = (params) => api.get('/users', { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const approveUser = (id) => api.patch(`/users/${id}/approve`);
export const updateUserRole = (id, data) => api.patch(`/users/${id}/role`, data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
