import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NutritionState, MealEntry, Food } from '../../types';

const initialState: NutritionState = {
  meals: [],
  foods: [],
  dailyGoals: {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
  },
  isLoading: false,
  error: undefined,
};

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    setMeals: (state, action: PayloadAction<MealEntry[]>) => {
      state.meals = action.payload;
      state.error = undefined;
    },
    addMealEntry: (state, action: PayloadAction<MealEntry>) => {
      state.meals.push(action.payload);
      state.meals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    updateMealEntry: (state, action: PayloadAction<MealEntry>) => {
      const index = state.meals.findIndex(meal => meal.id === action.payload.id);
      if (index !== -1) {
        state.meals[index] = action.payload;
      }
    },
    removeMealEntry: (state, action: PayloadAction<string>) => {
      state.meals = state.meals.filter(meal => meal.id !== action.payload);
    },
    setFoods: (state, action: PayloadAction<Food[]>) => {
      state.foods = action.payload;
      state.error = undefined;
    },
    addFood: (state, action: PayloadAction<Food>) => {
      state.foods.push(action.payload);
    },
    updateDailyGoals: (state, action: PayloadAction<Partial<typeof initialState.dailyGoals>>) => {
      state.dailyGoals = { ...state.dailyGoals, ...action.payload };
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
  setMeals,
  addMealEntry,
  updateMealEntry,
  removeMealEntry,
  setFoods,
  addFood,
  updateDailyGoals,
  setLoading,
  setError,
  clearError,
} = nutritionSlice.actions;

export default nutritionSlice.reducer;