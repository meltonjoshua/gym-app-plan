import { Camera } from 'expo-camera';
import errorLogger from '../utils/errorLogger';
// import * as MediaLibrary from 'expo-media-library'; // Commented until package installation
// import * as tf from '@tensorflow/tfjs'; // Commented until package installation
// import '@tensorflow/tfjs-react-native'; // Commented until package installation

// ===== COMPUTER VISION FOR EXERCISE FORM ANALYSIS =====
// AI-powered real-time exercise form detection and correction

export interface ExerciseFormData {
  exerciseType: ExerciseType;
  keyPoints: BodyKeyPoint[];
  formScore: number; // 0-100
  correctnessAnalysis: FormAnalysis;
  recommendations: FormRecommendation[];
  timestamp: Date;
}

export interface BodyKeyPoint {
  id: string;
  name: KeyPointName;
  position: Point3D;
  confidence: number;
  isVisible: boolean;
}

export interface Point3D {
  x: number;
  y: number;
  z?: number; // depth for 3D analysis
}

export type KeyPointName = 
  | 'nose' | 'left_eye' | 'right_eye' | 'left_ear' | 'right_ear'
  | 'left_shoulder' | 'right_shoulder' | 'left_elbow' | 'right_elbow'
  | 'left_wrist' | 'right_wrist' | 'left_hip' | 'right_hip'
  | 'left_knee' | 'right_knee' | 'left_ankle' | 'right_ankle';

export type ExerciseType = 
  | 'squat' | 'deadlift' | 'bench_press' | 'overhead_press' | 'row'
  | 'pushup' | 'pullup' | 'lunge' | 'plank' | 'burpee'
  | 'bicep_curl' | 'tricep_dip' | 'shoulder_press' | 'lateral_raise';

export interface FormAnalysis {
  overallScore: number;
  criticalErrors: FormError[];
  minorIssues: FormIssue[];
  strengths: string[];
  repCount: number;
  paceAnalysis: PaceAnalysis;
  rangeOfMotion: RangeOfMotionAnalysis;
}

export interface FormError {
  type: 'critical' | 'major' | 'minor';
  description: string;
  affectedBodyParts: KeyPointName[];
  injuryRisk: 'high' | 'medium' | 'low';
  correction: string;
  timestamp: number; // time in exercise when error occurred
}

export interface FormIssue {
  description: string;
  suggestion: string;
  impact: 'effectiveness' | 'safety' | 'efficiency';
}

export interface FormRecommendation {
  type: 'form_correction' | 'progression' | 'regression' | 'technique_tip';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  videoUrl?: string;
  imageUrl?: string;
}

export interface PaceAnalysis {
  averageRepDuration: number; // seconds
  concentricPhase: number; // seconds (lifting/pushing phase)
  eccentricPhase: number; // seconds (lowering/releasing phase)
  restBetweenReps: number; // seconds
  recommendation: string;
}

export interface RangeOfMotionAnalysis {
  maxAngle: number;
  minAngle: number;
  averageRange: number;
  optimalRange: number;
  completionPercentage: number; // how much of optimal ROM achieved
}

export interface ExerciseModel {
  exerciseType: ExerciseType;
  keyAngles: AngleDefinition[];
  optimalRanges: OptimalRangeDefinition[];
  commonErrors: CommonErrorPattern[];
  safetyThresholds: SafetyThreshold[];
}

export interface AngleDefinition {
  name: string;
  points: [KeyPointName, KeyPointName, KeyPointName]; // three points forming angle
  optimalMin: number;
  optimalMax: number;
  criticalMin: number;
  criticalMax: number;
}

export interface OptimalRangeDefinition {
  bodyPart: string;
  minRange: number;
  maxRange: number;
  units: 'degrees' | 'pixels' | 'percentage';
}

export interface CommonErrorPattern {
  name: string;
  description: string;
  detection: DetectionCriteria;
  severity: 'low' | 'medium' | 'high';
  correction: string;
}

export interface DetectionCriteria {
  angleViolations?: AngleViolation[];
  positionViolations?: PositionViolation[];
  movementViolations?: MovementViolation[];
}

export interface AngleViolation {
  angleName: string;
  condition: 'less_than' | 'greater_than' | 'outside_range';
  threshold: number | [number, number];
}

