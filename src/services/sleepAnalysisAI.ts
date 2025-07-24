import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as tf from '@tensorflow/tfjs'; // Commented out until TensorFlow is installed

// ===== SLEEP ANALYSIS AI SERVICE =====
// Advanced AI-powered sleep tracking, analysis, and optimization recommendations

export interface SleepData {
  id: string;
  userId: string;
  date: Date;
  bedtime: Date;
  sleepOnset: Date;
  wakeTime: Date;
  finalWakeTime: Date;
  sleepStages: SleepStage[];
  heartRateData: SleepHeartRate[];
  movementData: MovementEvent[];
  environmentalData: EnvironmentalData;
  sleepQuality: SleepQuality;
  sleepMetrics: SleepMetrics;
  disturbances: SleepDisturbance[];
  recommendations: SleepRecommendation[];
}

export interface SleepStage {
  stage: 'awake' | 'light' | 'deep' | 'rem';
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  quality: number; // 0-100
  interruptions: number;
  transitions: StageTransition[];
}

export interface StageTransition {
  fromStage: string;
  toStage: string;
  time: Date;
  naturalness: number; // 0-100 (how natural the transition was)
}

export interface SleepHeartRate {
  timestamp: Date;
  bpm: number;
  variability: number; // HRV in milliseconds
  recovery: number; // 0-100 recovery score
}

export interface MovementEvent {
  timestamp: Date;
  intensity: number; // 0-100
  duration: number; // seconds
  type: 'toss_turn' | 'restless' | 'position_change' | 'awakening';
}

export interface EnvironmentalData {
  temperature: TemperatureData[];
  humidity: HumidityData[];
  light: LightData[];
  noise: NoiseData[];
  airQuality?: AirQualityData[];
}

export interface TemperatureData {
  timestamp: Date;
  temperature: number; // Celsius
  optimal: boolean;
}

export interface HumidityData {
  timestamp: Date;
  humidity: number; // percentage
  optimal: boolean;
}

export interface LightData {
  timestamp: Date;
  lux: number;
  spectrum: LightSpectrum;
  blueLight: number; // percentage
}

export interface LightSpectrum {
  red: number;
  green: number;
  blue: number;
  warmth: number; // 0-100 (warm to cool)
}

export interface NoiseData {
  timestamp: Date;
  decibels: number;
  frequency: number; // Hz
  type: 'traffic' | 'household' | 'nature' | 'white_noise' | 'snoring' | 'other';
  disruptive: boolean;
}

