import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Обработка обновления токена
api.interceptors.response.use(
  (response) => {
    const newToken = response.headers['new-token'];
    if (newToken) {
      const user = JSON.parse(localStorage.getItem('user'));
      user.token = newToken;
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', {
    name: userData.name,
    email: userData.email,
    password: userData.password
  }),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getProfile: () => api.get('/auth/profile'),
  updateSettings: (settings) => api.put('/auth/settings', { settings }),
  deleteAccount: () => api.delete('/auth/account'),
  requestPasswordReset: (email) => api.post('/auth/reset-password-request', { email }),
  resetPassword: (token, newPassword) => 
    api.post('/auth/reset-password', { token, newPassword }),
  updateUser: (userData) => api.put('/auth/profile', userData, {
    headers: {
      'Content-Type': 'application/json',
    }
  }),
};

export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (task) => api.post('/tasks', task),
  updateTask: (id, task) => api.put(`/tasks/${id}`, task),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  getDashboardStats: () => api.get('/tasks/dashboard-stats'),
  getTasksByDate: (date) => api.get(`/tasks/by-date/${date}`),
  searchTasks: (query) => api.get('/tasks/search', { params: { q: query } }),
  addSubtask: (taskId, subtask) => api.post(`/tasks/${taskId}/subtasks`, subtask),
  updateSubtask: (taskId, subtaskId, updates) => 
    api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, updates),
  deleteSubtask: (taskId, subtaskId) => 
    api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`),
  addTag: (taskId, tag) => api.post(`/tasks/${taskId}/tags`, { tag }),
  removeTag: (taskId, tag) => api.delete(`/tasks/${taskId}/tags/${tag}`),
  getAllTags: () => api.get('/tasks/tags'),
  getCategoryStats: () => api.get('/tasks/stats/categories'),
  updateBulkCategory: (taskIds, category) => 
    api.put('/tasks/bulk/category', { taskIds, category }),
  toggleStar: (taskId) => api.put(`/tasks/${taskId}/star`),
  toggleArchive: (taskId) => api.put(`/tasks/${taskId}/archive`),
  getArchivedTasks: () => api.get('/tasks/archived'),
  getStarredTasks: () => api.get('/tasks/starred'),
  exportTasks: (format) => api.get('/tasks/export', { 
    params: { format },
    responseType: 'blob'
  }),
  importTasks: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/tasks/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  setReminder: (taskId, reminderDate) => 
    api.post(`/tasks/${taskId}/reminder`, { reminderDate }),
  removeReminder: (taskId) => api.delete(`/tasks/${taskId}/reminder`),
  getReminders: () => api.get('/tasks/reminders'),
  addComment: (taskId, comment) => 
    api.post(`/tasks/${taskId}/comments`, { text: comment }),
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
  deleteComment: (taskId, commentId) => 
    api.delete(`/tasks/${taskId}/comments/${commentId}`),
  bulkDelete: (taskIds) => api.post('/tasks/bulk/delete', { taskIds }),
  bulkUpdate: (taskIds, updates) => 
    api.put('/tasks/bulk/update', { taskIds, updates }),
  bulkMove: (taskIds, category) => 
    api.put('/tasks/bulk/move', { taskIds, category }),
};

export const portfolioService = {
  getPortfolio: () => api.get('/portfolio'),
  addPortfolioItem: (formData) => api.post('/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updatePortfolioItem: (id, formData) => api.put(`/portfolio/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePortfolioItem: (id) => api.delete(`/portfolio/${id}`)
};

export default api; 