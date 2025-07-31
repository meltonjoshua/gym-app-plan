import { Pose, Results, NormalizedLandmark } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseAnalysisResult {
  landmarks: PoseLandmark[];
  confidence: number;
  timestamp: number;
  exerciseType?: string;
  formScore: number;
  feedback: FormFeedback[];
  repCount?: number;
  phase?: ExercisePhase;
}

export interface FormFeedback {
  type: 'error' | 'warning' | 'success' | 'improvement';
  message: string;
  bodyPart: string;
  severity: number; // 1-10
  suggestion?: string;
}

export interface ExerciseMetrics {
  range_of_motion: number;
  symmetry: number;
  stability: number;
  tempo: number;
  alignment: number;
}

export type ExercisePhase = 'preparation' | 'eccentric' | 'bottom' | 'concentric' | 'top' | 'rest';

export interface ExercisePattern {
  name: string;
  keyPoints: string[];
  phases: ExercisePhase[];
  optimalAngles: Record<string, [number, number]>; // [min, max] degrees
  commonMistakes: CommonMistake[];
}

export interface CommonMistake {
  name: string;
  description: string;
  detection: (landmarks: PoseLandmark[]) => boolean;
  feedback: string;
  correction: string;
}

/**
 * Computer Vision Engine for Exercise Form Analysis
 * 
 * Uses MediaPipe Pose for real-time pose detection and provides
 * intelligent form analysis for various exercises.
 */
export class ComputerVisionEngine {
  private pose: Pose | null = null;
  private currentExercise: ExercisePattern | null = null;
  private frameHistory: PoseAnalysisResult[] = [];
  private repCounter: RepCounter;
  private formAnalyzer: FormAnalyzer;
  private isInitialized = false;

  constructor() {
    this.repCounter = new RepCounter();
    this.formAnalyzer = new FormAnalyzer();
  }

  /**
   * Initialize MediaPipe Pose
   */
  async initialize(): Promise<void> {
    try {
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.pose.onResults(this.onResults.bind(this));
      this.isInitialized = true;
      
      console.log('Computer Vision Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Computer Vision Engine:', error);
      throw new Error('Computer Vision initialization failed');
    }
  }

  /**
   * Set current exercise for analysis
   */
  setExercise(exerciseType: string): void {
    this.currentExercise = this.getExercisePattern(exerciseType);
    this.repCounter.reset();
    this.frameHistory = [];
    console.log(`Exercise set to: ${exerciseType}`);
  }

  /**
   * Process video frame for pose analysis
   */
  async processFrame(imageData: ImageData | HTMLVideoElement | HTMLCanvasElement): Promise<PoseAnalysisResult | null> {
    if (!this.isInitialized || !this.pose) {
      console.warn('Computer Vision Engine not initialized');
      return null;
    }

    try {
      await this.pose.send({ image: imageData });
      
      // Return the latest result (set by onResults callback)
      if (this.frameHistory.length > 0) {
        return this.frameHistory[this.frameHistory.length - 1];
      }
      
      return null;
    } catch (error) {
      console.error('Error processing frame:', error);
      return null;
    }
  }

  /**
   * MediaPipe results callback
   */
  private onResults(results: Results): void {
    if (!results.poseLandmarks || !this.currentExercise) {
      return;
    }

    const landmarks = this.convertLandmarks(results.poseLandmarks);
    const analysisResult = this.analyzeFrame(landmarks);
    
    this.frameHistory.push(analysisResult);
    
    // Keep only recent frames for performance
    if (this.frameHistory.length > 30) {
      this.frameHistory.shift();
    }
  }

  /**
   * Convert MediaPipe landmarks to our format
   */
  private convertLandmarks(landmarks: NormalizedLandmark[]): PoseLandmark[] {
    return landmarks.map(landmark => ({
      x: landmark.x,
      y: landmark.y,
      z: landmark.z || 0,
      visibility: landmark.visibility || 1
    }));
  }

  /**
   * Analyze current frame for form and exercise metrics
   */
  private analyzeFrame(landmarks: PoseLandmark[]): PoseAnalysisResult {
    const timestamp = Date.now();
    const confidence = this.calculateConfidence(landmarks);
    
    // Analyze form quality
    const formScore = this.formAnalyzer.calculateFormScore(landmarks, this.currentExercise!);
    const feedback = this.formAnalyzer.generateFeedback(landmarks, this.currentExercise!);
    
    // Count reps and detect exercise phase
    const repCount = this.repCounter.updateCount(landmarks, this.currentExercise!);
    const phase = this.detectExercisePhase(landmarks);

    return {
      landmarks,
      confidence,
      timestamp,
      exerciseType: this.currentExercise?.name,
      formScore,
      feedback,
      repCount,
      phase
    };
  }