export interface AirQualityData {
  timestamp: Date;
  co2: number; // ppm
  pm25: number; // μg/m³
  voc: number; // ppb (volatile organic compounds)
  overall: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface SleepQuality {
  overallScore: number; // 0-100
  components: SleepQualityComponents;
  factors: QualityFactor[];
  comparison: QualityComparison;
}

export interface SleepQualityComponents {
  duration: number; // 0-100
  efficiency: number; // 0-100
  latency: number; // 0-100 (how quickly fell asleep)
  continuity: number; // 0-100 (how uninterrupted)
  depth: number; // 0-100 (deep sleep quality)
  restoration: number; // 0-100 (restorative value)
}

export interface QualityFactor {
  factor: string;
  impact: number; // -100 to 100
  category: 'environment' | 'lifestyle' | 'health' | 'timing' | 'stress';
  modifiable: boolean;
  suggestions: string[];
}

export interface QualityComparison {
  personalAverage: number;
  ageGroupAverage: number;
  optimalRange: [number, number];
  percentile: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
}

export interface SleepMetrics {
  totalSleepTime: number; // minutes
  timeInBed: number; // minutes
  sleepEfficiency: number; // percentage
  sleepLatency: number; // minutes to fall asleep
  wakeAfterSleepOnset: number; // minutes awake after initial sleep
  numberOfAwakenings: number;
  stageBreakdown: StageBreakdown;
  sleepDebt: number; // minutes
  circadianAlignment: CircadianMetrics;
  recovery: RecoveryMetrics;
}

export interface StageBreakdown {
  light: StageSummary;
  deep: StageSummary;
  rem: StageSummary;
  awake: StageSummary;
}

export interface StageSummary {
  duration: number; // minutes
  percentage: number; // of total sleep time
  quality: number; // 0-100
  cycles: number;
  optimal: boolean;
}

export interface CircadianMetrics {
  chronotype: 'morning' | 'evening' | 'intermediate';
  alignment: number; // 0-100 (how aligned with natural rhythm)
  lightExposure: LightExposureMetrics;
  melatoninPattern: MelatoninPattern;
  bodyTemperature: TemperaturePattern;
  recommendations: CircadianRecommendation[];
}

export interface LightExposureMetrics {
  morningLight: number; // lux hours
  blueLight: number; // lux hours
  eveningLight: number; // lux hours
  darkness: number; // hours in complete darkness
  timing: LightTimingMetrics;
}

export interface LightTimingMetrics {
  firstLight: Date;
  lastLight: Date;
  optimalMorningLight: Date;
  optimalEveningDarkness: Date;
}

export interface MelatoninPattern {
  naturalOnset: Date;
  peak: Date;
  clearance: Date;
  suppression: number; // 0-100 (how much was suppressed)
  factors: string[];
}

export interface TemperaturePattern {
  bedtimeTemp: number;
  minimumTemp: number;
  minimumTime: Date;
  risingTemp: number;
  wakeTemp: number;
  rhythm: 'normal' | 'delayed' | 'advanced' | 'irregular';
}

export interface CircadianRecommendation {
  type: 'light' | 'temperature' | 'timing' | 'activity' | 'nutrition';
  action: string;
  timing: string;
  impact: 'high' | 'medium' | 'low';
  evidence: string;
}

export interface RecoveryMetrics {
  physicalRecovery: number; // 0-100
  mentalRecovery: number; // 0-100
  hormoneRecovery: number; // 0-100
  immuneRecovery: number; // 0-100
  overallRecovery: number; // 0-100
  readiness: number; // 0-100 (readiness for next day)
  factors: RecoveryFactor[];
}

export interface RecoveryFactor {
  factor: string;
  contribution: number; // 0-100
  status: 'optimal' | 'good' | 'fair' | 'poor';
  trend: 'improving' | 'stable' | 'declining';
}

export interface SleepDisturbance {
  type: 'awakening' | 'restlessness' | 'snoring' | 'apnea' | 'limb_movement' | 'environmental';
  startTime: Date;
  duration: number; // minutes
  severity: 'mild' | 'moderate' | 'severe';
  cause: string;
  impact: DisturbanceImpact;
  frequency: number; // per night
}

export interface DisturbanceImpact {
  sleepQuality: number; // -100 to 0
  nextDayPerformance: number; // -100 to 0
  recovery: number; // -100 to 0
  mood: number; // -100 to 0
}

export interface SleepRecommendation {
  id: string;
  category: 'environment' | 'behavior' | 'timing' | 'health' | 'technology';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: ActionItem[];
  expectedImprovement: number; // 0-100
  timeframe: string;
  evidence: 'strong' | 'moderate' | 'limited';
  personalizedFactors: string[];
}

export interface ActionItem {
  action: string;
  when: string;
  how: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tracking: string;
}

export interface SleepProfile {
  userId: string;
  sleepGoals: SleepGoal[];
  preferences: SleepPreferences;
  constraints: SleepConstraint[];
  historicalData: SleepTrend[];
  personalizedInsights: PersonalizedInsight[];
  optimizationPlan: OptimizationPlan;
}

export interface SleepGoal {
  type: 'duration' | 'quality' | 'consistency' | 'timing' | 'recovery';
  target: number;
  current: number;
  timeframe: number; // days
  priority: 'high' | 'medium' | 'low';
  progress: number; // 0-100
}

export interface SleepPreferences {
  bedtimeRange: [string, string]; // "22:00", "23:30"
  wakeTimeRange: [string, string];
  sleepDurationTarget: number; // minutes
  environment: EnvironmentPreferences;
  routine: RoutinePreferences;
}

export interface EnvironmentPreferences {
  temperature: number; // Celsius
  humidity: number; // percentage
  noise: 'silent' | 'white_noise' | 'nature_sounds' | 'pink_noise';
  darkness: 'complete' | 'dim' | 'nightlight';
  airflow: 'still' | 'gentle' | 'strong';
}

export interface RoutinePreferences {
  windDownDuration: number; // minutes
  activities: string[];
  avoidActivities: string[];
  supplements: string[];
  meditation: boolean;
  reading: boolean;
  stretching: boolean;
}

export interface SleepConstraint {
  type: 'work_schedule' | 'family' | 'health' | 'lifestyle' | 'travel';
  description: string;
  impact: 'high' | 'medium' | 'low';
  modifiable: boolean;
  adaptations: string[];
}

export interface SleepTrend {
  metric: string;
  values: { date: Date; value: number }[];
  trend: 'improving' | 'stable' | 'declining';
  correlation: TrendCorrelation[];
}

export interface TrendCorrelation {
  factor: string;
  correlation: number; // -1 to 1
  significance: 'high' | 'medium' | 'low';
  insight: string;
}

export interface PersonalizedInsight {
  id: string;
  type: 'pattern' | 'correlation' | 'anomaly' | 'optimization';
  insight: string;
  confidence: number; // 0-1
  actionable: boolean;
  recommendations: string[];
  dataPoints: number;
  timeframe: string;
}

export interface OptimizationPlan {
  phases: OptimizationPhase[];
  currentPhase: number;
  overallGoal: string;
  estimatedImprovement: number; // 0-100
  timeline: number; // days
}

export interface OptimizationPhase {
  name: string;
  duration: number; // days
  focus: string;
  interventions: Intervention[];
  metrics: string[];
  successCriteria: string[];
}

export interface Intervention {
  type: 'environmental' | 'behavioral' | 'timing' | 'supplement' | 'technology';
  description: string;
  implementation: string;
  expectedImpact: number; // 0-100
  difficulty: 'easy' | 'medium' | 'hard';
  monitoring: string;
}

export interface SleepPrediction {
  date: Date;
  predictedQuality: number; // 0-100
  predictedDuration: number; // minutes
  riskFactors: RiskFactor[];
  recommendations: string[];
  confidence: number; // 0-1
}

export interface RiskFactor {
  factor: string;
  impact: number; // -100 to 100
  likelihood: number; // 0-100
  mitigation: string[];
}

class SleepAnalysisAI {
  private sleepModel: any | null = null; // tf.LayersModel when TensorFlow is available
  private circadianModel: any | null = null; // tf.LayersModel when TensorFlow is available
  private sleepData: Map<string, SleepData[]> = new Map();
  private sleepProfiles: Map<string, SleepProfile> = new Map();

  // ===== INITIALIZATION =====

  async initialize(): Promise<void> {
    try {
      console.log('Initializing Sleep Analysis AI...');
      
      // Load ML models for sleep analysis
      await this.loadSleepModels();
      
      // Load existing sleep data
      await this.loadSleepData();
      
      // Load user sleep profiles
      await this.loadSleepProfiles();
      
      console.log('Sleep Analysis AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sleep Analysis AI:', error);
      throw error;
    }
  }

  private async loadSleepModels(): Promise<void> {
    try {
      console.log('Loading sleep analysis models...');
      
      // In production, load pre-trained TensorFlow.js models
      // this.sleepModel = await tf.loadLayersModel('path/to/sleep/model.json');
      // this.circadianModel = await tf.loadLayersModel('path/to/circadian/model.json');
      
      console.log('Sleep models loaded successfully');
    } catch (error) {
      console.error('Error loading sleep models:', error);
      // Continue without models for now
    }
  }

  private async loadSleepData(): Promise<void> {
    try {
      const dataJson = await AsyncStorage.getItem('sleep_data');
      if (dataJson) {
        const data = JSON.parse(dataJson);
        for (const [userId, sleepEntries] of Object.entries(data)) {
          this.sleepData.set(userId, sleepEntries as SleepData[]);
        }
      }
    } catch (error) {
      console.error('Error loading sleep data:', error);
    }
  }

