import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  joinDate: string;
  isActive: boolean;
  fitnessScore: number;
  activeMinutes: number;
  challengesCompleted: number;
  lastActivity: string;
  healthMetrics?: {
    weight?: number;
    bloodPressure?: string;
    heartRate?: number;
    stressLevel?: number;
    sleepQuality?: number;
  };
}

export interface Department {
  id: string;
  name: string;
  managerId: string;
  employeeCount: number;
  averageFitnessScore: number;
  participationRate: number;
  totalActiveMinutes: number;
  challengesCompleted: number;
  color: string;
  budget?: number;
  goals?: string[];
}

export interface WellnessChallenge {
  id: string;
  name: string;
  description: string;
  type: 'steps' | 'workouts' | 'meditation' | 'nutrition' | 'sleep' | 'custom';
  startDate: string;
  endDate: string;
  targetMetric: string;
  targetValue: number;
  participants: string[]; // employee IDs
  completionRate: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  rewards?: {
    type: 'points' | 'badge' | 'gift_card' | 'time_off';
    value: string | number;
    description: string;
  }[];
  leaderboard?: {
    employeeId: string;
    value: number;
    rank: number;
  }[];
}

export interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  address: string;
  contactEmail: string;
  wellnessCoordinator: string;
  subscriptionTier: string;
  subscriptionStartDate: string;
  settings: {
    allowWearableIntegration: boolean;
    enableHealthScreenings: boolean;
    shareAggregateData: boolean;
    requirePrivacyConsent: boolean;
    dataRetentionDays: number;
    enableGamification: boolean;
    allowSocialFeatures: boolean;
  };
}

export interface WellnessProgram {
  id: string;
  name: string;
  description: string;
  type: 'fitness' | 'nutrition' | 'mental_health' | 'preventive_care' | 'comprehensive';
  duration: number; // in days
  isActive: boolean;
  participants: string[];
  outcomes: {
    participantId: string;
    startMetrics: Record<string, number>;
    currentMetrics: Record<string, number>;
    improvementPercentage: number;
  }[];
  cost: number;
  roi: number;
}

export interface HealthcareIntegration {
  id: string;
  providerName: string;
  type: 'insurance' | 'clinic' | 'lab' | 'telemedicine';
  isActive: boolean;
  connectedEmployees: string[];
  dataSharing: {
    enabled: boolean;
    dataTypes: string[];
    consentRequired: boolean;
  };
  costSavings?: {
    preventiveCare: number;
    reducedClaims: number;
    medicationAdherence: number;
  };
}

export interface WellnessMetrics {
  overview: {
    totalEmployees: number;
    activeParticipants: number;
    participationRate: number;
    averageFitnessScore: number;
    totalWorkoutsCompleted: number;
    healthRiskReduction: number;
    absenteeismReduction: number;
    healthcareCostSavings: number;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    averageSessionDuration: number;
    featureUsage: Record<string, number>;
    challengeParticipation: number;
  };
  health: {
    averageSteps: number;
    averageActiveMinutes: number;
    averageSleepHours: number;
    stressLevelImprovement: number;
    weightLossParticipants: number;
    biometricImprovements: Record<string, number>;
  };
  productivity: {
    absenteeismRate: number;
    presenteeismReduction: number;
    energyLevelIncrease: number;
    jobSatisfactionScore: number;
    workProductivityScore: number;
  };
  financial: {
    programCosts: number;
    healthcareSavings: number;
    productivityGains: number;
    roi: number;
    costPerEmployee: number;
  };
}