export interface PositionViolation {
  bodyPart: KeyPointName;
  relativeToBodyPart: KeyPointName;
  condition: 'too_far_left' | 'too_far_right' | 'too_high' | 'too_low';
  threshold: number;
}

export interface MovementViolation {
  bodyPart: KeyPointName;
  speed: 'too_fast' | 'too_slow';
  threshold: number;
}

export interface SafetyThreshold {
  name: string;
  description: string;
  condition: DetectionCriteria;
  warningMessage: string;
  stopExercise: boolean;
}

class ComputerVisionService {
  private models: Map<ExerciseType, any> = new Map(); // tf.LayersModel when TensorFlow is available
  private currentAnalysis: ExerciseFormData | null = null;
  private exerciseModels: Map<ExerciseType, ExerciseModel> = new Map();
  private isAnalyzing = false;

  constructor() {
    this.initializeExerciseModels();
  }

  // ===== INITIALIZATION =====

  async initialize(): Promise<void> {
    try {
      // Initialize error logger
      await errorLogger.initialize();
      
      // Initialize TensorFlow.js
      // await tf.ready(); // Commented until TensorFlow installation
      console.log('TensorFlow.js initialized');

      // Load pre-trained pose estimation models
      await this.loadPoseEstimationModel();
      
      // Load exercise-specific models
      await this.loadExerciseModels();
      
      console.log('Computer Vision Service initialized successfully');
    } catch (error) {
      await errorLogger.logError(
        'ai_model',
        'critical',
        'computer_vision',
        `Failed to initialize Computer Vision Service: ${error instanceof Error ? error.message : String(error)}`,
        {
          component: 'ComputerVisionService',
          function: 'initialize'
        },
        error instanceof Error ? error.stack : undefined
      );
      console.error('Failed to initialize Computer Vision Service:', error);
      throw error;
    }
  }

  private async loadPoseEstimationModel(): Promise<void> {
    // In a real implementation, this would load a pre-trained pose estimation model
    // like PoseNet, BlazePose, or a custom trained model
    console.log('Loading pose estimation model...');
    
    // Mock model loading - in reality would load from URL or bundled assets
    // const model = await tf.loadLayersModel('path/to/posenet/model.json');
    // this.poseEstimationModel = model;
  }

  private async loadExerciseModels(): Promise<void> {
    // Load AI models for specific exercise form analysis
    const exerciseTypes: ExerciseType[] = ['squat', 'deadlift', 'pushup', 'plank'];
    
    for (const exerciseType of exerciseTypes) {
      try {
        // Mock model loading - in reality would load trained models
        console.log(`Loading ${exerciseType} form analysis model...`);
        // const model = await tf.loadLayersModel(`models/${exerciseType}_form_model.json`);
        // this.models.set(exerciseType, model);
      } catch (error) {
        console.warn(`Failed to load model for ${exerciseType}:`, error);
      }
    }
  }