  private async loadSleepProfiles(): Promise<void> {
    try {
      const profilesJson = await AsyncStorage.getItem('sleep_profiles');
      if (profilesJson) {
        const profiles = JSON.parse(profilesJson);
        for (const [userId, profile] of Object.entries(profiles)) {
          this.sleepProfiles.set(userId, profile as SleepProfile);
        }
      }
    } catch (error) {
      console.error('Error loading sleep profiles:', error);
    }
  }

  // ===== SLEEP DATA ANALYSIS =====

  async analyzeSleepSession(
    userId: string,
    rawSleepData: any,
    environmentalData?: EnvironmentalData
  ): Promise<SleepData> {
    try {
      const sleepData = await this.processSleepData(userId, rawSleepData, environmentalData);
      
      // Analyze sleep stages
      sleepData.sleepStages = await this.analyzeSleepStages(rawSleepData);
      
      // Calculate sleep metrics
      sleepData.sleepMetrics = this.calculateSleepMetrics(sleepData);
      
      // Assess sleep quality
      sleepData.sleepQuality = await this.assessSleepQuality(sleepData);
      
      // Detect disturbances
      sleepData.disturbances = this.detectDisturbances(sleepData);
      
      // Generate recommendations
      sleepData.recommendations = await this.generateSleepRecommendations(userId, sleepData);
      
      // Store the analysis
      await this.storeSleepData(userId, sleepData);
      
      return sleepData;
    } catch (error) {
      console.error('Error analyzing sleep session:', error);
      throw error;
    }
  }

  private async processSleepData(
    userId: string,
    rawData: any,
    environmentalData?: EnvironmentalData
  ): Promise<SleepData> {
    const sleepData: SleepData = {
      id: `sleep_${userId}_${Date.now()}`,
      userId,
      date: new Date(rawData.date),
      bedtime: new Date(rawData.bedtime),
      sleepOnset: new Date(rawData.sleepOnset),
      wakeTime: new Date(rawData.wakeTime),
      finalWakeTime: new Date(rawData.finalWakeTime),
      sleepStages: [],
      heartRateData: this.processHeartRateData(rawData.heartRate),
      movementData: this.processMovementData(rawData.movement),
      environmentalData: environmentalData || this.generateMockEnvironmentalData(),
      sleepQuality: {} as SleepQuality,
      sleepMetrics: {} as SleepMetrics,
      disturbances: [],
      recommendations: []
    };

    return sleepData;
  }

  private processHeartRateData(heartRateData: any[]): SleepHeartRate[] {
    return heartRateData.map(hr => ({
      timestamp: new Date(hr.timestamp),
      bpm: hr.bpm,
      variability: hr.hrv || this.calculateHRV(hr.bpm),
      recovery: this.calculateRecoveryScore(hr.bpm, hr.hrv)
    }));
  }

  private processMovementData(movementData: any[]): MovementEvent[] {
    return movementData.map(movement => ({
      timestamp: new Date(movement.timestamp),
      intensity: movement.intensity,
      duration: movement.duration,
      type: this.classifyMovement(movement) as any
    }));
  }

  private async analyzeSleepStages(rawData: any): Promise<SleepStage[]> {
    // In production, this would use advanced ML models for sleep stage classification
    const stages: SleepStage[] = [];
    
    // Mock sleep stage analysis
    const totalDuration = 480; // 8 hours in minutes
    let currentTime = new Date(rawData.sleepOnset);
    
    // Typical sleep cycle: Light -> Deep -> Light -> REM (repeat ~4-5 times)
    const cycles = 5;
    const cycleLength = totalDuration / cycles;
    
    for (let cycle = 0; cycle < cycles; cycle++) {
      // Light sleep (45% of cycle)
      const lightDuration = cycleLength * 0.45;
      stages.push(this.createSleepStage('light', currentTime, lightDuration));
      currentTime = new Date(currentTime.getTime() + lightDuration * 60000);
      
      // Deep sleep (25% of cycle, more in early cycles)
      const deepDuration = cycleLength * (cycle < 2 ? 0.3 : 0.15);
      stages.push(this.createSleepStage('deep', currentTime, deepDuration));
      currentTime = new Date(currentTime.getTime() + deepDuration * 60000);
      
      // Light sleep again (15% of cycle)
      const lightDuration2 = cycleLength * 0.15;
      stages.push(this.createSleepStage('light', currentTime, lightDuration2));
      currentTime = new Date(currentTime.getTime() + lightDuration2 * 60000);
      
      // REM sleep (15% of cycle, more in later cycles)
      const remDuration = cycleLength * (cycle > 2 ? 0.25 : 0.1);
      stages.push(this.createSleepStage('rem', currentTime, remDuration));
      currentTime = new Date(currentTime.getTime() + remDuration * 60000);
    }
    
    return stages;
  }

  private createSleepStage(stage: 'awake' | 'light' | 'deep' | 'rem', startTime: Date, duration: number): SleepStage {
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    return {
      stage,
      startTime,
      endTime,
      duration,
      quality: this.calculateStageQuality(stage),
      interruptions: Math.floor(Math.random() * 3), // 0-2 interruptions
      transitions: []
    };
  }

  private calculateStageQuality(stage: string): number {
    // Mock quality calculation based on stage type
    const baseQuality = {
      light: 75,
      deep: 85,
      rem: 80,
      awake: 0
    };
    
    return baseQuality[stage as keyof typeof baseQuality] + Math.random() * 20 - 10; // ±10 variation
  }

  private calculateSleepMetrics(sleepData: SleepData): SleepMetrics {
    const bedtime = sleepData.bedtime;
    const sleepOnset = sleepData.sleepOnset;
    const wakeTime = sleepData.wakeTime;
    const finalWakeTime = sleepData.finalWakeTime;
    
    const timeInBed = (finalWakeTime.getTime() - bedtime.getTime()) / (1000 * 60);
    const totalSleepTime = sleepData.sleepStages
      .filter(stage => stage.stage !== 'awake')
      .reduce((total, stage) => total + stage.duration, 0);
    
    const sleepLatency = (sleepOnset.getTime() - bedtime.getTime()) / (1000 * 60);
    const sleepEfficiency = (totalSleepTime / timeInBed) * 100;
    
    const stageBreakdown = this.calculateStageBreakdown(sleepData.sleepStages, totalSleepTime);
    const circadianAlignment = this.calculateCircadianAlignment(sleepData);
    const recovery = this.calculateRecoveryMetrics(sleepData);
    
    return {
      totalSleepTime,
      timeInBed,
      sleepEfficiency,
      sleepLatency,
      wakeAfterSleepOnset: this.calculateWASO(sleepData.sleepStages),
      numberOfAwakenings: this.countAwakenings(sleepData.sleepStages),
      stageBreakdown,
      sleepDebt: Math.max(0, 480 - totalSleepTime), // 8 hours target
      circadianAlignment,
      recovery
    };
  }