export interface CorporateWellnessState {
  company: CompanyProfile | null;
  employees: Employee[];
  departments: Department[];
  challenges: WellnessChallenge[];
  programs: WellnessProgram[];
  integrations: HealthcareIntegration[];
  metrics: WellnessMetrics | null;
  selectedTimeframe: '7d' | '30d' | '90d' | '1y';
  selectedDepartment: string | null;
  loading: {
    employees: boolean;
    challenges: boolean;
    metrics: boolean;
    general: boolean;
  };
  error: string | null;
  filters: {
    department?: string;
    status?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

const initialState: CorporateWellnessState = {
  company: null,
  employees: [],
  departments: [],
  challenges: [],
  programs: [],
  integrations: [],
  metrics: null,
  selectedTimeframe: '30d',
  selectedDepartment: null,
  loading: {
    employees: false,
    challenges: false,
    metrics: false,
    general: false
  },
  error: null,
  filters: {}
};

const corporateWellnessSlice = createSlice({
  name: 'corporateWellness',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<{ key: keyof CorporateWellnessState['loading']; value: boolean }>) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
      if (value) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = {
        employees: false,
        challenges: false,
        metrics: false,
        general: false
      };
    },
    clearError: (state) => {
      state.error = null;
    },

    // Company profile
    setCompanyProfile: (state, action: PayloadAction<CompanyProfile>) => {
      state.company = action.payload;
    },
    updateCompanySettings: (state, action: PayloadAction<Partial<CompanyProfile['settings']>>) => {
      if (state.company) {
        state.company.settings = { ...state.company.settings, ...action.payload };
      }
    },

    // Employee management
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push(action.payload);
    },
    updateEmployee: (state, action: PayloadAction<{ id: string; updates: Partial<Employee> }>) => {
      const { id, updates } = action.payload;
      const employeeIndex = state.employees.findIndex(emp => emp.id === id);
      if (employeeIndex !== -1) {
        state.employees[employeeIndex] = { ...state.employees[employeeIndex], ...updates };
      }
    },
    removeEmployee: (state, action: PayloadAction<string>) => {
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
    },
    updateEmployeeMetrics: (state, action: PayloadAction<{ employeeId: string; metrics: Partial<Employee['healthMetrics']> }>) => {
      const { employeeId, metrics } = action.payload;
      const employee = state.employees.find(emp => emp.id === employeeId);
      if (employee) {
        employee.healthMetrics = { ...employee.healthMetrics, ...metrics };
      }
    },