  private initializeExerciseModels(): void {
    // Initialize squat exercise model
    this.exerciseModels.set('squat', {
      exerciseType: 'squat',
      keyAngles: [
        {
          name: 'knee_angle',
          points: ['left_hip', 'left_knee', 'left_ankle'],
          optimalMin: 90,
          optimalMax: 120,
          criticalMin: 70,
          criticalMax: 140
        },
        {
          name: 'hip_angle',
          points: ['left_shoulder', 'left_hip', 'left_knee'],
          optimalMin: 85,
          optimalMax: 110,
          criticalMin: 70,
          criticalMax: 130
        }
      ],
      optimalRanges: [
        {
          bodyPart: 'knee_flexion',
          minRange: 90,
          maxRange: 120,
          units: 'degrees'
        }
      ],
      commonErrors: [
        {
          name: 'knee_valgus',
          description: 'Knees caving inward',
          detection: {
            positionViolations: [{
              bodyPart: 'left_knee',
              relativeToBodyPart: 'left_hip',
              condition: 'too_far_right',
              threshold: 0.1
            }]
          },
          severity: 'high',
          correction: 'Focus on pushing knees outward, engage glutes'
        },
        {
          name: 'forward_lean',
          description: 'Excessive forward lean',
          detection: {
            angleViolations: [{
              angleName: 'torso_angle',
              condition: 'greater_than',
              threshold: 45
            }]
          },
          severity: 'medium',
          correction: 'Keep chest up, engage core, sit back more'
        }
      ],
      safetyThresholds: [
        {
          name: 'dangerous_knee_position',
          description: 'Knee position indicates high injury risk',
          condition: {
            angleViolations: [{
              angleName: 'knee_angle',
              condition: 'less_than',
              threshold: 60
            }]
          },
          warningMessage: 'STOP: Dangerous knee position detected!',
          stopExercise: true
        }
      ]
    });

    // Initialize pushup exercise model
    this.exerciseModels.set('pushup', {
      exerciseType: 'pushup',
      keyAngles: [
        {
          name: 'elbow_angle',
          points: ['left_shoulder', 'left_elbow', 'left_wrist'],
          optimalMin: 45,
          optimalMax: 90,
          criticalMin: 30,
          criticalMax: 120
        },
        {
          name: 'body_line',
          points: ['left_shoulder', 'left_hip', 'left_ankle'],
          optimalMin: 170,
          optimalMax: 180,
          criticalMin: 160,
          criticalMax: 185
        }
      ],
      optimalRanges: [
        {
          bodyPart: 'elbow_flexion',
          minRange: 45,
          maxRange: 90,
          units: 'degrees'
        }
      ],
      commonErrors: [
        {
          name: 'sagging_hips',
          description: 'Hips sagging towards ground',
          detection: {
            angleViolations: [{
              angleName: 'body_line',
              condition: 'less_than',
              threshold: 165
            }]
          },
          severity: 'medium',
          correction: 'Engage core, maintain straight line from head to heels'
        },
        {
          name: 'incomplete_range',
          description: 'Not lowering enough',
          detection: {
            angleViolations: [{
              angleName: 'elbow_angle',
              condition: 'greater_than',
              threshold: 100
            }]
          },
          severity: 'low',
          correction: 'Lower chest closer to ground, full range of motion'
        }
      ],
      safetyThresholds: [
        {
          name: 'wrist_stress',
          description: 'Excessive wrist angle indicating stress',
          condition: {
            angleViolations: [{
              angleName: 'wrist_angle',
              condition: 'outside_range',
              threshold: [80, 100]
            }]
          },
          warningMessage: 'Check wrist position to avoid injury',
          stopExercise: false
        }
      ]
    });

    // Add more exercise models...
  }

  // ===== POSE DETECTION =====

  async detectPose(imageData: ImageData | HTMLImageElement): Promise<BodyKeyPoint[]> {
    try {
      // Mock pose detection - in reality would use TensorFlow.js PoseNet or similar
      const mockKeyPoints: BodyKeyPoint[] = [
        {
          id: 'nose_1',
          name: 'nose',
          position: { x: 0.5, y: 0.1 },
          confidence: 0.95,
          isVisible: true
        },
        {
          id: 'left_shoulder_1',
          name: 'left_shoulder',
          position: { x: 0.4, y: 0.25 },
          confidence: 0.92,
          isVisible: true
        },
        {
          id: 'right_shoulder_1',
          name: 'right_shoulder',
          position: { x: 0.6, y: 0.25 },
          confidence: 0.91,
          isVisible: true
        },
        {
          id: 'left_elbow_1',
          name: 'left_elbow',
          position: { x: 0.35, y: 0.4 },
          confidence: 0.88,
          isVisible: true
        },
        {
          id: 'right_elbow_1',
          name: 'right_elbow',
          position: { x: 0.65, y: 0.4 },
          confidence: 0.87,
          isVisible: true
        },
        {
          id: 'left_wrist_1',
          name: 'left_wrist',
          position: { x: 0.3, y: 0.55 },
          confidence: 0.85,
          isVisible: true
        },
        {
          id: 'right_wrist_1',
          name: 'right_wrist',
          position: { x: 0.7, y: 0.55 },
          confidence: 0.84,
          isVisible: true
        },
        {
          id: 'left_hip_1',
          name: 'left_hip',
          position: { x: 0.42, y: 0.6 },
          confidence: 0.93,
          isVisible: true
        },
        {
          id: 'right_hip_1',
          name: 'right_hip',
          position: { x: 0.58, y: 0.6 },
          confidence: 0.92,
          isVisible: true
        },
        {
          id: 'left_knee_1',
          name: 'left_knee',
          position: { x: 0.4, y: 0.8 },
          confidence: 0.89,
          isVisible: true
        },
        {
          id: 'right_knee_1',
          name: 'right_knee',
          position: { x: 0.6, y: 0.8 },
          confidence: 0.88,
          isVisible: true
        },
        {
          id: 'left_ankle_1',
          name: 'left_ankle',
          position: { x: 0.38, y: 0.95 },
          confidence: 0.86,
          isVisible: true
        },
        {
          id: 'right_ankle_1',
          name: 'right_ankle',
          position: { x: 0.62, y: 0.95 },
          confidence: 0.85,
          isVisible: true
        }
      ];

      return mockKeyPoints;
    } catch (error) {
      await errorLogger.logError(
        'ai_model',
        'high',
        'computer_vision',
        `Pose detection failed: ${error instanceof Error ? error.message : String(error)}`,
        {
          component: 'ComputerVisionService',
          function: 'detectPose'
        },
        error instanceof Error ? error.stack : undefined
      );
      console.error('Error detecting pose:', error);
      throw error;
    }
  }