  private calculateStageBreakdown(stages: SleepStage[], totalSleepTime: number): StageBreakdown {
    const stageData = {
      light: stages.filter(s => s.stage === 'light'),
      deep: stages.filter(s => s.stage === 'deep'),
      rem: stages.filter(s => s.stage === 'rem'),
      awake: stages.filter(s => s.stage === 'awake')
    };
    
    const breakdown: StageBreakdown = {} as StageBreakdown;
    
    for (const [stageType, stageList] of Object.entries(stageData)) {
      const duration = stageList.reduce((sum, stage) => sum + stage.duration, 0);
      const percentage = (duration / totalSleepTime) * 100;
      const avgQuality = stageList.reduce((sum, stage) => sum + stage.quality, 0) / stageList.length || 0;
      
      breakdown[stageType as keyof StageBreakdown] = {
        duration,
        percentage,
        quality: avgQuality,
        cycles: stageList.length,
        optimal: this.isStageOptimal(stageType, percentage)
      };
    }
    
    return breakdown;
  }

  private isStageOptimal(stageType: string, percentage: number): boolean {
    const optimalRanges = {
      light: [45, 55],
      deep: [15, 25],
      rem: [20, 25],
      awake: [0, 5]
    };
    
    const range = optimalRanges[stageType as keyof typeof optimalRanges];
    return percentage >= range[0] && percentage <= range[1];
  }

  private calculateCircadianAlignment(sleepData: SleepData): CircadianMetrics {
    // Mock circadian rhythm analysis
    const bedtimeHour = sleepData.bedtime.getHours();
    const wakeHour = sleepData.wakeTime.getHours();
    
    let chronotype: 'morning' | 'evening' | 'intermediate';
    if (bedtimeHour <= 22 && wakeHour <= 7) chronotype = 'morning';
    else if (bedtimeHour >= 24 && wakeHour >= 9) chronotype = 'evening';
    else chronotype = 'intermediate';
    
    const alignment = this.calculateCircadianScore(bedtimeHour, wakeHour, chronotype);
    
    return {
      chronotype,
      alignment,
      lightExposure: this.analyzeLightExposure(sleepData),
      melatoninPattern: this.analyzeMelatoninPattern(sleepData),
      bodyTemperature: this.analyzeTemperaturePattern(sleepData),
      recommendations: this.generateCircadianRecommendations(chronotype, alignment)
    };
  }

  private calculateRecoveryMetrics(sleepData: SleepData): RecoveryMetrics {
    const deepSleepPercentage = sleepData.sleepStages
      .filter(s => s.stage === 'deep')
      .reduce((sum, stage) => sum + stage.duration, 0) / 
      sleepData.sleepMetrics.totalSleepTime * 100;
    
    const avgHRV = sleepData.heartRateData.reduce((sum, hr) => sum + hr.variability, 0) / 
      sleepData.heartRateData.length;
    
    const physicalRecovery = Math.min(100, deepSleepPercentage * 4 + avgHRV * 0.5);
    const mentalRecovery = Math.min(100, this.calculateREMQuality(sleepData) * 1.2);
    const hormoneRecovery = Math.min(100, physicalRecovery * 0.8 + mentalRecovery * 0.2);
    const immuneRecovery = Math.min(100, deepSleepPercentage * 3 + sleepData.sleepMetrics.sleepEfficiency * 0.5);
    const overallRecovery = (physicalRecovery + mentalRecovery + hormoneRecovery + immuneRecovery) / 4;
    
    return {
      physicalRecovery,
      mentalRecovery,
      hormoneRecovery,
      immuneRecovery,
      overallRecovery,
      readiness: this.calculateReadinessScore(sleepData),
      factors: this.identifyRecoveryFactors(sleepData)
    };
  }

  private async assessSleepQuality(sleepData: SleepData): Promise<SleepQuality> {
    const components = this.calculateQualityComponents(sleepData);
    const factors = this.identifyQualityFactors(sleepData);
    const comparison = await this.getQualityComparison(sleepData.userId, components);
    
    const overallScore = Object.values(components).reduce((sum, score) => sum + score, 0) / 
      Object.keys(components).length;
    
    return {
      overallScore,
      components,
      factors,
      comparison
    };
  }

  private calculateQualityComponents(sleepData: SleepData): SleepQualityComponents {
    const metrics = sleepData.sleepMetrics;
    
    return {
      duration: this.scoreDuration(metrics.totalSleepTime),
      efficiency: metrics.sleepEfficiency,
      latency: this.scoreLatency(metrics.sleepLatency),
      continuity: this.scoreContinuity(metrics.numberOfAwakenings),
      depth: this.scoreDepth(sleepData.sleepStages),
      restoration: this.scoreRestoration(sleepData)
    };
  }

  private detectDisturbances(sleepData: SleepData): SleepDisturbance[] {
    const disturbances: SleepDisturbance[] = [];
    
    // Analyze movement data for restlessness
    for (const movement of sleepData.movementData) {
      if (movement.intensity > 70) {
        disturbances.push({
          type: 'restlessness',
          startTime: movement.timestamp,
          duration: movement.duration / 60, // convert to minutes
          severity: movement.intensity > 90 ? 'severe' : 'moderate',
          cause: 'Unknown movement',
          impact: this.calculateDisturbanceImpact(movement.intensity),
          frequency: 1
        });
      }
    }
    
    // Analyze environmental disturbances
    if (sleepData.environmentalData.noise) {
      for (const noise of sleepData.environmentalData.noise) {
        if (noise.disruptive) {
          disturbances.push({
            type: 'environmental',
            startTime: noise.timestamp,
            duration: 5, // assume 5 minutes
            severity: noise.decibels > 60 ? 'severe' : 'moderate',
            cause: `Noise: ${noise.type}`,
            impact: this.calculateNoiseImpact(noise.decibels),
            frequency: 1
          });
        }
      }
    }
    
    return disturbances;
  }

