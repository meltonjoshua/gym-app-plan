import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Alert,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SmartRestTimerProps {
  visible: boolean;
  initialTime: number; // in seconds
  exerciseName: string;
  onComplete: () => void;
  onSkip: () => void;
  onAddTime: (seconds: number) => void;
  heartRate?: number;
  showHeartRateZone?: boolean;
  adaptiveRestEnabled?: boolean;
}

interface HeartRateZone {
  name: string;
  min: number;
  max: number;
  color: string;
  description: string;
}

export default function SmartRestTimer({
  visible,
  initialTime,
  exerciseName,
  onComplete,
  onSkip,
  onAddTime,
  heartRate,
  showHeartRateZone = false,
  adaptiveRestEnabled = true,
}: SmartRestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [progress] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [heartRateRecovered, setHeartRateRecovered] = useState(false);
  const [restQuality, setRestQuality] = useState<'poor' | 'good' | 'excellent'>('good');

  // Heart rate zones (example for 30-year-old)
  const heartRateZones: HeartRateZone[] = [
    { name: 'Recovery', min: 95, max: 114, color: '#10b981', description: 'Optimal for rest' },
    { name: 'Aerobic', min: 114, max: 133, color: '#3b82f6', description: 'Light activity' },
    { name: 'Anaerobic', min: 133, max: 152, color: '#f59e0b', description: 'Moderate intensity' },
    { name: 'VO2 Max', min: 152, max: 171, color: '#ef4444', description: 'High intensity' },
  ];

  useEffect(() => {
    setTimeRemaining(initialTime);
    setIsActive(visible);
    
    if (visible) {
      startProgressAnimation();
    }
  }, [visible, initialTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            handleTimerComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  useEffect(() => {
    // Monitor heart rate for adaptive rest
    if (adaptiveRestEnabled && heartRate && showHeartRateZone) {
      const recoveryZone = heartRateZones[0];
      const isInRecoveryZone = heartRate >= recoveryZone.min && heartRate <= recoveryZone.max;
      
      if (isInRecoveryZone && !heartRateRecovered) {
        setHeartRateRecovered(true);
        setRestQuality('excellent');
        
        // If heart rate recovered and more than 30 seconds remaining, suggest completion
        if (timeRemaining > 30) {
          Alert.alert(
            'Heart Rate Recovered',
            'Your heart rate has returned to recovery zone. Ready to continue?',
            [
              { text: 'Rest More', style: 'cancel' },
              { text: 'Continue', onPress: handleTimerComplete },
            ]
          );
        }
      } else if (heartRate > recoveryZone.max * 1.2) {
        setRestQuality('poor');
      } else if (heartRate > recoveryZone.max) {
        setRestQuality('good');
      }
    }
  }, [heartRate, heartRateRecovered, timeRemaining, adaptiveRestEnabled, showHeartRateZone]);

  const startProgressAnimation = useCallback(() => {
    progress.setValue(0);
    
    Animated.timing(progress, {
      toValue: 1,
      duration: initialTime * 1000,
      useNativeDriver: false,
    }).start();

    // Pulse animation for last 10 seconds
    if (timeRemaining <= 10) {
      startPulseAnimation();
    }
  }, [initialTime, timeRemaining]);

  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleTimerComplete = () => {
    setIsActive(false);
    Vibration.vibrate([100, 50, 100]);
    onComplete();
  };

  const handleAddTime = (seconds: number) => {
    setTimeRemaining(prev => prev + seconds);
    onAddTime(seconds);
  };

  const handleSkip = () => {
    setIsActive(false);
    onSkip();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHeartRateZone = (hr: number): HeartRateZone | null => {
    return heartRateZones.find(zone => hr >= zone.min && hr <= zone.max) || null;
  };

  const getRestQualityColor = () => {
    switch (restQuality) {
      case 'excellent': return '#10b981';
      case 'good': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const progressPercentage = ((initialTime - timeRemaining) / initialTime) * 100;
  const currentZone = heartRate ? getHeartRateZone(heartRate) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.timerCard}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Smart Rest Timer</Text>
              <TouchableOpacity onPress={handleSkip} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Exercise Info */}
            <Text style={styles.exerciseName}>{exerciseName}</Text>

            {/* Timer Display */}
            <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.progressRing}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      height: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
            </Animated.View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(progressPercentage)}% complete
              </Text>
            </View>

            {/* Heart Rate Zone (if available) */}
            {showHeartRateZone && heartRate && currentZone && (
              <View style={styles.heartRateSection}>
                <View style={styles.heartRateDisplay}>
                  <Ionicons name="heart" size={20} color="#ef4444" />
                  <Text style={styles.heartRateText}>{heartRate} BPM</Text>
                </View>
                <View style={[styles.zoneIndicator, { backgroundColor: currentZone.color }]}>
                  <Text style={styles.zoneText}>{currentZone.name}</Text>
                </View>
                <Text style={styles.zoneDescription}>{currentZone.description}</Text>
                
                {/* Rest Quality Indicator */}
                <View style={styles.qualityIndicator}>
                  <View style={[styles.qualityDot, { backgroundColor: getRestQualityColor() }]} />
                  <Text style={styles.qualityText}>
                    Rest Quality: {restQuality.charAt(0).toUpperCase() + restQuality.slice(1)}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleAddTime(15)}
                >
                  <Text style={styles.quickActionText}>+15s</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleAddTime(30)}
                >
                  <Text style={styles.quickActionText}>+30s</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => handleAddTime(60)}
                >
                  <Text style={styles.quickActionText}>+1m</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
              >
                <Ionicons name="play-forward" size={20} color="white" />
                <Text style={styles.skipButtonText}>Skip Rest</Text>
              </TouchableOpacity>
            </View>

            {/* Adaptive Suggestions */}
            {adaptiveRestEnabled && (
              <View style={styles.suggestionsContainer}>
                <View style={styles.suggestionItem}>
                  <Ionicons name="bulb" size={16} color="#fbbf24" />
                  <Text style={styles.suggestionText}>
                    {heartRateRecovered 
                      ? "Your heart rate has recovered. Ready when you are!"
                      : "Rest until your heart rate drops below 115 BPM"
                    }
                  </Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
  },
  timerCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  exerciseName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    textTransform: 'capitalize',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
    bottom: 0,
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    position: 'absolute',
    top: '50%',
    marginTop: -18,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  heartRateSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  heartRateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heartRateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  zoneIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  zoneText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  zoneDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  qualityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  qualityText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionContainer: {
    width: '100%',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  quickActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  suggestionsContainer: {
    width: '100%',
    marginTop: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  suggestionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
    flex: 1,
  },
});