  // ===== FORM ANALYSIS =====

  async analyzeExerciseForm(
    exerciseType: ExerciseType,
    keyPoints: BodyKeyPoint[]
  ): Promise<ExerciseFormData> {
    try {
      const exerciseModel = this.exerciseModels.get(exerciseType);
      if (!exerciseModel) {
        throw new Error(`No model found for exercise type: ${exerciseType}`);
      }

      // Calculate angles and positions
      const angles = this.calculateAngles(keyPoints, exerciseModel.keyAngles);
      
      // Detect form errors
      const formErrors = this.detectFormErrors(angles, keyPoints, exerciseModel);
      
      // Calculate overall form score
      const formScore = this.calculateFormScore(formErrors, angles, exerciseModel);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(formErrors, exerciseType);
      
      // Analyze pace and range of motion
      const paceAnalysis = this.analyzePace(keyPoints, exerciseType);
      const rangeOfMotion = this.analyzeRangeOfMotion(angles, exerciseModel);

      const formAnalysis: FormAnalysis = {
        overallScore: formScore,
        criticalErrors: formErrors.filter(e => e.type === 'critical'),
        minorIssues: this.generateMinorIssues(angles, exerciseModel),
        strengths: this.identifyStrengths(formScore, formErrors),
        repCount: 1, // Would be tracked over time
        paceAnalysis,
        rangeOfMotion
      };

      const formData: ExerciseFormData = {
        exerciseType,
        keyPoints,
        formScore,
        correctnessAnalysis: formAnalysis,
        recommendations,
        timestamp: new Date()
      };

      this.currentAnalysis = formData;
      return formData;

    } catch (error) {
      console.error('Error analyzing exercise form:', error);
      throw error;
    }
  }

  private calculateAngles(keyPoints: BodyKeyPoint[], angleDefinitions: AngleDefinition[]): Map<string, number> {
    const angles = new Map<string, number>();

    for (const angleDef of angleDefinitions) {
      const [point1Name, point2Name, point3Name] = angleDef.points;
      
      const point1 = keyPoints.find(kp => kp.name === point1Name);
      const point2 = keyPoints.find(kp => kp.name === point2Name);
      const point3 = keyPoints.find(kp => kp.name === point3Name);

      if (point1 && point2 && point3 && point1.isVisible && point2.isVisible && point3.isVisible) {
        const angle = this.calculateAngleBetweenThreePoints(
          point1.position,
          point2.position,
          point3.position
        );
        angles.set(angleDef.name, angle);
      }
    }

    return angles;
  }

  private calculateAngleBetweenThreePoints(p1: Point3D, p2: Point3D, p3: Point3D): number {
    // Calculate angle at p2 formed by lines p1-p2 and p2-p3
    const vector1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const vector2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

    const cosAngle = dotProduct / (magnitude1 * magnitude2);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);