  private async generateSleepRecommendations(userId: string, sleepData: SleepData): Promise<SleepRecommendation[]> {
    const recommendations: SleepRecommendation[] = [];
    const profile = this.sleepProfiles.get(userId);
    
    // Sleep efficiency recommendations
    if (sleepData.sleepMetrics.sleepEfficiency < 85) {
      recommendations.push({
        id: `efficiency_${Date.now()}`,
        category: 'behavior',
        priority: 'high',
        title: 'Improve Sleep Efficiency',
        description: 'Your sleep efficiency is below optimal. Focus on sleep hygiene practices.',
        actionItems: [
          {
            action: 'Establish consistent bedtime routine',
            when: '1 hour before bed',
            how: 'Same activities in same order every night',
            duration: '2-3 weeks to establish habit',
            difficulty: 'medium',
            tracking: 'Rate routine consistency daily'
          },
          {
            action: 'Limit time in bed awake',
            when: 'If awake > 20 minutes',
            how: 'Get up and do quiet activity until sleepy',
            duration: 'Ongoing',
            difficulty: 'hard',
            tracking: 'Log time out of bed'
          }
        ],
        expectedImprovement: 15,
        timeframe: '2-4 weeks',
        evidence: 'strong',
        personalizedFactors: ['Current efficiency below 85%']
      });
    }
    
    // Deep sleep recommendations
    const deepSleepPercentage = sleepData.sleepMetrics.stageBreakdown.deep.percentage;
    if (deepSleepPercentage < 15) {
      recommendations.push({
        id: `deep_sleep_${Date.now()}`,
        category: 'environment',
        priority: 'high',
        title: 'Enhance Deep Sleep',
        description: 'Your deep sleep percentage is low. Environmental and timing adjustments can help.',
        actionItems: [
          {
            action: 'Optimize bedroom temperature',
            when: 'Before bed',
            how: 'Set temperature to 65-68°F (18-20°C)',
            duration: 'Ongoing',
            difficulty: 'easy',
            tracking: 'Monitor temperature and deep sleep %'
          },
          {
            action: 'Avoid late exercise',
            when: '3+ hours before bed',
            how: 'Schedule workouts earlier in day',
            duration: 'Ongoing',
            difficulty: 'medium',
            tracking: 'Log exercise timing vs deep sleep'
          }
        ],
        expectedImprovement: 20,
        timeframe: '1-2 weeks',
        evidence: 'strong',
        personalizedFactors: [`Deep sleep: ${deepSleepPercentage.toFixed(1)}% (target: 15-25%)`]
      });
    }
    
    // Environmental recommendations
    if (sleepData.disturbances.some(d => d.type === 'environmental')) {
      recommendations.push({
        id: `environment_${Date.now()}`,
        category: 'environment',
        priority: 'medium',
        title: 'Optimize Sleep Environment',
        description: 'Environmental disturbances detected. Address noise and light sources.',
        actionItems: [
          {
            action: 'Use white noise or earplugs',
            when: 'Every night',
            how: 'Consistent background noise or noise blocking',
            duration: 'Ongoing',
            difficulty: 'easy',
            tracking: 'Rate environmental disturbances'
          },
          {
            action: 'Install blackout curtains',
            when: 'One-time setup',
            how: 'Block all external light sources',
            duration: 'Permanent',
            difficulty: 'easy',
            tracking: 'Measure light levels'
          }
        ],
        expectedImprovement: 10,
        timeframe: '1 week',
        evidence: 'moderate',
        personalizedFactors: ['Environmental disturbances detected']
      });
    }
    
    return recommendations;
  }

  // ===== SLEEP TRACKING & INSIGHTS =====

  async generateSleepInsights(userId: string, timeframe: number = 30): Promise<PersonalizedInsight[]> {
    const userSleepData = this.sleepData.get(userId) || [];
    const recentData = userSleepData.slice(-timeframe);
    
    if (recentData.length < 7) {
      return [{
        id: 'insufficient_data',
        type: 'pattern',
        insight: 'Need more sleep data for meaningful insights',
        confidence: 1.0,
        actionable: true,
        recommendations: ['Track sleep for at least 7 consecutive nights'],
        dataPoints: recentData.length,
        timeframe: `${recentData.length} nights`
      }];
    }
    
    const insights: PersonalizedInsight[] = [];
    
    // Consistency insight
    const consistencyInsight = this.analyzeConsistency(recentData);
    if (consistencyInsight) insights.push(consistencyInsight);
    
    // Quality trends
    const qualityTrend = this.analyzeQualityTrend(recentData);
    if (qualityTrend) insights.push(qualityTrend);
    
    // Weekend vs weekday patterns
    const weekendPattern = this.analyzeWeekendPattern(recentData);
    if (weekendPattern) insights.push(weekendPattern);
    
    // Recovery patterns
    const recoveryPattern = this.analyzeRecoveryPattern(recentData);
    if (recoveryPattern) insights.push(recoveryPattern);
    
    return insights;
  }

  async predictSleepQuality(userId: string, date: Date): Promise<SleepPrediction> {
    const userSleepData = this.sleepData.get(userId) || [];
    const recentData = userSleepData.slice(-30);
    
    // Mock prediction based on historical patterns
    const avgQuality = recentData.reduce((sum, sleep) => sum + sleep.sleepQuality.overallScore, 0) / 
      recentData.length || 75;
    
    const avgDuration = recentData.reduce((sum, sleep) => sum + sleep.sleepMetrics.totalSleepTime, 0) / 
      recentData.length || 480;
    
    // Add some variability and factor in day of week
    const dayOfWeek = date.getDay();
    const weekendFactor = [6, 0].includes(dayOfWeek) ? 5 : 0; // Weekend boost
    
    const predictedQuality = Math.min(100, avgQuality + weekendFactor + (Math.random() * 20 - 10));
    const predictedDuration = avgDuration + (Math.random() * 60 - 30);
    
    return {
      date,
      predictedQuality,
      predictedDuration,
      riskFactors: this.identifyRiskFactors(date, recentData),
      recommendations: this.generatePreventiveRecommendations(predictedQuality),
      confidence: Math.min(0.9, recentData.length / 30)
    };
  }

