import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  Platform
} from 'react-native';
import { Camera, CameraView, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import computerVisionService, {
  ExerciseType,
  ExerciseFormData,
  BodyKeyPoint,
  FormError
} from '../../services/computerVision';

// ===== FORM ANALYSIS CAMERA =====
// Real-time exercise form analysis with visual feedback

interface FormAnalysisCameraProps {
  exerciseType: ExerciseType;
  onAnalysisComplete?: (formData: ExerciseFormData) => void;
  onFormScore?: (score: number) => void;
  showRealTimeGuidance?: boolean;
}

const { width, height } = Dimensions.get('window');

const FormAnalysisCamera: React.FC<FormAnalysisCameraProps> = ({
  exerciseType,
  onAnalysisComplete,
  onFormScore,
  showRealTimeGuidance = true
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<ExerciseFormData | null>(null);
  const [keyPoints, setKeyPoints] = useState<BodyKeyPoint[]>([]);
  const [formScore, setFormScore] = useState<number>(0);
  const [criticalErrors, setCriticalErrors] = useState<FormError[]>([]);
  const [repCount, setRepCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const analysisInterval = useRef<NodeJS.Timeout | null>(null);
  const scoreAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        await computerVisionService.initialize();
      }
    })();

    return () => {
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    // Animate score changes
    Animated.spring(scoreAnimation, {
      toValue: formScore,
      useNativeDriver: false,
    }).start();

    // Pulse animation for critical errors
    if (criticalErrors.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [formScore, criticalErrors]);

  const startAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      setIsRecording(true);
      await computerVisionService.startFormAnalysis(exerciseType);

      // Start real-time analysis
      analysisInterval.current = setInterval(async () => {
        if (cameraRef.current && isAnalyzing) {
          await captureAndAnalyzeFrame();
        }
      }, 200); // Analyze every 200ms

      console.log(`Started form analysis for ${exerciseType}`);
    } catch (error) {
      console.error('Error starting analysis:', error);
      Alert.alert('Error', 'Failed to start form analysis');
      setIsAnalyzing(false);
    }
  };

  const stopAnalysis = async () => {
    try {
      setIsAnalyzing(false);
      setIsRecording(false);
      
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current);
        analysisInterval.current = null;
      }

      const finalAnalysis = await computerVisionService.stopFormAnalysis();
      
      if (finalAnalysis && onAnalysisComplete) {
        onAnalysisComplete(finalAnalysis);
      }

      console.log('Stopped form analysis');
    } catch (error) {
      console.error('Error stopping analysis:', error);
    }
  };

  const captureAndAnalyzeFrame = async () => {
    try {
      if (!cameraRef.current) return;

      // Capture frame for analysis
      const imageUri = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: true,
      });

      // Mock pose detection - in real implementation would process the image
      const mockKeyPoints: BodyKeyPoint[] = generateMockKeyPoints();
      setKeyPoints(mockKeyPoints);

      // Analyze form
      const formAnalysis = await computerVisionService.analyzeExerciseForm(
        exerciseType,
        mockKeyPoints
      );

      setCurrentFormData(formAnalysis);
      setFormScore(formAnalysis.formScore);
      setCriticalErrors(formAnalysis.correctnessAnalysis.criticalErrors);
      
      if (onFormScore) {
        onFormScore(formAnalysis.formScore);
      }

      // Check for rep completion (mock logic)
      if (formAnalysis.formScore > 80 && Math.random() > 0.8) {
        setRepCount(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error analyzing frame:', error);
    }
  };

  const generateMockKeyPoints = (): BodyKeyPoint[] => {
    // Generate mock key points based on exercise type
    const baseKeyPoints: BodyKeyPoint[] = [
      { id: 'nose', name: 'nose', position: { x: width * 0.5, y: height * 0.15 }, confidence: 0.95, isVisible: true },
      { id: 'left_shoulder', name: 'left_shoulder', position: { x: width * 0.4, y: height * 0.3 }, confidence: 0.92, isVisible: true },
      { id: 'right_shoulder', name: 'right_shoulder', position: { x: width * 0.6, y: height * 0.3 }, confidence: 0.91, isVisible: true },
      { id: 'left_elbow', name: 'left_elbow', position: { x: width * 0.35, y: height * 0.45 }, confidence: 0.88, isVisible: true },
      { id: 'right_elbow', name: 'right_elbow', position: { x: width * 0.65, y: height * 0.45 }, confidence: 0.87, isVisible: true },
      { id: 'left_wrist', name: 'left_wrist', position: { x: width * 0.3, y: height * 0.6 }, confidence: 0.85, isVisible: true },
      { id: 'right_wrist', name: 'right_wrist', position: { x: width * 0.7, y: height * 0.6 }, confidence: 0.84, isVisible: true },
      { id: 'left_hip', name: 'left_hip', position: { x: width * 0.42, y: height * 0.65 }, confidence: 0.93, isVisible: true },
      { id: 'right_hip', name: 'right_hip', position: { x: width * 0.58, y: height * 0.65 }, confidence: 0.92, isVisible: true },
      { id: 'left_knee', name: 'left_knee', position: { x: width * 0.4, y: height * 0.8 }, confidence: 0.89, isVisible: true },
      { id: 'right_knee', name: 'right_knee', position: { x: width * 0.6, y: height * 0.8 }, confidence: 0.88, isVisible: true },
      { id: 'left_ankle', name: 'left_ankle', position: { x: width * 0.38, y: height * 0.95 }, confidence: 0.86, isVisible: true },
      { id: 'right_ankle', name: 'right_ankle', position: { x: width * 0.62, y: height * 0.95 }, confidence: 0.85, isVisible: true },
    ];

    // Add some variation based on time and exercise
    return baseKeyPoints.map(kp => ({
      ...kp,
      position: {
        ...kp.position,
        x: kp.position.x + (Math.random() - 0.5) * 20,
        y: kp.position.y + (Math.random() - 0.5) * 20,
      }
    }));
  };

  const renderPoseOverlay = () => {
    if (!showRealTimeGuidance || keyPoints.length === 0) return null;

    return (
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        {/* Draw skeleton connections */}
        {renderSkeletonConnections()}
        
        {/* Draw key points */}
        {keyPoints.map((keyPoint) => (
          <Circle
            key={keyPoint.id}
            cx={keyPoint.position.x}
            cy={keyPoint.position.y}
            r={6}
            fill={getKeyPointColor(keyPoint)}
            stroke="white"
            strokeWidth={2}
            opacity={keyPoint.confidence}
          />
        ))}

        {/* Draw form guidance */}
        {renderFormGuidance()}
      </Svg>
    );
  };

  const renderSkeletonConnections = () => {
    const connections = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle'],
    ];

    return connections.map(([point1Name, point2Name], index) => {
      const point1 = keyPoints.find(kp => kp.name === point1Name);
      const point2 = keyPoints.find(kp => kp.name === point2Name);

      if (point1 && point2 && point1.isVisible && point2.isVisible) {
        return (
          <Line
            key={index}
            x1={point1.position.x}
            y1={point1.position.y}
            x2={point2.position.x}
            y2={point2.position.y}
            stroke="#4ECDC4"
            strokeWidth={3}
            opacity={Math.min(point1.confidence, point2.confidence)}
          />
        );
      }
      return null;
    });
  };

  const renderFormGuidance = () => {
    if (!currentFormData) return null;

    const guidance = [];

    // Show form score
    guidance.push(
      <SvgText
        key="score"
        x={width - 100}
        y={50}
        fontSize="24"
        fontWeight="bold"
        fill={getScoreColor(formScore)}
        textAnchor="middle"
      >
        {formScore.toFixed(0)}%
      </SvgText>
    );

    // Show critical error indicators
    criticalErrors.forEach((error, index) => {
      guidance.push(
        <SvgText
          key={`error-${index}`}
          x={20}
          y={100 + index * 30}
          fontSize="14"
          fill="#FF6B6B"
          fontWeight="bold"
        >
          ⚠️ {error.description}
        </SvgText>
      );
    });

    return guidance;
  };

  const getKeyPointColor = (keyPoint: BodyKeyPoint): string => {
    if (keyPoint.confidence > 0.8) return '#4ECDC4';
    if (keyPoint.confidence > 0.6) return '#FFD93D';
    return '#FF6B6B';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4ECDC4';
    if (score >= 60) return '#FFD93D';
    return '#FF6B6B';
  };

  const getExerciseInstructions = (): string => {
    const instructions: Record<ExerciseType, string> = {
      squat: 'Stand with feet shoulder-width apart. Lower as if sitting back into a chair.',
      deadlift: 'Stand with feet hip-width apart. Keep back straight, hinge at hips.',
      pushup: 'Start in plank position. Lower chest to ground, push back up.',
      plank: 'Hold straight line from head to heels. Engage core throughout.',
      bench_press: 'Lie on bench, lower bar to chest, press back up.',
      overhead_press: 'Stand tall, press weight straight overhead.',
      row: 'Pull weight to chest, squeeze shoulder blades together.',
      pullup: 'Hang from bar, pull chest to bar, control descent.',
      lunge: 'Step forward, lower back knee, push back to start.',
      burpee: 'Squat, jump back to plank, pushup, jump forward, jump up.',
      bicep_curl: 'Keep elbows still, curl weight to shoulder.',
      tricep_dip: 'Lower body until arms parallel, push back up.',
      shoulder_press: 'Press weights overhead, control the movement.',
      lateral_raise: 'Raise weights to shoulder height, control descent.'
    };

    return instructions[exerciseType] || 'Follow proper form for this exercise.';
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="camera-outline" size={64} color="#6b7280" />
        <Text style={styles.errorText}>Camera permission denied</Text>
        <Text style={styles.errorSubtext}>
          Please enable camera access to use form analysis
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        ratio="16:9"
      >
        {/* Pose overlay */}
        {renderPoseOverlay()}

        {/* Header */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.header}
        >
          <Text style={styles.exerciseTitle}>
            {exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)} Analysis
          </Text>
          <Text style={styles.instructions}>
            {getExerciseInstructions()}
          </Text>
        </LinearGradient>

        {/* Score display */}
        <Animated.View style={[
          styles.scoreContainer,
          { transform: [{ scale: pulseAnimation }] }
        ]}>
          <Animated.Text style={[
            styles.scoreText,
            { color: getScoreColor(formScore) }
          ]}>
            {formScore.toFixed(0)}%
          </Animated.Text>
          <Text style={styles.scoreLabel}>Form Score</Text>
        </Animated.View>

        {/* Rep counter */}
        <View style={styles.repCounter}>
          <Text style={styles.repCount}>{repCount}</Text>
          <Text style={styles.repLabel}>Reps</Text>
        </View>

        {/* Critical errors */}
        {criticalErrors.length > 0 && (
          <View style={styles.errorPanel}>
            {criticalErrors.slice(0, 2).map((error, index) => (
              <View key={index} style={styles.errorItem}>
                <Ionicons name="warning" size={16} color="#FF6B6B" />
                <Text style={styles.errorText}>{error.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.secondaryButton]}
            onPress={() => {/* Navigate back */}}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.primaryButton,
              isAnalyzing && styles.recordingButton
            ]}
            onPress={isAnalyzing ? stopAnalysis : startAnalysis}
          >
            <Ionicons 
              name={isAnalyzing ? "stop" : "play"} 
              size={32} 
              color="white" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.secondaryButton]}
            onPress={() => {
              Alert.alert(
                'Form Tips',
                currentFormData?.recommendations
                  .slice(0, 3)
                  .map(r => `• ${r.description}`)
                  .join('\n') || 'Keep practicing for better form!'
              );
            }}
          >
            <Ionicons name="help-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>ANALYZING</Text>
          </View>
        )}
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  exerciseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  scoreContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 15,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
  },
  repCounter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 240 : 220,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 15,
  },
  repCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  repLabel: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
  },
  errorPanel: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    left: 20,
    right: 120,
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    borderRadius: 10,
    padding: 15,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4ECDC4',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  recordingButton: {
    backgroundColor: '#FF6B6B',
  },
  recordingIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.9)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default FormAnalysisCamera;
