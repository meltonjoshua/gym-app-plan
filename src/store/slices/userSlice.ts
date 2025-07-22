import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, User } from '../../types';

const initialState: UserState = {
  currentUser: undefined,
  isLoading: false,
  error: undefined,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.error = undefined;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
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
    clearUser: (state) => {
      state.currentUser = undefined;
      state.error = undefined;
      state.isLoading = false;
    },
  },
});

export const { setUser, updateUser, setLoading, setError, clearError, clearUser } = userSlice.actions;
export default userSlice.reducer;