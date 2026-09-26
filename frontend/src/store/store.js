import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import timelogReducer from './slices/timelogSlice';
import summaryReducer from './slices/summarySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    timelogs: timelogReducer,
    summary: summaryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
