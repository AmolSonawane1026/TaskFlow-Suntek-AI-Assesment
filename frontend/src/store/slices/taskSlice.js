import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taskService from '@/services/taskService';
import { stopTimer } from './timelogSlice';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch tasks'
      );
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(taskData);
      const created = response?.data?.task || response?.task || response?.data || response;
      return created;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create task'
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(id, data);
      const updated = response?.data?.task || response?.task || response?.data || response;
      return updated;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task'
      );
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete task'
      );
    }
  }
);

export const enhanceTask = createAsyncThunk(
  'tasks/enhanceTask',
  async (input, { rejectWithValue }) => {
    try {
      const response = await taskService.enhanceTask(input);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to enhance task'
      );
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    pagination: null,
    isLoading: false,
    error: null,
    enhancedTask: null,
    isEnhancing: false,
  },
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    clearEnhancedTask: (state) => {
      state.enhancedTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload?.tasks || action.payload || [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const task = action.payload?.task || action.payload;
        if (task) {
          state.tasks.unshift(task);
          if (state.pagination) {
            state.pagination.total = (state.pagination.total || 0) + 1;
          }
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const updated = action.payload?.task || action.payload;
        if (updated) {
          const targetId = (updated._id || updated.id || '').toString();
          const index = state.tasks.findIndex(
            (t) => (t._id || t.id || '').toString() === targetId
          );
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...updated };
          }
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        const deletedId = (action.payload || '').toString();
        state.tasks = state.tasks.filter((t) => (t._id || t.id || '').toString() !== deletedId);
        if (state.pagination && state.pagination.total > 0) {
          state.pagination.total -= 1;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Enhance task
      .addCase(enhanceTask.pending, (state) => {
        state.isEnhancing = true;
      })
      .addCase(enhanceTask.fulfilled, (state, action) => {
        state.isEnhancing = false;
        state.enhancedTask = action.payload;
      })
      .addCase(enhanceTask.rejected, (state, action) => {
        state.isEnhancing = false;
        state.error = action.payload;
      })
      .addCase(stopTimer.fulfilled, (state, action) => {
        const timeLog = action.payload;
        if (timeLog && timeLog.duration) {
          const taskId = (timeLog.task?._id || timeLog.task || '').toString();
          const task = state.tasks.find((t) => (t._id || t.id || '').toString() === taskId);
          if (task) {
            task.totalTimeSpent = (task.totalTimeSpent || 0) + timeLog.duration;
          }
        }
      });
  },
});

export const { clearTaskError, clearEnhancedTask } = taskSlice.actions;
export default taskSlice.reducer;