    return angle;
  }

  private detectFormErrors(
    angles: Map<string, number>,
    keyPoints: BodyKeyPoint[],
    exerciseModel: ExerciseModel
  ): FormError[] {
    const errors: FormError[] = [];

    // Check for common error patterns
    for (const errorPattern of exerciseModel.commonErrors) {
      const isErrorDetected = this.checkErrorPattern(angles, keyPoints, errorPattern);
      
      if (isErrorDetected) {
        errors.push({
          type: errorPattern.severity === 'high' ? 'critical' : 
                errorPattern.severity === 'medium' ? 'major' : 'minor',
          description: errorPattern.description,
          affectedBodyParts: this.getAffectedBodyParts(errorPattern),
          injuryRisk: errorPattern.severity === 'high' ? 'high' : 
                     errorPattern.severity === 'medium' ? 'medium' : 'low',
          correction: errorPattern.correction,
          timestamp: Date.now()
        });
      }
    }

    // Check safety thresholds
    for (const threshold of exerciseModel.safetyThresholds) {
      const isViolated = this.checkErrorPattern(angles, keyPoints, { 
        name: threshold.name,
        description: threshold.description,
        detection: threshold.condition,
        severity: 'high',
        correction: threshold.warningMessage
      });

      if (isViolated) {
        errors.push({
          type: 'critical',
          description: threshold.description,
          affectedBodyParts: [],
          injuryRisk: 'high',
          correction: threshold.warningMessage,
          timestamp: Date.now()
        });
      }
    }

    return errors;
  }

  private checkErrorPattern(
    angles: Map<string, number>,
    keyPoints: BodyKeyPoint[],
    errorPattern: CommonErrorPattern
  ): boolean {
    const { detection } = errorPattern;

    // Check angle violations
    if (detection.angleViolations) {
      for (const violation of detection.angleViolations) {
        const angle = angles.get(violation.angleName);
        if (angle !== undefined) {
          switch (violation.condition) {
            case 'less_than':
              if (angle < (violation.threshold as number)) return true;
              break;
            case 'greater_than':
              if (angle > (violation.threshold as number)) return true;
              break;
            case 'outside_range':
              const [min, max] = violation.threshold as [number, number];
              if (angle < min || angle > max) return true;
              break;
          }
        }
      }
    }

    // Check position violations
    if (detection.positionViolations) {
      for (const violation of detection.positionViolations) {
        const bodyPart = keyPoints.find(kp => kp.name === violation.bodyPart);
        const relativeBodyPart = keyPoints.find(kp => kp.name === violation.relativeToBodyPart);
        
        if (bodyPart && relativeBodyPart) {
          const distance = this.calculateDistance(bodyPart.position, relativeBodyPart.position);
          // Simplified position check - would be more sophisticated in real implementation
          if (distance > violation.threshold) return true;
        }
      }
    }

    return false;
  }

  private calculateDistance(p1: Point3D, p2: Point3D): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  private getAffectedBodyParts(errorPattern: CommonErrorPattern): KeyPointName[] {
    // Extract affected body parts from detection criteria
    const bodyParts: KeyPointName[] = [];
    
    if (errorPattern.detection.positionViolations) {
      for (const violation of errorPattern.detection.positionViolations) {
        bodyParts.push(violation.bodyPart, violation.relativeToBodyPart);
      }
    }

    return bodyParts;
  }

  private calculateFormScore(
    formErrors: FormError[],
    angles: Map<string, number>,
    exerciseModel: ExerciseModel
  ): number {
    let score = 100;

    // Deduct points for errors
    for (const error of formErrors) {
      switch (error.type) {
        case 'critical':
          score -= 25;
          break;
        case 'major':
          score -= 15;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    }

    // Check angle optimality
    for (const angleDef of exerciseModel.keyAngles) {
      const angle = angles.get(angleDef.name);
      if (angle !== undefined) {
        if (angle < angleDef.optimalMin || angle > angleDef.optimalMax) {
          score -= 10;
        }
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(formErrors: FormError[], exerciseType: ExerciseType): FormRecommendation[] {
    const recommendations: FormRecommendation[] = [];

    // Add recommendations based on errors
    for (const error of formErrors) {
      recommendations.push({
        type: 'form_correction',
        title: `Fix: ${error.description}`,
        description: error.correction,
        priority: error.type === 'critical' ? 'high' : error.type === 'major' ? 'medium' : 'low'
      });
    }

    // Add general technique tips
    recommendations.push({
      type: 'technique_tip',
      title: `${exerciseType} Technique Tips`,
      description: this.getExerciseTips(exerciseType),
      priority: 'low'
    });

    return recommendations;
  }

  private getExerciseTips(exerciseType: ExerciseType): string {
    const tips: Record<ExerciseType, string> = {
      squat: 'Keep your chest up, knees tracking over toes, and sit back like sitting in a chair.',
      deadlift: 'Maintain neutral spine, engage lats, and drive through your heels.',
      bench_press: 'Keep shoulder blades retracted, maintain slight arch, and control the weight.',
      overhead_press: 'Engage core, keep head neutral, and press straight up.',
      row: 'Squeeze shoulder blades together, keep elbows close to body.',
      pushup: 'Maintain straight line from head to heels, control the movement.',
      pullup: 'Engage lats, avoid swinging, full range of motion.',
      lunge: 'Keep front knee over ankle, back straight, step back up powerfully.',
      plank: 'Straight line from head to heels, engage core throughout.',
      burpee: 'Move with control, maintain good form in each position.',
      bicep_curl: 'Keep elbows stationary, control the weight, full range of motion.',
      tricep_dip: 'Keep elbows close to body, lower until arms parallel to ground.',
      shoulder_press: 'Keep core engaged, press straight up, control the weight.',
      lateral_raise: 'Slight bend in elbows, raise to shoulder height, control descent.'
    };

    return tips[exerciseType] || 'Focus on proper form over speed or weight.';
  }

  private generateMinorIssues(angles: Map<string, number>, exerciseModel: ExerciseModel): FormIssue[] {
    const issues: FormIssue[] = [];

    // Check for suboptimal but not dangerous form
    for (const angleDef of exerciseModel.keyAngles) {
      const angle = angles.get(angleDef.name);
      if (angle !== undefined) {
        if (angle < angleDef.optimalMin) {
          issues.push({
            description: `${angleDef.name} could be increased for better form`,
            suggestion: `Try to achieve ${angleDef.optimalMin}-${angleDef.optimalMax} degrees`,
            impact: 'effectiveness'
          });
        } else if (angle > angleDef.optimalMax) {
          issues.push({
            description: `${angleDef.name} could be decreased for better form`,
            suggestion: `Try to stay within ${angleDef.optimalMin}-${angleDef.optimalMax} degrees`,
            impact: 'effectiveness'
          });
        }
      }
    }

    return issues;
  }

  private identifyStrengths(formScore: number, formErrors: FormError[]): string[] {
    const strengths: string[] = [];

    if (formScore >= 90) {
      strengths.push('Excellent overall form');
    } else if (formScore >= 80) {
      strengths.push('Good form with minor areas for improvement');
    } else if (formScore >= 70) {
      strengths.push('Decent form, focus on key corrections');
    }

    if (formErrors.filter(e => e.type === 'critical').length === 0) {
      strengths.push('No critical safety issues detected');
    }

    if (formErrors.length <= 2) {
      strengths.push('Consistent movement pattern');
    }

    return strengths;
  }

  private analyzePace(keyPoints: BodyKeyPoint[], exerciseType: ExerciseType): PaceAnalysis {
    // Mock pace analysis - would track movement over time
    return {
      averageRepDuration: 3.5,
      concentricPhase: 1.5,
      eccentricPhase: 2.0,
      restBetweenReps: 1.0,
      recommendation: 'Good pace - maintain controlled movement'
    };
  }

  private analyzeRangeOfMotion(angles: Map<string, number>, exerciseModel: ExerciseModel): RangeOfMotionAnalysis {
    // Mock ROM analysis
    const primaryAngle = angles.values().next().value || 90;
    
    return {
      maxAngle: primaryAngle + 10,
      minAngle: primaryAngle - 10,
      averageRange: 20,
      optimalRange: 30,
      completionPercentage: 85
    };
  }

  // ===== PUBLIC API =====

  async startFormAnalysis(exerciseType: ExerciseType): Promise<void> {
    this.isAnalyzing = true;
    console.log(`Started form analysis for ${exerciseType}`);
  }

  async stopFormAnalysis(): Promise<ExerciseFormData | null> {
    this.isAnalyzing = false;
    console.log('Stopped form analysis');
    return this.currentAnalysis;
  }

  getCurrentAnalysis(): ExerciseFormData | null {
    return this.currentAnalysis;
  }

  isCurrentlyAnalyzing(): boolean {
    return this.isAnalyzing;
  }

  getSupportedExercises(): ExerciseType[] {
    return Array.from(this.exerciseModels.keys());
  }
}

export default new ComputerVisionService();