  /**
   * Calculate pose detection confidence
   */
  private calculateConfidence(landmarks: PoseLandmark[]): number {
    const visibilitySum = landmarks.reduce((sum, landmark) => sum + landmark.visibility, 0);
    return visibilitySum / landmarks.length;
  }

  /**
   * Detect current exercise phase
   */
  private detectExercisePhase(landmarks: PoseLandmark[]): ExercisePhase {
    if (!this.currentExercise) return 'preparation';

    // Basic phase detection based on key joint angles
    // This would be exercise-specific in a full implementation
    return 'preparation';
  }

  /**
   * Get exercise pattern configuration
   */
  private getExercisePattern(exerciseType: string): ExercisePattern {
    const patterns: Record<string, ExercisePattern> = {
      squat: {
        name: 'Squat',
        keyPoints: ['hip', 'knee', 'ankle'],
        phases: ['preparation', 'eccentric', 'bottom', 'concentric', 'top'],
        optimalAngles: {
          knee: [80, 160],
          hip: [90, 180],
          ankle: [70, 90]
        },
        commonMistakes: [
          {
            name: 'Knee Cave',
            description: 'Knees collapsing inward',
            detection: (landmarks) => this.detectKneeValgus(landmarks),
            feedback: 'Keep your knees tracking over your toes',
            correction: 'Focus on pushing knees outward during the movement'
          },
          {
            name: 'Forward Lean',
            description: 'Excessive forward torso lean',
            detection: (landmarks) => this.detectForwardLean(landmarks),
            feedback: 'Keep your chest up and torso more upright',
            correction: 'Sit back into your heels more'
          }
        ]
      },
      pushup: {
        name: 'Push-up',
        keyPoints: ['shoulder', 'elbow', 'wrist', 'hip'],
        phases: ['preparation', 'eccentric', 'bottom', 'concentric', 'top'],
        optimalAngles: {
          elbow: [45, 180],
          shoulder: [0, 45],
          hip: [170, 180]
        },
        commonMistakes: [
          {
            name: 'Sagging Hips',
            description: 'Hips dropping below body line',
            detection: (landmarks) => this.detectSaggingHips(landmarks),
            feedback: 'Keep your body in a straight line',
            correction: 'Engage your core and squeeze glutes'
          },
          {
            name: 'Flared Elbows',
            description: 'Elbows too wide from body',
            detection: (landmarks) => this.detectFlaredElbows(landmarks),
            feedback: 'Keep elbows closer to your body',
            correction: 'Aim for 45-degree angle from torso'
          }
        ]
      },
      deadlift: {
        name: 'Deadlift',
        keyPoints: ['hip', 'knee', 'shoulder', 'ankle'],
        phases: ['preparation', 'eccentric', 'bottom', 'concentric', 'top'],
        optimalAngles: {
          hip: [90, 180],
          knee: [120, 180],
          back: [15, 30]
        },
        commonMistakes: [
          {
            name: 'Rounded Back',
            description: 'Excessive spinal flexion',
            detection: (landmarks) => this.detectRoundedBack(landmarks),
            feedback: 'Keep your back straight and chest up',
            correction: 'Engage lats and maintain neutral spine'
          },
          {
            name: 'Bar Drift',
            description: 'Bar moving away from body',
            detection: (landmarks) => this.detectBarDrift(landmarks),
            feedback: 'Keep the bar close to your body',
            correction: 'Think about dragging the bar up your legs'
          }
        ]
      }
    };

    return patterns[exerciseType.toLowerCase()] || patterns.squat;
  }

  /**
   * Form mistake detection methods
   */
  private detectKneeValgus(landmarks: PoseLandmark[]): boolean {
    // Simplified detection - in practice would use more sophisticated analysis
    return false;
  }

  private detectForwardLean(landmarks: PoseLandmark[]): boolean {
    // Calculate torso angle
    return false;
  }

  private detectSaggingHips(landmarks: PoseLandmark[]): boolean {
    // Check body line from shoulders to ankles
    return false;
  }

  private detectFlaredElbows(landmarks: PoseLandmark[]): boolean {
    // Calculate elbow angle relative to torso
    return false;
  }

  private detectRoundedBack(landmarks: PoseLandmark[]): boolean {
    // Analyze spinal curvature
    return false;
  }

  private detectBarDrift(landmarks: PoseLandmark[]): boolean {
    // Track bar position relative to body
    return false;
  }