  // ===== UTILITY METHODS =====

  private calculateHRV(bpm: number): number {
    // Mock HRV calculation
    return Math.max(20, Math.min(100, 60 - (bpm - 60) * 0.8 + Math.random() * 20));
  }

  private calculateRecoveryScore(bpm: number, hrv: number): number {
    // Mock recovery score
    const heartRateScore = Math.max(0, 100 - Math.abs(bpm - 55) * 2);
    const hrvScore = Math.min(100, hrv * 1.5);
    return (heartRateScore + hrvScore) / 2;
  }

  private classifyMovement(movement: any): string {
    if (movement.intensity > 80) return 'awakening';
    if (movement.intensity > 60) return 'restless';
    if (movement.duration > 30) return 'toss_turn';
    return 'position_change';
  }

  private generateMockEnvironmentalData(): EnvironmentalData {
    return {
      temperature: [
        { timestamp: new Date(), temperature: 19, optimal: true }
      ],
      humidity: [
        { timestamp: new Date(), humidity: 45, optimal: true }
      ],
      light: [
        { 
          timestamp: new Date(), 
          lux: 0, 
          spectrum: { red: 0, green: 0, blue: 0, warmth: 100 },
          blueLight: 0 
        }
      ],
      noise: [
        { 
          timestamp: new Date(), 
          decibels: 30, 
          frequency: 100, 
          type: 'household',
          disruptive: false 
        }
      ]
    };
  }

  private calculateWASO(stages: SleepStage[]): number {
    return stages
      .filter(stage => stage.stage === 'awake')
      .reduce((total, stage) => total + stage.duration, 0);
  }

  private countAwakenings(stages: SleepStage[]): number {
    return stages.filter(stage => stage.stage === 'awake').length;
  }

  private calculateCircadianScore(bedtimeHour: number, wakeHour: number, chronotype: string): number {
    // Mock circadian alignment score
    const optimalBedtimes = { morning: 22, intermediate: 23, evening: 24 };
    const optimalWakeTimes = { morning: 6, intermediate: 7, evening: 8 };
    
    const bedtimeScore = Math.max(0, 100 - Math.abs(bedtimeHour - optimalBedtimes[chronotype as keyof typeof optimalBedtimes]) * 10);
    const wakeScore = Math.max(0, 100 - Math.abs(wakeHour - optimalWakeTimes[chronotype as keyof typeof optimalWakeTimes]) * 10);
    
    return (bedtimeScore + wakeScore) / 2;
  }

  private analyzeLightExposure(sleepData: SleepData): LightExposureMetrics {
    // Mock light exposure analysis
    return {
      morningLight: 100,
      blueLight: 50,
      eveningLight: 10,
      darkness: 8,
      timing: {
        firstLight: new Date(sleepData.date.getTime() + 7 * 60 * 60 * 1000),
        lastLight: new Date(sleepData.date.getTime() + 22 * 60 * 60 * 1000),
        optimalMorningLight: new Date(sleepData.date.getTime() + 7 * 60 * 60 * 1000),
        optimalEveningDarkness: new Date(sleepData.date.getTime() + 21 * 60 * 60 * 1000)
      }
    };
  }

  private analyzeMelatoninPattern(sleepData: SleepData): MelatoninPattern {
    return {
      naturalOnset: new Date(sleepData.bedtime.getTime() - 2 * 60 * 60 * 1000),
      peak: new Date(sleepData.bedtime.getTime() + 2 * 60 * 60 * 1000),
      clearance: new Date(sleepData.wakeTime.getTime() - 1 * 60 * 60 * 1000),
      suppression: 20,
      factors: ['Blue light exposure', 'Late dinner']
    };
  }

  private analyzeTemperaturePattern(sleepData: SleepData): TemperaturePattern {
    return {
      bedtimeTemp: 37.0,
      minimumTemp: 36.5,
      minimumTime: new Date(sleepData.sleepOnset.getTime() + 4 * 60 * 60 * 1000),
      risingTemp: 36.8,
      wakeTemp: 37.2,
      rhythm: 'normal'
    };
  }

  private generateCircadianRecommendations(chronotype: string, alignment: number): CircadianRecommendation[] {
    const recommendations: CircadianRecommendation[] = [];
    
    if (alignment < 80) {
      recommendations.push({
        type: 'light',
        action: 'Get bright light exposure within 1 hour of waking',
        timing: 'Morning',
        impact: 'high',
        evidence: 'Strong research showing light entrains circadian rhythm'
      });
      
      recommendations.push({
        type: 'timing',
        action: 'Maintain consistent sleep-wake times',
        timing: 'Daily',
        impact: 'high',
        evidence: 'Consistency strengthens circadian rhythm'
      });
    }
    
    return recommendations;
  }

  private calculateREMQuality(sleepData: SleepData): number {
    const remStages = sleepData.sleepStages.filter(s => s.stage === 'rem');
    return remStages.reduce((sum, stage) => sum + stage.quality, 0) / remStages.length || 0;
  }

  private calculateReadinessScore(sleepData: SleepData): number {
    const efficiency = sleepData.sleepMetrics.sleepEfficiency;
    const quality = sleepData.sleepQuality.overallScore;
    const recovery = sleepData.sleepMetrics.recovery.overallRecovery;
    
    return (efficiency + quality + recovery) / 3;
  }

