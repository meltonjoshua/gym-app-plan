import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationState, NotificationSettings } from '../../types';

const initialState: NotificationState = {
  settings: {
    workoutReminders: true,
    workoutReminderTime: '09:00',
    progressReminders: true,
    hydrationReminders: true,
    socialNotifications: true,
    achievementNotifications: true,
  },
  isLoading: false,
  error: undefined,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
      state.error = undefined;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
});

export const {
  updateNotificationSettings,
  setLoading,
  setError,
  clearError,
} = notificationSlice.actions;

export default notificationSlice.reducer;