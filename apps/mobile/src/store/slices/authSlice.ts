import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from '../../types';

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: undefined,
  token: undefined,
  userId: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = undefined;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; userId: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.error = undefined;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.token = undefined;
      state.userId = undefined;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = undefined;
      state.userId = undefined;
      state.error = undefined;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;