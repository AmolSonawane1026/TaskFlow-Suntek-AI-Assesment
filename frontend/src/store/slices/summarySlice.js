import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import summaryService from '@/services/summaryService';
import { createTask, updateTask, deleteTask } from './taskSlice';
import { stopTimer } from './timelogSlice';

export const fetchDailySummary = createAsyncThunk(
  'summary/fetchDaily',
  async (date, { rejectWithValue }) => {
    try {
      const response = await summaryService.getDailySummary(date);
      return response.data.summary;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch daily summary'
      );
    }
  }
);

export const fetchWeeklySummary = createAsyncThunk(
  'summary/fetchWeekly',
  async (_, { rejectWithValue }) => {
    try {
      const response = await summaryService.getWeeklySummary();
      return response.data.summary;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch weekly summary'
      );
    }
  }
);

export const fetchAiSummary = createAsyncThunk(
  'summary/fetchAi',
  async (date, { rejectWithValue }) => {
    try {
      const response = await summaryService.getAiSummary(date);
      return response.data.insights;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to generate AI summary'
      );
    }
  }
);

const summarySlice = createSlice({
  name: 'summary',
  initialState: {
    dailySummary: null,
    weeklySummary: null,
    aiInsights: null,
    isLoading: false,
    isAiLoading: false,
    error: null,
  },
  reducers: {
    clearSummaryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Daily summary
      .addCase(fetchDailySummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDailySummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailySummary = action.payload;
      })
      .addCase(fetchDailySummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Weekly summary
      .addCase(fetchWeeklySummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWeeklySummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.weeklySummary = action.payload;
      })
      .addCase(fetchWeeklySummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // AI Insights
      .addCase(fetchAiSummary.pending, (state) => {
        state.isAiLoading = true;
      })
      .addCase(fetchAiSummary.fulfilled, (state, action) => {
        state.isAiLoading = false;
        state.aiInsights = action.payload;
      })
      .addCase(fetchAiSummary.rejected, (state, action) => {
        state.isAiLoading = false;
        state.error = action.payload;
      })
      // Realtime task updates for stats
      .addCase(createTask.fulfilled, (state, action) => {
        const task = action.payload?.task || action.payload;
        if (state.dailySummary && task) {
          state.dailySummary.totalTasks = (state.dailySummary.totalTasks || 0) + 1;
          const status = task.status || 'pending';
          if (!state.dailySummary.statusBreakdown) {
            state.dailySummary.statusBreakdown = { completed: 0, inProgress: 0, pending: 0 };
          }
          const key = status === 'in-progress' ? 'inProgress' : status;
          state.dailySummary.statusBreakdown[key] = (state.dailySummary.statusBreakdown[key] || 0) + 1;
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const task = action.payload?.task || action.payload;
        if (state.dailySummary && task) {
          if (task.status === 'completed') {
            state.dailySummary.completedToday = (state.dailySummary.completedToday || 0) + 1;
          }
        }
      })
      .addCase(deleteTask.fulfilled, (state) => {
        if (state.dailySummary && state.dailySummary.totalTasks > 0) {
          state.dailySummary.totalTasks -= 1;
        }
      })
      .addCase(stopTimer.fulfilled, (state, action) => {
        const timeLog = action.payload;
        if (state.dailySummary && timeLog?.duration) {
          state.dailySummary.totalTimeTracked =
            (state.dailySummary.totalTimeTracked || 0) + timeLog.duration;
        }
      });
  },
});

export const { clearSummaryError } = summarySlice.actions;
export default summarySlice.reducer;