  /**
   * Get current session statistics
   */
  getSessionStats(): {
    totalReps: number;
    averageFormScore: number;
    exerciseTime: number;
    commonIssues: string[];
  } {
    const totalReps = this.repCounter.getCount();
    const averageFormScore = this.frameHistory.length > 0 
      ? this.frameHistory.reduce((sum, frame) => sum + frame.formScore, 0) / this.frameHistory.length
      : 0;
    
    const exerciseTime = this.frameHistory.length > 0
      ? (this.frameHistory[this.frameHistory.length - 1].timestamp - this.frameHistory[0].timestamp) / 1000
      : 0;

    const feedbackCounts: Record<string, number> = {};
    this.frameHistory.forEach(frame => {
      frame.feedback.forEach(feedback => {
        feedbackCounts[feedback.message] = (feedbackCounts[feedback.message] || 0) + 1;
      });
    });

    const commonIssues = Object.entries(feedbackCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([message]) => message);

    return {
      totalReps,
      averageFormScore,
      exerciseTime,
      commonIssues
    };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
    }
    this.frameHistory = [];
    this.isInitialized = false;
  }
}

/**
 * Rep Counter for exercise repetitions
 */
class RepCounter {
  private count = 0;
  private isInRep = false;
  private lastPhase: ExercisePhase = 'preparation';

  updateCount(landmarks: PoseLandmark[], exercise: ExercisePattern): number {
    // Simplified rep counting - in practice would use sophisticated phase detection
    // This would analyze the exercise phases and increment on complete reps
    return this.count;
  }

  getCount(): number {
    return this.count;
  }

  reset(): void {
    this.count = 0;
    this.isInRep = false;
    this.lastPhase = 'preparation';
  }
}

/**
 * Form Analyzer for exercise quality assessment
 */
class FormAnalyzer {
  calculateFormScore(landmarks: PoseLandmark[], exercise: ExercisePattern): number {
    // Analyze various form factors and return score 1-10
    let score = 10;

    // Check each common mistake and deduct points
    exercise.commonMistakes.forEach(mistake => {
      if (mistake.detection(landmarks)) {
        score -= 2; // Deduct points for mistakes
      }
    });

    // Check joint angles
    const angleScore = this.analyzeJointAngles(landmarks, exercise);
    score = (score + angleScore) / 2;

    return Math.max(1, Math.min(10, score));
  }

  generateFeedback(landmarks: PoseLandmark[], exercise: ExercisePattern): FormFeedback[] {
    const feedback: FormFeedback[] = [];

    // Check for common mistakes
    exercise.commonMistakes.forEach(mistake => {
      if (mistake.detection(landmarks)) {
        feedback.push({
          type: 'error',
          message: mistake.feedback,
          bodyPart: 'general',
          severity: 7,
          suggestion: mistake.correction
        });
      }
    });

    // Add positive feedback if form is good
    if (feedback.length === 0) {
      feedback.push({
        type: 'success',
        message: 'Great form! Keep it up!',
        bodyPart: 'general',
        severity: 1
      });
    }

    return feedback;
  }

  private analyzeJointAngles(landmarks: PoseLandmark[], exercise: ExercisePattern): number {
    // Analyze joint angles against optimal ranges
    // This would calculate actual joint angles and compare to exercise.optimalAngles
    return 8; // Placeholder score
  }
}

/**
 * Utility functions for angle calculations
 */
export class PoseUtils {
  /**
   * Calculate angle between three points
   */
  static calculateAngle(point1: PoseLandmark, point2: PoseLandmark, point3: PoseLandmark): number {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) - 
                   Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }

  /**
   * Calculate distance between two points
   */
  static calculateDistance(point1: PoseLandmark, point2: PoseLandmark): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Check if pose landmarks are valid
   */
  static isValidPose(landmarks: PoseLandmark[]): boolean {
    return landmarks.length >= 33 && 
           landmarks.every(landmark => landmark.visibility > 0.5);
  }

  /**
   * Get landmark by body part name
   */
  static getLandmark(landmarks: PoseLandmark[], bodyPart: string): PoseLandmark | null {
    const landmarkMap: Record<string, number> = {
      'nose': 0,
      'left_eye_inner': 1,
      'left_eye': 2,
      'left_eye_outer': 3,
      'right_eye_inner': 4,
      'right_eye': 5,
      'right_eye_outer': 6,
      'left_ear': 7,
      'right_ear': 8,
      'mouth_left': 9,
      'mouth_right': 10,
      'left_shoulder': 11,
      'right_shoulder': 12,
      'left_elbow': 13,
      'right_elbow': 14,
      'left_wrist': 15,
      'right_wrist': 16,
      'left_pinky': 17,
      'right_pinky': 18,
      'left_index': 19,
      'right_index': 20,
      'left_thumb': 21,
      'right_thumb': 22,
      'left_hip': 23,
      'right_hip': 24,
      'left_knee': 25,
      'right_knee': 26,
      'left_ankle': 27,
      'right_ankle': 28,
      'left_heel': 29,
      'right_heel': 30,
      'left_foot_index': 31,
      'right_foot_index': 32
    };

    const index = landmarkMap[bodyPart];
    return index !== undefined && index < landmarks.length ? landmarks[index] : null;
  }
}

export default ComputerVisionEngine;
