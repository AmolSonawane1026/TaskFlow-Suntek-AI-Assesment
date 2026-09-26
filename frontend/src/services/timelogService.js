import api from './api';

const timelogService = {
  startTimer: async (taskId) => {
    const response = await api.post('/timelogs/start', { taskId });
    return response.data;
  },

  stopTimer: async (timeLogId) => {
    const response = await api.post('/timelogs/stop', { timeLogId });
    return response.data;
  },

  getActiveTimer: async () => {
    const response = await api.get('/timelogs/active');
    return response.data;
  },

  getTimeLogs: async (params = {}) => {
    const response = await api.get('/timelogs', { params });
    return response.data;
  },

  getTaskTimeLogs: async (taskId) => {
    const response = await api.get(`/timelogs/task/${taskId}`);
    return response.data;
  },
};

export default timelogService;
