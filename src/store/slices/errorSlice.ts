import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppError, ErrorType, ErrorSeverity } from '../../utils/errorHandling';

interface ErrorState {
  globalErrors: AppError[];
  dismissedErrors: string[]; // Error IDs that have been dismissed
  isShowingError: boolean;
  currentError?: AppError;
  networkStatus: 'online' | 'offline' | 'poor';
  retryQueue: Array<{
    errorId: string;
    retryAction: any;
    retryCount: number;
  }>;
}

const initialState: ErrorState = {
  globalErrors: [],
  dismissedErrors: [],
  isShowingError: false,
  networkStatus: 'online',
  retryQueue: [],
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    // Add a new error
    addError: (state, action: PayloadAction<AppError>) => {
      const error = action.payload;
      
      // Don't add duplicate errors (same message within 5 seconds)
      const isDuplicate = state.globalErrors.some(
        existingError => 
          existingError.message === error.message &&
          existingError.type === error.type &&
          (new Date().getTime() - new Date(existingError.timestamp).getTime()) < 5000
      );

      if (!isDuplicate) {
        state.globalErrors.unshift(error);
        
        // Keep only last 50 errors
        if (state.globalErrors.length > 50) {
          state.globalErrors = state.globalErrors.slice(0, 50);
        }

        // Show high and critical severity errors immediately
        if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
          state.currentError = error;
          state.isShowingError = true;
        }

        // Add to retry queue if retryable
        if (error.isRetryable && error.retryCount !== undefined && error.maxRetries !== undefined) {
          if (error.retryCount < error.maxRetries) {
            // This would be handled by middleware or thunk
            console.log('Error is retryable:', error.id);
          }
        }
      }
    },

    // Remove an error
    removeError: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;
      state.globalErrors = state.globalErrors.filter(error => error.id !== errorId);
      state.retryQueue = state.retryQueue.filter(item => item.errorId !== errorId);
      
      if (state.currentError?.id === errorId) {
        state.currentError = undefined;
        state.isShowingError = false;
      }
    },

    // Dismiss an error (hide from UI but keep in log)
    dismissError: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;
      
      if (!state.dismissedErrors.includes(errorId)) {
        state.dismissedErrors.push(errorId);
      }

      if (state.currentError?.id === errorId) {
        state.currentError = undefined;
        state.isShowingError = false;
      }
    },

    // Clear all errors
    clearAllErrors: (state) => {
      state.globalErrors = [];
      state.dismissedErrors = [];
      state.currentError = undefined;
      state.isShowingError = false;
      state.retryQueue = [];
    },

    // Clear errors by type
    clearErrorsByType: (state, action: PayloadAction<ErrorType>) => {
      const errorType = action.payload;
      state.globalErrors = state.globalErrors.filter(error => error.type !== errorType);
      state.retryQueue = state.retryQueue.filter(
        item => {
          const error = state.globalErrors.find(e => e.id === item.errorId);
          return error?.type !== errorType;
        }
      );

      if (state.currentError?.type === errorType) {
        state.currentError = undefined;
        state.isShowingError = false;
      }
    },

    // Update network status
    setNetworkStatus: (state, action: PayloadAction<'online' | 'offline' | 'poor'>) => {
      state.networkStatus = action.payload;
      
      // Clear network errors when coming back online
      if (action.payload === 'online') {
        state.globalErrors = state.globalErrors.filter(error => error.type !== ErrorType.NETWORK);
      }
    },

    // Increment retry count for an error
    incrementRetryCount: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;
      const error = state.globalErrors.find(e => e.id === errorId);
      
      if (error && error.retryCount !== undefined) {
        error.retryCount += 1;
      }

      // Update retry queue
      const queueItem = state.retryQueue.find(item => item.errorId === errorId);
      if (queueItem) {
        queueItem.retryCount += 1;
      }
    },

    // Add action to retry queue
    addToRetryQueue: (state, action: PayloadAction<{
      errorId: string;
      retryAction: any;
    }>) => {
      const { errorId, retryAction } = action.payload;
      
      // Don't add if already in queue
      if (!state.retryQueue.find(item => item.errorId === errorId)) {
        state.retryQueue.push({
          errorId,
          retryAction,
          retryCount: 0,
        });
      }
    },

    // Remove from retry queue
    removeFromRetryQueue: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;
      state.retryQueue = state.retryQueue.filter(item => item.errorId !== errorId);
    },

    // Show specific error
    showError: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;
      const error = state.globalErrors.find(e => e.id === errorId);
      
      if (error) {
        state.currentError = error;
        state.isShowingError = true;
      }
    },

    // Hide current error
    hideCurrentError: (state) => {
      state.isShowingError = false;
      state.currentError = undefined;
    },

    // Mark error as resolved
    markErrorResolved: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;
      const error = state.globalErrors.find(e => e.id === errorId);
      
      if (error) {
        // Add resolved flag to error
        (error as any).resolved = true;
        (error as any).resolvedAt = new Date();
      }

      // Remove from retry queue
      state.retryQueue = state.retryQueue.filter(item => item.errorId !== errorId);
    },
  },
});

export const {
  addError,
  removeError,
  dismissError,
  clearAllErrors,
  clearErrorsByType,
  setNetworkStatus,
  incrementRetryCount,
  addToRetryQueue,
  removeFromRetryQueue,
  showError,
  hideCurrentError,
  markErrorResolved,
} = errorSlice.actions;

// Selectors
export const selectAllErrors = (state: { error: ErrorState }) => state.error.globalErrors;
export const selectVisibleErrors = (state: { error: ErrorState }) => 
  state.error.globalErrors.filter(error => !state.error.dismissedErrors.includes(error.id));
export const selectCurrentError = (state: { error: ErrorState }) => state.error.currentError;
export const selectIsShowingError = (state: { error: ErrorState }) => state.error.isShowingError;
export const selectNetworkStatus = (state: { error: ErrorState }) => state.error.networkStatus;
export const selectRetryQueue = (state: { error: ErrorState }) => state.error.retryQueue;

export const selectErrorsByType = (state: { error: ErrorState }, errorType: ErrorType) =>
  state.error.globalErrors.filter(error => error.type === errorType);

export const selectErrorsBySeverity = (state: { error: ErrorState }, severity: ErrorSeverity) =>
  state.error.globalErrors.filter(error => error.severity === severity);

export const selectRecentErrors = (state: { error: ErrorState }, minutes: number = 5) => {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  return state.error.globalErrors.filter(error => new Date(error.timestamp) > cutoff);
};

export const selectErrorStats = (state: { error: ErrorState }) => {
  const errors = state.error.globalErrors;
  return {
    total: errors.length,
    critical: errors.filter(e => e.severity === ErrorSeverity.CRITICAL).length,
    high: errors.filter(e => e.severity === ErrorSeverity.HIGH).length,
    medium: errors.filter(e => e.severity === ErrorSeverity.MEDIUM).length,
    low: errors.filter(e => e.severity === ErrorSeverity.LOW).length,
    retryable: errors.filter(e => e.isRetryable).length,
  };
};

export default errorSlice.reducer;
