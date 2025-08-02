import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WearableState, WearableData } from '../../types';

const initialState: WearableState = {
  devices: [],
  currentHeartRate: undefined,
  todaysData: undefined,
  isLoading: false,
  error: undefined,
};

const wearableSlice = createSlice({
  name: 'wearable',
  initialState,
  reducers: {
    // Loading and Error States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },

    // Device Management
    setDevices: (state, action: PayloadAction<WearableData[]>) => {
      state.devices = action.payload;
    },
    addDevice: (state, action: PayloadAction<WearableData>) => {
      const existingIndex = state.devices.findIndex(d => d.deviceName === action.payload.deviceName);
      if (existingIndex !== -1) {
        // Update existing device
        state.devices[existingIndex] = action.payload;
      } else {
        // Add new device
        state.devices.push(action.payload);
      }
    },
    removeDevice: (state, action: PayloadAction<string>) => {
      state.devices = state.devices.filter(device => device.id !== action.payload);
    },
    updateDeviceData: (state, action: PayloadAction<WearableData>) => {
      const index = state.devices.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.devices[index] = action.payload;
      }
    },

    // Real-time Data
    setCurrentHeartRate: (state, action: PayloadAction<number>) => {
      state.currentHeartRate = action.payload;
    },
    updateTodaysData: (state, action: PayloadAction<WearableData>) => {
      state.todaysData = action.payload;
    },

    // Batch sync operations
    syncDeviceData: (state, action: PayloadAction<{ deviceId: string; data: any }>) => {
      const device = state.devices.find(d => d.id === action.payload.deviceId);
      if (device) {
        device.data = { ...device.data, ...action.payload.data };
        device.syncTime = new Date();
      }
    },
    
    // Simulated data generation (for demo purposes)
    generateSimulatedData: (state, action: PayloadAction<{ 
      userId: string; 
      deviceType: 'smartwatch' | 'fitness_tracker' | 'heart_rate_monitor' 
    }>) => {
      const currentDate = new Date();
      const simulatedData: WearableData = {
        id: `simulated-${Date.now()}`,
        userId: action.payload.userId,
        deviceType: action.payload.deviceType,
        deviceName: `Simulated ${action.payload.deviceType}`,
        syncTime: currentDate,
        data: {
          heartRate: Array.from({ length: 24 }, () => Math.floor(Math.random() * 40) + 60), // 60-100 BPM
          steps: Math.floor(Math.random() * 5000) + 5000, // 5000-10000 steps
          calories: Math.floor(Math.random() * 500) + 1500, // 1500-2000 calories
          activeMinutes: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
          sleepHours: Math.random() * 2 + 6.5, // 6.5-8.5 hours
          restingHeartRate: Math.floor(Math.random() * 20) + 60, // 60-80 BPM
        },
      };
      
      state.todaysData = simulatedData;
      state.devices.push(simulatedData);
    },

    // Real-time monitoring simulation
    startHeartRateMonitoring: (state) => {
      state.isLoading = true;
      // In a real app, this would start a background service
    },
    stopHeartRateMonitoring: (state) => {
      state.isLoading = false;
      state.currentHeartRate = undefined;
    },

    // Workout integration
    startWorkoutTracking: (state, action: PayloadAction<{ workoutId: string }>) => {
      state.isLoading = true;
      // This would start enhanced tracking during workout
    },
    stopWorkoutTracking: (state, action: PayloadAction<{ 
      workoutId: string; 
      avgHeartRate: number; 
      maxHeartRate: number; 
      caloriesBurned: number 
    }>) => {
      state.isLoading = false;
      // Store workout-specific data
      if (state.todaysData) {
        state.todaysData.data = {
          ...state.todaysData.data,
          calories: (state.todaysData.data.calories || 0) + action.payload.caloriesBurned,
        };
      }
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setDevices,
  addDevice,
  removeDevice,
  updateDeviceData,
  setCurrentHeartRate,
  updateTodaysData,
  syncDeviceData,
  generateSimulatedData,
  startHeartRateMonitoring,
  stopHeartRateMonitoring,
  startWorkoutTracking,
  stopWorkoutTracking,
} = wearableSlice.actions;

export default wearableSlice.reducer;