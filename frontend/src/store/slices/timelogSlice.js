import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import timelogService from '@/services/timelogService';

export const startTimer = createAsyncThunk(
  'timelogs/startTimer',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await timelogService.startTimer(taskId);
      return response.data.timeLog;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to start timer'
      );
    }
  }
);

export const stopTimer = createAsyncThunk(
  'timelogs/stopTimer',
  async (timeLogId, { rejectWithValue }) => {
    try {
      const response = await timelogService.stopTimer(timeLogId);
      return response.data.timeLog;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to stop timer'
      );
    }
  }
);

export const fetchActiveTimer = createAsyncThunk(
  'timelogs/fetchActiveTimer',
  async (_, { rejectWithValue }) => {
    try {
      const response = await timelogService.getActiveTimer();
      return response.data.activeTimer;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch active timer'
      );
    }
  }
);

export const fetchTimeLogs = createAsyncThunk(
  'timelogs/fetchTimeLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await timelogService.getTimeLogs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch time logs'
      );
    }
  }
);

const timelogSlice = createSlice({
  name: 'timelogs',
  initialState: {
    timeLogs: [],
    activeTimer: null,
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearTimelogError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Start timer
      .addCase(startTimer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(startTimer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeTimer = action.payload;
      })
      .addCase(startTimer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Stop timer
      .addCase(stopTimer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(stopTimer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeTimer = null;
        state.timeLogs.unshift(action.payload);
      })
      .addCase(stopTimer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch active timer
      .addCase(fetchActiveTimer.fulfilled, (state, action) => {
        state.activeTimer = action.payload;
      })
      // Fetch time logs
      .addCase(fetchTimeLogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTimeLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeLogs = action.payload.timeLogs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTimeLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTimelogError } = timelogSlice.actions;
export default timelogSlice.reducer;
