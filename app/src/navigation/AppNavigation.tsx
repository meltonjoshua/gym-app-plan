import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import HomeScreen from '../screens/main/HomeScreen';
import WorkoutsScreen from '../screens/workouts/WorkoutsScreen';
import WorkoutDetailScreen from '../screens/workouts/WorkoutDetailScreen';
import WorkoutSessionScreen from '../screens/workouts/WorkoutSessionScreen';
import ProgressScreen from '../screens/progress/ProgressScreen';
import NutritionScreen from '../screens/nutrition/NutritionScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
// Phase 2: Social features
import SocialScreen from '../screens/social/SocialScreen';
// Phase 2: AI features
import AIInsightsScreen from '../screens/main/AIInsightsScreen';
// Phase 2: Wearable integration
import WearableDevicesScreen from '../screens/wearables/WearableDevicesScreen';
// Phase 3: Virtual Trainer
import VirtualTrainerScreen from '../screens/main/VirtualTrainerScreen';
// Phase 3: Trainer Marketplace
import TrainerMarketplaceScreen from '../screens/marketplace/TrainerMarketplaceScreen';
// Phase 3: Enhanced Nutrition
import AdvancedNutritionScreen from '../screens/nutrition/AdvancedNutritionScreen';
// Phase 6: Enterprise & Monetization
import SubscriptionManagementScreen from '../screens/enterprise/SubscriptionManagementScreen';
import CorporateWellnessDashboard from '../screens/enterprise/CorporateWellnessDashboard';
import FranchiseManagementScreen from '../screens/enterprise/FranchiseManagementScreen';
// Phase 8: Quantum AI
import QuantumAIControlCenterScreen from '../screens/ai/QuantumAIControlCenterScreen';
// Phase 12: Analytics & Business Intelligence
import UserAnalyticsScreen from '../screens/analytics/UserAnalyticsScreen';
import ProgressDashboardScreen from '../screens/analytics/ProgressDashboardScreen';
import PremiumAnalyticsScreen from '../screens/analytics/PremiumAnalyticsScreen';
import AdminDashboardScreen from '../screens/analytics/AdminDashboardScreen';
import CohortAnalysisScreen from '../screens/analytics/CohortAnalysisScreen';
import ABTestingScreen from '../screens/analytics/ABTestingScreen';
import AutomatedReportsScreen from '../screens/analytics/AutomatedReportsScreen';
// Gamification
import GamificationScreen from '../screens/gamification/GamificationScreen';
import GameTestScreen from '../screens/gamification/GameTestScreen';

// Navigation types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Workouts: undefined;
  Progress: undefined;
  Social: undefined; // Phase 2: Social tab
  Gamification: undefined; // Gamification tab
  Nutrition: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  AIInsights: undefined;
  VirtualTrainer: undefined; // Phase 3: Virtual Trainer
  QuantumAIControlCenter: undefined; // Phase 8: Quantum AI
  GameTest: undefined; // Gamification test screen
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  WearableDevices: undefined;
  TrainerMarketplace: undefined; // Phase 3: Trainer Marketplace
  SubscriptionManagement: undefined; // Phase 6: Subscription Management
  CorporateWellness: undefined; // Phase 6: Corporate Wellness
  FranchiseManagement: undefined; // Phase 6: Franchise Management
};

export type ProgressStackParamList = {
  ProgressMain: undefined;
  UserAnalytics: undefined;
  ProgressDashboard: undefined;
  PremiumAnalytics: undefined;
  AdminDashboard: undefined;
  CohortAnalysis: undefined;
  ABTesting: undefined;
  AutomatedReports: undefined;
};

export type NutritionStackParamList = {
  NutritionMain: undefined;
  AdvancedNutrition: undefined; // Phase 3: Enhanced Nutrition AI
};

export type WorkoutStackParamList = {
  WorkoutsList: undefined;
  WorkoutDetail: { workoutId: string };
  WorkoutSession: { workoutId: string };
};

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>(); // Phase 2: Home stack
const ProfileStack = createStackNavigator<ProfileStackParamList>(); // Phase 2: Profile stack
const ProgressStack = createStackNavigator<ProgressStackParamList>(); // Phase 12: Progress & Analytics stack
const NutritionStack = createStackNavigator<NutritionStackParamList>(); // Phase 3: Nutrition stack
const WorkoutStack = createStackNavigator<WorkoutStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="AIInsights" 
        component={AIInsightsScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="VirtualTrainer" 
        component={VirtualTrainerScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="QuantumAIControlCenter" 
        component={QuantumAIControlCenterScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen 
        name="GameTest" 
        component={GameTestScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen 
        name="WearableDevices" 
        component={WearableDevicesScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen 
        name="TrainerMarketplace" 
        component={TrainerMarketplaceScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen 
        name="SubscriptionManagement" 
        component={SubscriptionManagementScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen 
        name="CorporateWellness" 
        component={CorporateWellnessDashboard}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen 
        name="FranchiseManagement" 
        component={FranchiseManagementScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );
}

function NutritionNavigator() {
  return (
    <NutritionStack.Navigator>
      <NutritionStack.Screen 
        name="NutritionMain" 
        component={NutritionScreen}
        options={{ headerShown: false }}
      />
      <NutritionStack.Screen 
        name="AdvancedNutrition" 
        component={AdvancedNutritionScreen}
        options={{ headerShown: false }}
      />
    </NutritionStack.Navigator>
  );
}

function ProgressNavigator() {
  return (
    <ProgressStack.Navigator>
      <ProgressStack.Screen 
        name="ProgressMain" 
        component={ProgressScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen 
        name="UserAnalytics" 
        component={UserAnalyticsScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen 
        name="ProgressDashboard" 
        component={ProgressDashboardScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen 
        name="PremiumAnalytics" 
        component={PremiumAnalyticsScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen 
        name="CohortAnalysis" 
        component={CohortAnalysisScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen 
        name="ABTesting" 
        component={ABTestingScreen}
        options={{ headerShown: false }}
      />
      <ProgressStack.Screen 
        name="AutomatedReports" 
        component={AutomatedReportsScreen}
        options={{ headerShown: false }}
      />
    </ProgressStack.Navigator>
  );
}

function WorkoutNavigator() {
  return (
    <WorkoutStack.Navigator>
      <WorkoutStack.Screen 
        name="WorkoutsList" 
        component={WorkoutsScreen}
        options={{ title: 'Workouts' }}
      />
      <WorkoutStack.Screen 
        name="WorkoutDetail" 
        component={WorkoutDetailScreen}
        options={{ title: 'Workout Details' }}
      />
      <WorkoutStack.Screen 
        name="WorkoutSession" 
        component={WorkoutSessionScreen}
        options={{ title: 'Workout in Progress', headerShown: false }}
      />
    </WorkoutStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Workouts') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Social') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Nutrition') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Gamification') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <MainTab.Screen name="Home" component={HomeNavigator} />
      <MainTab.Screen name="Workouts" component={WorkoutNavigator} />
      <MainTab.Screen name="Progress" component={ProgressNavigator} />
      <MainTab.Screen name="Social" component={SocialScreen} />
      <MainTab.Screen name="Gamification" component={GamificationScreen} />
      <MainTab.Screen name="Profile" component={ProfileNavigator} />
    </MainTab.Navigator>
  );
}

export default function AppNavigation() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}