    // Department management
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.departments = action.payload;
    },
    addDepartment: (state, action: PayloadAction<Department>) => {
      state.departments.push(action.payload);
    },
    updateDepartment: (state, action: PayloadAction<{ id: string; updates: Partial<Department> }>) => {
      const { id, updates } = action.payload;
      const deptIndex = state.departments.findIndex(dept => dept.id === id);
      if (deptIndex !== -1) {
        state.departments[deptIndex] = { ...state.departments[deptIndex], ...updates };
      }
    },
    removeDepartment: (state, action: PayloadAction<string>) => {
      state.departments = state.departments.filter(dept => dept.id !== action.payload);
    },

    // Challenge management
    setChallenges: (state, action: PayloadAction<WellnessChallenge[]>) => {
      state.challenges = action.payload.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
    },
    addChallenge: (state, action: PayloadAction<WellnessChallenge>) => {
      state.challenges.unshift(action.payload);
    },
    updateChallenge: (state, action: PayloadAction<{ id: string; updates: Partial<WellnessChallenge> }>) => {
      const { id, updates } = action.payload;
      const challengeIndex = state.challenges.findIndex(challenge => challenge.id === id);
      if (challengeIndex !== -1) {
        state.challenges[challengeIndex] = { ...state.challenges[challengeIndex], ...updates };
      }
    },
    removeChallenge: (state, action: PayloadAction<string>) => {
      state.challenges = state.challenges.filter(challenge => challenge.id !== action.payload);
    },
    addChallengeParticipant: (state, action: PayloadAction<{ challengeId: string; employeeId: string }>) => {
      const { challengeId, employeeId } = action.payload;
      const challenge = state.challenges.find(c => c.id === challengeId);
      if (challenge && !challenge.participants.includes(employeeId)) {
        challenge.participants.push(employeeId);
      }
    },
    removeChallengeParticipant: (state, action: PayloadAction<{ challengeId: string; employeeId: string }>) => {
      const { challengeId, employeeId } = action.payload;
      const challenge = state.challenges.find(c => c.id === challengeId);
      if (challenge) {
        challenge.participants = challenge.participants.filter(id => id !== employeeId);
      }
    },
    updateChallengeLeaderboard: (state, action: PayloadAction<{ challengeId: string; leaderboard: WellnessChallenge['leaderboard'] }>) => {
      const { challengeId, leaderboard } = action.payload;
      const challenge = state.challenges.find(c => c.id === challengeId);
      if (challenge) {
        challenge.leaderboard = leaderboard;
      }
    },

    // Wellness programs
    setPrograms: (state, action: PayloadAction<WellnessProgram[]>) => {
      state.programs = action.payload;
    },
    addProgram: (state, action: PayloadAction<WellnessProgram>) => {
      state.programs.push(action.payload);
    },
    updateProgram: (state, action: PayloadAction<{ id: string; updates: Partial<WellnessProgram> }>) => {
      const { id, updates } = action.payload;
      const programIndex = state.programs.findIndex(program => program.id === id);
      if (programIndex !== -1) {
        state.programs[programIndex] = { ...state.programs[programIndex], ...updates };
      }
    },
    removeProgram: (state, action: PayloadAction<string>) => {
      state.programs = state.programs.filter(program => program.id !== action.payload);
    },

    // Healthcare integrations
    setIntegrations: (state, action: PayloadAction<HealthcareIntegration[]>) => {
      state.integrations = action.payload;
    },
    addIntegration: (state, action: PayloadAction<HealthcareIntegration>) => {
      state.integrations.push(action.payload);
    },
    updateIntegration: (state, action: PayloadAction<{ id: string; updates: Partial<HealthcareIntegration> }>) => {
      const { id, updates } = action.payload;
      const integrationIndex = state.integrations.findIndex(integration => integration.id === id);
      if (integrationIndex !== -1) {
        state.integrations[integrationIndex] = { ...state.integrations[integrationIndex], ...updates };
      }
    },
    removeIntegration: (state, action: PayloadAction<string>) => {
      state.integrations = state.integrations.filter(integration => integration.id !== action.payload);
    },

    // Metrics and analytics
    setMetrics: (state, action: PayloadAction<WellnessMetrics>) => {
      state.metrics = action.payload;
    },
    updateMetrics: (state, action: PayloadAction<Partial<WellnessMetrics>>) => {
      if (state.metrics) {
        state.metrics = { ...state.metrics, ...action.payload };
      }
    },

    // Filters and view options
    setTimeframe: (state, action: PayloadAction<CorporateWellnessState['selectedTimeframe']>) => {
      state.selectedTimeframe = action.payload;
    },
    setSelectedDepartment: (state, action: PayloadAction<string | null>) => {
      state.selectedDepartment = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<CorporateWellnessState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
      state.selectedDepartment = null;
    },

    // Reset state
    resetCorporateWellnessState: () => initialState
  }
});

// Selectors
export const selectCompany = (state: { corporateWellness: CorporateWellnessState }) => 
  state.corporateWellness.company;

export const selectEmployees = (state: { corporateWellness: CorporateWellnessState }) => 
  state.corporateWellness.employees;

export const selectActiveEmployees = (state: { corporateWellness: CorporateWellnessState }) => 
  state.corporateWellness.employees.filter(emp => emp.isActive);

export const selectDepartments = (state: { corporateWellness: CorporateWellnessState }) => 
  state.corporateWellness.departments;

export const selectChallenges = (state: { corporateWellness: CorporateWellnessState }) => 
  state.corporateWellness.challenges;

export const selectActiveChallenges = (state: { corporateWellness: CorporateWellnessState }) => 
  state.corporateWellness.challenges.filter(challenge => challenge.status === 'active');

export const selectPrograms = (state: { corporateWellness: CorporateWellnessState }) => 
  state.corporateWellness.programs;

export const selectActivePrograms = (state: { corporateWellness: CorporateWellnessState }) => 
  state.corporateWellness.programs.filter(program => program.isActive);

export const selectMetrics = (state: { corporateWellness: CorporateWellnessState }) => 
  state.corporateWellness.metrics;

export const selectEmployeesByDepartment = (departmentId: string) => 
  (state: { corporateWellness: CorporateWellnessState }) =>
    state.corporateWellness.employees.filter(emp => emp.department === departmentId);

