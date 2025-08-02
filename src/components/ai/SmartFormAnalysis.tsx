import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Types
interface FormFeedback {
  formScore: number;
  corrections: FormCorrection[];
  safetyAlerts: SafetyAlert[];
  timestamp: string;
}

interface FormCorrection {
  type: 'technique' | 'positioning' | 'timing' | 'safety';
  priority: 'high' | 'medium' | 'low';
  message: string;
  instruction: string;
  bodyPart: string;
}

interface SafetyAlert {
  level: 'warning' | 'danger';
  message: string;
  recommendation: string;
  bodyPart: string;
}

interface Props {
  exerciseId: string;
  exerciseName: string;
  onAnalysisComplete: (analysis: FormFeedback) => void;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

/**
 * Smart Form Analysis Component
 * Provides real-time computer vision feedback for exercise form
 */
export default function SmartFormAnalysis({
  exerciseId,
  exerciseName,
  onAnalysisComplete,
  onClose
}: Props) {
  // Camera permissions and setup
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Analysis state
  const [realTimeFeedback, setRealTimeFeedback] = useState<FormFeedback | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<FormFeedback[]>([]);
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'execution' | 'recovery'>('setup');
  
  // Refs
  const cameraRef = useRef<CameraView>(null);
  const analysisInterval = useRef<NodeJS.Timeout | null>(null);

  // Request camera permissions on mount
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, []);

