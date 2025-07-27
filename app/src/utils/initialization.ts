import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { setWorkoutPlans, setExercises } from '../store/slices/workoutSlice';
import { setFoods } from '../store/slices/nutritionSlice';
import { loginSuccess } from '../store/slices/authSlice';
import { setUser } from '../store/slices/userSlice';
import { sampleExercises, sampleWorkoutPlans, sampleFoods } from '../data/sampleData';
import { User } from '../types';

export const initializeApp = async () => {
  try {
    // Initialize sample data
    store.dispatch(setExercises(sampleExercises));
    store.dispatch(setWorkoutPlans(sampleWorkoutPlans));
    store.dispatch(setFoods(sampleFoods));

    // Check for existing user session
    const storedUser = await AsyncStorage.getItem('user');
    const storedToken = await AsyncStorage.getItem('token');

    if (storedUser && storedToken) {
      const user: User = JSON.parse(storedUser);
      store.dispatch(loginSuccess({ token: storedToken, userId: user.id }));
      store.dispatch(setUser(user));
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};