export const selectTopPerformers = (limit = 10) => 
  (state: { corporateWellness: CorporateWellnessState }) =>
    [...state.corporateWellness.employees]
      .sort((a, b) => b.fitnessScore - a.fitnessScore)
      .slice(0, limit);

export const selectDepartmentMetrics = (departmentId: string) => 
  (state: { corporateWellness: CorporateWellnessState }) => {
    const employees = state.corporateWellness.employees.filter(emp => emp.department === departmentId);
    const department = state.corporateWellness.departments.find(dept => dept.id === departmentId);
    
    if (!employees.length || !department) return null;
    
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.isActive).length;
    const averageFitnessScore = employees.reduce((sum, emp) => sum + emp.fitnessScore, 0) / totalEmployees;
    const totalActiveMinutes = employees.reduce((sum, emp) => sum + emp.activeMinutes, 0);
    const totalChallengesCompleted = employees.reduce((sum, emp) => sum + emp.challengesCompleted, 0);
    
    return {
      ...department,
      totalEmployees,
      activeEmployees,
      participationRate: (activeEmployees / totalEmployees) * 100,
      averageFitnessScore,
      totalActiveMinutes,
      totalChallengesCompleted
    };
  };

export const selectChallengeParticipation = (challengeId: string) => 
  (state: { corporateWellness: CorporateWellnessState }) => {
    const challenge = state.corporateWellness.challenges.find(c => c.id === challengeId);
    const totalEmployees = state.corporateWellness.employees.length;
    
    if (!challenge) return 0;
    
    return (challenge.participants.length / totalEmployees) * 100;
  };

export const selectHealthTrends = (state: { corporateWellness: CorporateWellnessState }) => {
  const employees = state.corporateWellness.employees;
  
  if (!employees.length) return null;
  
  const totalEmployees = employees.length;
  const averageFitnessScore = employees.reduce((sum, emp) => sum + emp.fitnessScore, 0) / totalEmployees;
  const averageActiveMinutes = employees.reduce((sum, emp) => sum + emp.activeMinutes, 0) / totalEmployees;
  
  // Calculate health risk distribution
  const healthRisks = {
    low: employees.filter(emp => emp.fitnessScore >= 80).length,
    medium: employees.filter(emp => emp.fitnessScore >= 60 && emp.fitnessScore < 80).length,
    high: employees.filter(emp => emp.fitnessScore < 60).length
  };
  
  return {
    averageFitnessScore,
    averageActiveMinutes,
    healthRisks,
    participationRate: (employees.filter(emp => emp.isActive).length / totalEmployees) * 100
  };
};

export const selectROICalculation = (state: { corporateWellness: CorporateWellnessState }) => {
  const metrics = state.corporateWellness.metrics;
  if (!metrics) return null;
  
  const totalCosts = metrics.financial.programCosts;
  const totalSavings = metrics.financial.healthcareSavings + metrics.financial.productivityGains;
  const roi = ((totalSavings - totalCosts) / totalCosts) * 100;
  
  return {
    totalCosts,
    totalSavings,
    netBenefit: totalSavings - totalCosts,
    roi,
    costPerEmployee: metrics.financial.costPerEmployee,
    paybackPeriod: totalCosts / (totalSavings / 12) // months
  };
};

export const {
  setLoading,
  setError,
  clearError,
  setCompanyProfile,
  updateCompanySettings,
  setEmployees,
  addEmployee,
  updateEmployee,
  removeEmployee,
  updateEmployeeMetrics,
  setDepartments,
  addDepartment,
  updateDepartment,
  removeDepartment,
  setChallenges,
  addChallenge,
  updateChallenge,
  removeChallenge,
  addChallengeParticipant,
  removeChallengeParticipant,
  updateChallengeLeaderboard,
  setPrograms,
  addProgram,
  updateProgram,
  removeProgram,
  setIntegrations,
  addIntegration,
  updateIntegration,
  removeIntegration,
  setMetrics,
  updateMetrics,
  setTimeframe,
  setSelectedDepartment,
  setFilters,
  clearFilters,
  resetCorporateWellnessState
} = corporateWellnessSlice.actions;

export default corporateWellnessSlice.reducer;