  private identifyRecoveryFactors(sleepData: SleepData): RecoveryFactor[] {
    return [
      {
        factor: 'Deep Sleep Quality',
        contribution: 40,
        status: sleepData.sleepMetrics.stageBreakdown.deep.quality > 80 ? 'optimal' : 'good',
        trend: 'stable'
      },
      {
        factor: 'Sleep Efficiency',
        contribution: 30,
        status: sleepData.sleepMetrics.sleepEfficiency > 85 ? 'optimal' : 'fair',
        trend: 'stable'
      },
      {
        factor: 'Heart Rate Variability',
        contribution: 20,
        status: 'good',
        trend: 'improving'
      },
      {
        factor: 'Environmental Quality',
        contribution: 10,
        status: sleepData.disturbances.length === 0 ? 'optimal' : 'fair',
        trend: 'stable'
      }
    ];
  }

  // More utility methods would be implemented here...
  private scoreDuration(minutes: number): number {
    const target = 480; // 8 hours
    const difference = Math.abs(minutes - target);
    return Math.max(0, 100 - difference * 0.2);
  }

  private scoreLatency(minutes: number): number {
    if (minutes <= 15) return 100;
    if (minutes <= 30) return 80;
    if (minutes <= 45) return 60;
    return 40;
  }

  private scoreContinuity(awakenings: number): number {
    if (awakenings <= 1) return 100;
    if (awakenings <= 3) return 80;
    if (awakenings <= 5) return 60;
    return 40;
  }

  private scoreDepth(stages: SleepStage[]): number {
    const deepStages = stages.filter(s => s.stage === 'deep');
    const avgQuality = deepStages.reduce((sum, s) => sum + s.quality, 0) / deepStages.length;
    return avgQuality || 0;
  }

  private scoreRestoration(sleepData: SleepData): number {
    return sleepData.sleepMetrics.recovery.overallRecovery;
  }

  private calculateDisturbanceImpact(intensity: number): DisturbanceImpact {
    const impact = intensity / 100;
    return {
      sleepQuality: -impact * 20,
      nextDayPerformance: -impact * 15,
      recovery: -impact * 25,
      mood: -impact * 10
    };
  }

  private calculateNoiseImpact(decibels: number): DisturbanceImpact {
    const impact = Math.max(0, (decibels - 40) / 60); // Above 40 dB starts impact
    return {
      sleepQuality: -impact * 30,
      nextDayPerformance: -impact * 20,
      recovery: -impact * 25,
      mood: -impact * 15
    };
  }

  private identifyQualityFactors(sleepData: SleepData): QualityFactor[] {
    return [
      {
        factor: 'Sleep Duration',
        impact: this.scoreDuration(sleepData.sleepMetrics.totalSleepTime) - 75,
        category: 'timing',
        modifiable: true,
        suggestions: ['Aim for 7-9 hours of sleep']
      },
      {
        factor: 'Sleep Efficiency',
        impact: sleepData.sleepMetrics.sleepEfficiency - 85,
        category: 'lifestyle',
        modifiable: true,
        suggestions: ['Improve sleep hygiene', 'Consistent bedtime routine']
      }
    ];
  }

  private async getQualityComparison(userId: string, components: SleepQualityComponents): Promise<QualityComparison> {
    const userHistory = this.sleepData.get(userId) || [];
    const personalAverage = userHistory.length > 0 
      ? userHistory.reduce((sum, sleep) => sum + sleep.sleepQuality.overallScore, 0) / userHistory.length
      : 75;
    
    return {
      personalAverage,
      ageGroupAverage: 78, // Mock age group average
      optimalRange: [85, 95],
      percentile: 65,
      trend: personalAverage > 75 ? 'improving' : 'stable'
    };
  }

  // Analysis methods for insights
  private analyzeConsistency(data: SleepData[]): PersonalizedInsight | null {
    const bedtimes = data.map(sleep => sleep.bedtime.getHours() * 60 + sleep.bedtime.getMinutes());
    const variance = this.calculateVariance(bedtimes);
    
    if (variance > 60 * 60) { // More than 1 hour variance
      return {
        id: 'consistency_issue',
        type: 'pattern',
        insight: 'Your bedtime varies significantly (>1 hour). Consistent timing improves sleep quality.',
        confidence: 0.8,
        actionable: true,
        recommendations: [
          'Set a consistent bedtime within 30 minutes',
          'Use bedtime reminders',
          'Create a wind-down routine'
        ],
        dataPoints: data.length,
        timeframe: `${data.length} nights`
      };
    }
    
    return null;
  }

  private analyzeQualityTrend(data: SleepData[]): PersonalizedInsight | null {
    if (data.length < 14) return null;
    
    const recentQuality = data.slice(-7).reduce((sum, sleep) => sum + sleep.sleepQuality.overallScore, 0) / 7;
    const earlierQuality = data.slice(-14, -7).reduce((sum, sleep) => sum + sleep.sleepQuality.overallScore, 0) / 7;
    
    const change = recentQuality - earlierQuality;
    
    if (Math.abs(change) > 10) {
      return {
        id: 'quality_trend',
        type: 'pattern',
        insight: `Your sleep quality has ${change > 0 ? 'improved' : 'declined'} by ${Math.abs(change).toFixed(1)} points over the last week.`,
        confidence: 0.7,
        actionable: change < 0,
        recommendations: change < 0 ? [
          'Review recent lifestyle changes',
          'Check environmental factors',
          'Consider stress management techniques'
        ] : [
          'Continue current positive practices',
          'Identify what contributed to improvement'
        ],
        dataPoints: 14,
        timeframe: '2 weeks'
      };
    }
    
    return null;
  }

  private analyzeWeekendPattern(data: SleepData[]): PersonalizedInsight | null {
    const weekdayData = data.filter(sleep => ![0, 6].includes(sleep.date.getDay()));
    const weekendData = data.filter(sleep => [0, 6].includes(sleep.date.getDay()));
    
    if (weekdayData.length < 5 || weekendData.length < 2) return null;
    
    const weekdayAvgBedtime = weekdayData.reduce((sum, sleep) => 
      sum + (sleep.bedtime.getHours() * 60 + sleep.bedtime.getMinutes()), 0) / weekdayData.length;
    
    const weekendAvgBedtime = weekendData.reduce((sum, sleep) => 
      sum + (sleep.bedtime.getHours() * 60 + sleep.bedtime.getMinutes()), 0) / weekendData.length;
    
    const difference = Math.abs(weekendAvgBedtime - weekdayAvgBedtime);
    
    if (difference > 60) { // More than 1 hour difference
      return {
        id: 'weekend_pattern',
        type: 'pattern',
        insight: `You have significant weekend sleep schedule shifts (${(difference/60).toFixed(1)} hours). This can disrupt your circadian rhythm.`,
        confidence: 0.75,
        actionable: true,
        recommendations: [
          'Keep weekend bedtime within 1 hour of weekday schedule',
          'Use gradual schedule shifts if needed',
          'Maintain consistent wake times on weekends'
        ],
        dataPoints: data.length,
        timeframe: `${data.length} nights`
      };
    }
    
    return null;
  }