  /**
   * Request necessary permissions
   */
  const requestPermissions = async () => {
    try {
      await requestPermission();
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  /**
   * Start real-time form analysis
   */
  const startAnalysis = async () => {
    if (!cameraRef.current) return;

    setIsAnalyzing(true);
    setRealTimeFeedback(null);

    // Start periodic frame analysis
    analysisInterval.current = setInterval(async () => {
      await analyzeCurrentFrame();
    }, 1000); // Analyze every second for real-time feedback

    console.log('🎯 Started real-time form analysis');
  };

  /**
   * Stop real-time form analysis
   */
  const stopAnalysis = () => {
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
      analysisInterval.current = null;
    }
    setIsAnalyzing(false);
    console.log('⏹️ Stopped real-time form analysis');
  };

  /**
   * Analyze current camera frame
   */
  const analyzeCurrentFrame = async () => {
    try {
      if (!cameraRef.current) return;

      // Take a photo for analysis
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: true,
      });

      // Send to backend for analysis
      const analysis = await analyzeFormWithAPI(photo.base64, exerciseId);
      
      if (analysis) {
        setRealTimeFeedback(analysis);
        
        // Add to history if form score is significantly different
        if (analysisHistory.length === 0 || 
            Math.abs(analysis.formScore - analysisHistory[analysisHistory.length - 1].formScore) > 1) {
          setAnalysisHistory(prev => [...prev, analysis]);
        }

        // Auto-detect exercise phase based on form score and feedback
        detectExercisePhase(analysis);
      }

    } catch (error) {
      console.error('Error analyzing frame:', error);
    }
  };

  /**
   * Send image to backend for form analysis
   */
  const analyzeFormWithAPI = async (base64Image: string, exerciseId: string): Promise<FormFeedback | null> => {
    try {
      const response = await fetch('http://localhost:5000/api/ai/analyze-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64Image,
          exerciseId,
          userId: 'current-user',
          phase: currentPhase
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze form');
      }

      const result = await response.json();
      
      return {
        formScore: result.formScore,
        corrections: result.analysis.corrections,
        safetyAlerts: result.analysis.safetyAlerts,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error calling form analysis API:', error);
      
      // Return mock data for development
      return {
        formScore: 7.5 + Math.random() * 2,
        corrections: [
          {
            type: 'positioning',
            priority: 'medium',
            message: 'Keep knees aligned',
            instruction: 'Ensure knees track over toes',
            bodyPart: 'knees'
          }
        ],
        safetyAlerts: [],
        timestamp: new Date().toISOString()
      };
    }
  };

  /**
   * Detect current exercise phase
   */
  const detectExercisePhase = (feedback: FormFeedback) => {
    // Simple phase detection based on form score trends
    if (feedback.formScore > 8 && currentPhase === 'setup') {
      setCurrentPhase('execution');
    } else if (feedback.formScore < 6 && currentPhase === 'execution') {
      setCurrentPhase('recovery');
    } else if (feedback.formScore > 7 && currentPhase === 'recovery') {
      setCurrentPhase('setup');
    }
  };

  /**
   * Complete analysis session
   */
  const completeAnalysis = () => {
    stopAnalysis();
    
    if (realTimeFeedback) {
      onAnalysisComplete(realTimeFeedback);
    }
  };

  /**
   * Toggle camera facing direction
   */
  const toggleCameraFacing = () => {
    setFacing(current => 
      current === 'back' ? 'front' : 'back'
    );
  };

  /**
   * Get feedback color based on form score
   */
  const getFeedbackColor = (score: number): string => {
    if (score >= 8.5) return '#4CAF50'; // Green
    if (score >= 7) return '#FFC107';   // Yellow
    if (score >= 5) return '#FF9800';   // Orange
    return '#F44336';                   // Red
  };

  /**
   * Get phase display text
   */
  const getPhaseText = (phase: string): string => {
    switch (phase) {
      case 'setup': return 'Setup Position';
      case 'execution': return 'Exercise Execution';
      case 'recovery': return 'Recovery Phase';
      default: return 'Ready';
    }
  };

  // Handle permission states
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission denied</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          {/* Overlay Content */}
          <View style={styles.overlay}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.exerciseTitle}>{exerciseName}</Text>
              <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Real-time Feedback */}
            {realTimeFeedback && (
              <View style={styles.feedbackContainer}>
                <LinearGradient
                  colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)']}
                  style={styles.feedbackGradient}
                >
                  {/* Form Score */}
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Form Score</Text>
                    <Text 
                      style={[
                        styles.scoreValue,
                        { color: getFeedbackColor(realTimeFeedback.formScore) }
                      ]}
                    >
                      {realTimeFeedback.formScore.toFixed(1)}/10
                    </Text>
                  </View>

                  {/* Current Phase */}
                  <View style={styles.phaseContainer}>
                    <Text style={styles.phaseLabel}>Phase</Text>
                    <Text style={styles.phaseValue}>{getPhaseText(currentPhase)}</Text>
                  </View>

                  {/* Safety Alerts */}
                  {realTimeFeedback.safetyAlerts.length > 0 && (
                    <View style={styles.alertsContainer}>
                      {realTimeFeedback.safetyAlerts.map((alert, index) => (
                        <View 
                          key={index} 
                          style={[
                            styles.alert,
                            alert.level === 'danger' ? styles.dangerAlert : styles.warningAlert
                          ]}
                        >
                          <Ionicons 
                            name={alert.level === 'danger' ? 'warning' : 'alert-circle'} 
                            size={16} 
                            color={alert.level === 'danger' ? '#FF5252' : '#FFC107'} 
                          />
                          <Text style={styles.alertText}>{alert.message}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Corrections */}
                  {realTimeFeedback.corrections.length > 0 && (
                    <View style={styles.correctionsContainer}>
                      <Text style={styles.correctionsTitle}>Tips:</Text>
                      {realTimeFeedback.corrections.slice(0, 2).map((correction, index) => (
                        <Text key={index} style={styles.correctionText}>
                          • {correction.instruction}
                        </Text>
                      ))}
                    </View>
                  )}
                </LinearGradient>
              </View>
            )}

            {/* Control Buttons */}
            <View style={styles.controls}>
              {!isAnalyzing ? (
                <TouchableOpacity style={styles.startButton} onPress={startAnalysis}>
                  <Ionicons name="play" size={32} color="white" />
                  <Text style={styles.controlText}>Start Analysis</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.activeControls}>
                  <TouchableOpacity style={styles.stopButton} onPress={stopAnalysis}>
                    <Ionicons name="stop" size={32} color="white" />
                    <Text style={styles.controlText}>Stop</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.completeButton} onPress={completeAnalysis}>
                    <Ionicons name="checkmark" size={32} color="white" />
                    <Text style={styles.controlText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </CameraView>
      </View>

      {/* Analysis Status */}
      {isAnalyzing && (
        <View style={styles.statusBar}>
          <View style={styles.recordingIndicator} />
          <Text style={styles.statusText}>Analyzing your form...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  closeButton: {
    padding: 8,
  },
  exerciseTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  flipButton: {
    padding: 8,
  },
  feedbackContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  feedbackGradient: {
    padding: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  phaseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseLabel: {
    color: 'white',
    fontSize: 14,
  },
  phaseValue: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  alertsContainer: {
    marginBottom: 12,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  dangerAlert: {
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
  },
  warningAlert: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  alertText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  correctionsContainer: {
    marginTop: 8,
  },
  correctionsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  correctionText: {
    color: '#E0E0E0',
    fontSize: 12,
    lineHeight: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeControls: {
    flexDirection: 'row',
    gap: 20,
  },
  stopButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
