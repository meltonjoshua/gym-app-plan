import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Achievement } from '../store/slices/gamificationSlice';

const { width, height } = Dimensions.get('window');

interface AchievementNotificationProps {
  achievement: Achievement | null;
  visible: boolean;
  onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  visible,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(-height)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiAnimations = useRef(
    Array.from({ length: 20 }, () => ({
      translateY: new Animated.Value(-50),
      translateX: new Animated.Value(Math.random() * width),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible && achievement) {
      // Slide in notification
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 800,
          useNativeDriver: true,
        }),
        // Scale animation for emphasis
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Fade in background
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 600,
        useNativeDriver: true,
      }).start();

      // Confetti animation
      const confettiAnimationsArray = confettiAnimations.map((confetti) =>
        Animated.parallel([
          Animated.timing(confetti.translateY, {
            toValue: height + 100,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(confetti.rotate, {
            toValue: 360,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(2000),
            Animated.timing(confetti.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      Animated.parallel(confettiAnimationsArray).start();

      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible, achievement]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -height,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animations
      slideAnim.setValue(-height);
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      confettiAnimations.forEach((confetti) => {
        confetti.translateY.setValue(-50);
        confetti.rotate.setValue(0);
        confetti.opacity.setValue(1);
        confetti.translateX.setValue(Math.random() * width);
      });
      onClose();
    });
  };

  const getTierColor = (tier: string): [string, string] => {
    switch (tier) {
      case 'bronze': return ['#CD7F32', '#8B4513'];
      case 'silver': return ['#C0C0C0', '#808080'];
      case 'gold': return ['#FFD700', '#B8860B'];
      case 'platinum': return ['#E5E4E2', '#BDC3C7'];
      case 'diamond': return ['#B9F2FF', '#87CEEB'];
      default: return ['#999', '#666'];
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#888';
      case 'rare': return '#0080FF';
      case 'epic': return '#8A2BE2';
      case 'legendary': return '#FFD700';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout': return 'fitness';
      case 'nutrition': return 'nutrition';
      case 'progress': return 'trending-up';
      case 'social': return 'people';
      case 'special': return 'star';
      default: return 'trophy';
    }
  };

  if (!visible || !achievement) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Background Overlay */}
      <Animated.View
        style={[
          styles.backgroundOverlay,
          {
            opacity: opacityAnim,
          },
        ]}
      />

      {/* Confetti */}
      {confettiAnimations.map((confetti, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confettiPiece,
            {
              backgroundColor: index % 2 === 0 ? '#FFD700' : getRarityGlow(achievement.rarity),
              transform: [
                { translateX: confetti.translateX },
                { translateY: confetti.translateY },
                {
                  rotate: confetti.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              opacity: confetti.opacity,
            },
          ]}
        />
      ))}

      {/* Main Notification */}
      <Animated.View
        style={[
          styles.notification,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={hideNotification}
          style={styles.notificationContent}
        >
          <LinearGradient
            colors={getTierColor(achievement.tier)}
            style={styles.notificationGradient}
          >
            <View style={styles.header}>
              <Text style={styles.headerText}>🎉 ACHIEVEMENT UNLOCKED! 🎉</Text>
              <TouchableOpacity onPress={hideNotification} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.achievementContainer}>
              <View
                style={[
                  styles.achievementIcon,
                  {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    shadowColor: getRarityGlow(achievement.rarity),
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 10,
                  },
                ]}
              >
                <Ionicons
                  name={getCategoryIcon(achievement.category) as any}
                  size={40}
                  color="white"
                />
              </View>

              <View style={styles.achievementInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <View
                    style={[
                      styles.rarityBadge,
                      { backgroundColor: getRarityGlow(achievement.rarity) },
                    ]}
                  >
                    <Text style={styles.rarityText}>
                      {achievement.rarity.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>

                <View style={styles.rewardContainer}>
                  <Ionicons name="diamond" size={16} color="#FFD700" />
                  <Text style={styles.pointsText}>
                    +{achievement.points} points
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.tierIndicator}>
              <Text style={styles.tierText}>
                {achievement.tier.toUpperCase()} TIER
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Sparkle Effects */}
      <View style={styles.sparkleContainer}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.sparkle,
              {
                left: Math.random() * width,
                top: 100 + Math.random() * 200,
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.random() * 1.5 + 0.5],
                    }),
                  },
                ],
                opacity: opacityAnim,
              },
            ]}
          >
            <Ionicons
              name="star"
              size={12 + Math.random() * 8}
              color={getRarityGlow(achievement.rarity)}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  notification: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 1001,
  },
  notificationContent: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  notificationGradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  achievementInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    marginRight: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  achievementDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 20,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 4,
  },
  tierIndicator: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  tierText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
  },
});

export default AchievementNotification;