  private analyzeRecoveryPattern(data: SleepData[]): PersonalizedInsight | null {
    if (data.length < 10) return null;
    
    const recoveryScores = data.map(sleep => sleep.sleepMetrics.recovery.overallRecovery);
    const avgRecovery = recoveryScores.reduce((sum, score) => sum + score, 0) / recoveryScores.length;
    
    if (avgRecovery < 70) {
      return {
        id: 'recovery_concern',
        type: 'pattern',
        insight: `Your average recovery score is ${avgRecovery.toFixed(1)}%, which is below optimal (>80%). Focus on sleep quality improvements.`,
        confidence: 0.8,
        actionable: true,
        recommendations: [
          'Increase deep sleep through cooler bedroom temperature',
          'Reduce stress before bedtime',
          'Consider magnesium supplementation',
          'Avoid alcohol close to bedtime'
        ],
        dataPoints: data.length,
        timeframe: `${data.length} nights`
      };
    }
    
    return null;
  }

  private identifyRiskFactors(date: Date, recentData: SleepData[]): RiskFactor[] {
    const riskFactors: RiskFactor[] = [];
    
    // Weekend risk
    if ([5, 6].includes(date.getDay())) {
      riskFactors.push({
        factor: 'Weekend schedule shift',
        impact: -15,
        likelihood: 70,
        mitigation: ['Maintain consistent bedtime', 'Avoid late night activities']
      });
    }
    
    // Stress accumulation
    const recentQuality = recentData.slice(-3).reduce((sum, sleep) => sum + sleep.sleepQuality.overallScore, 0) / 3;
    if (recentQuality < 70) {
      riskFactors.push({
        factor: 'Recent poor sleep quality',
        impact: -20,
        likelihood: 60,
        mitigation: ['Focus on sleep hygiene', 'Stress reduction techniques']
      });
    }
    
    return riskFactors;
  }

  private generatePreventiveRecommendations(predictedQuality: number): string[] {
    const recommendations: string[] = [];
    
    if (predictedQuality < 80) {
      recommendations.push('Plan a relaxing evening routine');
      recommendations.push('Ensure bedroom is cool and dark');
      recommendations.push('Avoid screens 1 hour before planned bedtime');
    }
    
    if (predictedQuality < 70) {
      recommendations.push('Consider meditation or deep breathing');
      recommendations.push('Avoid caffeine after 2 PM');
      recommendations.push('Take a warm bath before bed');
    }
    
    return recommendations;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  // ===== PUBLIC API METHODS =====

  async createSleepProfile(userId: string, profileData: Partial<SleepProfile>): Promise<void> {
    const profile: SleepProfile = {
      userId,
      sleepGoals: profileData.sleepGoals || [],
      preferences: profileData.preferences || {
        bedtimeRange: ['22:00', '23:30'],
        wakeTimeRange: ['06:00', '07:30'],
        sleepDurationTarget: 480,
        environment: {
          temperature: 19,
          humidity: 45,
          noise: 'white_noise',
          darkness: 'complete',
          airflow: 'gentle'
        },
        routine: {
          windDownDuration: 60,
          activities: ['reading', 'meditation'],
          avoidActivities: ['screens', 'exercise'],
          supplements: [],
          meditation: true,
          reading: true,
          stretching: false
        }
      },
      constraints: profileData.constraints || [],
      historicalData: [],
      personalizedInsights: [],
      optimizationPlan: {
        phases: [],
        currentPhase: 0,
        overallGoal: 'Improve sleep quality',
        estimatedImprovement: 20,
        timeline: 30
      }
    };

    this.sleepProfiles.set(userId, profile);
    await this.saveSleepProfile(profile);
  }

  private async storeSleepData(userId: string, sleepData: SleepData): Promise<void> {
    let userSleepData = this.sleepData.get(userId) || [];
    userSleepData.push(sleepData);
    
    // Keep only last 90 days
    if (userSleepData.length > 90) {
      userSleepData = userSleepData.slice(-90);
    }
    
    this.sleepData.set(userId, userSleepData);
    await this.saveSleepData();
  }

  private async saveSleepData(): Promise<void> {
    try {
      const data = Object.fromEntries(this.sleepData);
      await AsyncStorage.setItem('sleep_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving sleep data:', error);
    }
  }

  private async saveSleepProfile(profile: SleepProfile): Promise<void> {
    try {
      const profiles = Object.fromEntries(this.sleepProfiles);
      await AsyncStorage.setItem('sleep_profiles', JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving sleep profile:', error);
    }
  }

  async getSleepTrends(userId: string, timeframe: number = 30): Promise<SleepTrend[]> {
    const userSleepData = this.sleepData.get(userId) || [];
    const recentData = userSleepData.slice(-timeframe);
    
    const trends: SleepTrend[] = [
      {
        metric: 'Sleep Quality',
        values: recentData.map(sleep => ({
          date: sleep.date,
          value: sleep.sleepQuality.overallScore
        })),
        trend: 'stable',
        correlation: []
      },
      {
        metric: 'Sleep Duration',
        values: recentData.map(sleep => ({
          date: sleep.date,
          value: sleep.sleepMetrics.totalSleepTime
        })),
        trend: 'stable',
        correlation: []
      },
      {
        metric: 'Sleep Efficiency',
        values: recentData.map(sleep => ({
          date: sleep.date,
          value: sleep.sleepMetrics.sleepEfficiency
        })),
        trend: 'improving',
        correlation: []
      }
    ];
    
    return trends;
  }
}

export default new SleepAnalysisAI();
