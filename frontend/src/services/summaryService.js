import api from './api';

const summaryService = {
  getDailySummary: async (date) => {
    const params = date ? { date } : {};
    const response = await api.get('/summary/daily', { params });
    return response.data;
  },

  getWeeklySummary: async () => {
    const response = await api.get('/summary/weekly');
    return response.data;
  },

  getAiSummary: async (date) => {
    const params = date ? { date } : {};
    const response = await api.get('/summary/ai', { params });
    return response.data;
  },
};

export default summaryService;
