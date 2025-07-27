import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProgressState, ProgressEntry } from '../../types';

const initialState: ProgressState = {
  entries: [],
  isLoading: false,
  error: undefined,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setProgressEntries: (state, action: PayloadAction<ProgressEntry[]>) => {
      state.entries = action.payload;
      state.error = undefined;
    },
    addProgressEntry: (state, action: PayloadAction<ProgressEntry>) => {
      state.entries.push(action.payload);
      state.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    updateProgressEntry: (state, action: PayloadAction<ProgressEntry>) => {
      const index = state.entries.findIndex(entry => entry.id === action.payload.id);
      if (index !== -1) {
        state.entries[index] = action.payload;
      }
    },
    removeProgressEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(entry => entry.id !== action.payload);
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
  setProgressEntries,
  addProgressEntry,
  updateProgressEntry,
  removeProgressEntry,
  setLoading,
  setError,
  clearError,
} = progressSlice.actions;

export default progressSlice.reducer;