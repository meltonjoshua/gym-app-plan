import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SocialFitnessService, { 
  LiveWorkoutSession, 
  Participant, 
  ChatMessage,
  LeaderboardEntry,
  ActiveChallenge,
  ParticipantMetrics
} from '../../services/SocialFitnessService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LiveSocialWorkoutScreenProps {
  route: {
    params: {
      sessionId?: string;
      isHost?: boolean;
    };
  };
  navigation: any;
}

const LiveSocialWorkoutScreen: React.FC<LiveSocialWorkoutScreenProps> = ({ route, navigation }) => {
  const [session, setSession] = useState<LiveWorkoutSession | null>(null);
  const [currentView, setCurrentView] = useState<'workout' | 'leaderboard' | 'chat' | 'challenges'>('workout');
  const [chatMessage, setChatMessage] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<ActiveChallenge[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<ParticipantMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [motivationLevel, setMotivationLevel] = useState(8);

  const socialService = SocialFitnessService.getInstance();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializeSession();
    startRealTimeUpdates();
    startMotivationPulse();

    return () => {
      cleanup();
    };
  }, []);

  const initializeSession = async () => {
    try {
      const { sessionId, isHost } = route.params;
      
      if (sessionId) {
        // Join existing session
        // In a real app, this would fetch from the service
        console.log(`Joining session ${sessionId}`);
      } else {
        // Create new session as host
        console.log('Creating new session as host');
      }

      // Mock session data for demo
      const mockSession: LiveWorkoutSession = {
        id: 'session_123',
        host: { 
          id: 'user1', 
          name: 'Sarah Connor', 
          avatar: '',
          email: 'sarah@example.com',
          createdAt: new Date(),
          fitnessLevel: 'advanced' as const,
          goals: [],
          preferredWorkoutDays: 5,
          preferredWorkoutDuration: 45,
          joinDate: new Date(),
          lastLogin: new Date(),
        },
        participants: [
          {
            user: { 
              id: 'user1', 
              name: 'Sarah Connor', 
              avatar: '',
              email: 'sarah@example.com',
              createdAt: new Date(),
              fitnessLevel: 'advanced' as const,
              goals: [],
              preferredWorkoutDays: 5,
              preferredWorkoutDuration: 45,
              joinDate: new Date(),
              lastLogin: new Date(),
            },
            joinTime: new Date(),
            status: 'active',
            currentMetrics: {
              userId: 'user1',
              heartRate: 145,
              caloriesBurned: 89,
              exercisesCompleted: 5,
              currentExercise: 'Push-ups',
              pace: 12,
              effort: 8,
              timestamp: new Date(),
              position: 1,
            },
            achievements: [],
            motivationLevel: 9,
            socialInteractions: [],
          },
          {
            user: { 
              id: 'user2', 
              name: 'Mike Johnson', 
              avatar: '',
              email: 'mike@example.com',
              createdAt: new Date(),
              fitnessLevel: 'intermediate' as const,
              goals: [],
              preferredWorkoutDays: 4,
              preferredWorkoutDuration: 30,
              joinDate: new Date(),
              lastLogin: new Date(),
            },
            joinTime: new Date(),
            status: 'active',
            currentMetrics: {
              userId: 'user2',
              heartRate: 132,
              caloriesBurned: 67,
              exercisesCompleted: 4,
              currentExercise: 'Squats',
              pace: 10,
              effort: 7,
              timestamp: new Date(),
              position: 2,
            },
            achievements: [],
            motivationLevel: 7,
            socialInteractions: [],
          }
        ],
        workout: {
          id: 'workout1',
          name: 'HIIT Power Session',
          description: 'High-intensity interval training',
          exercises: [],
          estimatedDuration: 45,
          difficulty: 'Advanced',
          category: 'HIIT',
        },
        realTimeData: [],
        challenges: [],
        leaderboard: {
          sessionId: 'session_123',
          rankings: [],
          updateInterval: 5,
          categories: [],
          motivationalMessages: [],
        },
        motivationalSystem: {
          level: 'high',
          messages: [],
          celebrationTriggers: [],
          encouragementSystem: {
            enabled: true,
            autoEncouragement: true,
            encouragementTypes: [],
            userPreferences: {
              frequency: 'medium',
              types: [],
              timing: 'real_time',
              personalizedLevel: 8,
            },
            effectivenessTracking: {
              totalEncouragements: 0,
              positiveResponses: 0,
              performanceImprovement: 0,
              userFeedback: 0,
            },
          },
          socialBoosts: [],
        },
        startTime: new Date(),
        duration: 45,
        status: 'live',
        isPublic: true,
        maxParticipants: 10,
        socialFeatures: {
          chat: {
            enabled: true,
            messages: [
              {
                id: '1',
                userId: 'user2',
                username: 'Mike Johnson',
                message: 'Let\'s crush this workout! 💪',
                timestamp: new Date(),
                type: 'text',
                isHighlighted: false,
                reactions: [],
              },
              {
                id: '2',
                userId: 'system',
                username: 'FitBot',
                message: 'Welcome to the HIIT Power Session! Give it your all! 🔥',
                timestamp: new Date(),
                type: 'system',
                isHighlighted: true,
                reactions: [],
              }
            ],
            moderationLevel: 'basic',
            allowedParticipants: 'all',
            features: {
              emojis: true,
              stickers: true,
              mentions: true,
              autoModeration: true,
              quickReplies: ['💪', '🔥', 'Keep going!', 'Amazing!'],
            },
          },
          reactions: {
            availableReactions: [],
            reactionHistory: [],
            popularReactions: [],
            customReactions: [],
          },
          encouragement: {
            enabled: true,
            autoEncouragement: true,
            encouragementTypes: [],
            userPreferences: {
              frequency: 'medium',
              types: [],
              timing: 'real_time',
              personalizedLevel: 8,
            },
            effectivenessTracking: {
              totalEncouragements: 0,
              positiveResponses: 0,
              performanceImprovement: 0,
              userFeedback: 0,
            },
          },
          sharing: {
            autoShare: false,
            platforms: [],
            privacyLevel: 'friends',
            contentTypes: [],
            achievementSharing: {
              autoShare: false,
              platforms: [],
              template: '',
              includeBadge: false,
            },
          },
          mentorship: {
            mentors: [],
            mentees: [],
            relationships: [],
            programs: [],
            matching: {} as any,
            progress: [],
          },
        },
      };

      setSession(mockSession);
      setParticipants(mockSession.participants);
      setCurrentMetrics(mockSession.participants[0].currentMetrics);
      updateLeaderboard(mockSession.participants);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      Alert.alert('Error', 'Failed to join workout session');
    }
  };

  const startRealTimeUpdates = () => {
    const interval = setInterval(() => {
      updateMetrics();
      updateParticipantData();
      checkForNewMessages();
      updateChallenges();
    }, 2000);

    return () => clearInterval(interval);
  };

  const startMotivationPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const updateMetrics = () => {
    if (!currentMetrics) return;

    // Simulate real-time metric updates
    const newMetrics = {
      ...currentMetrics,
      heartRate: Math.max(120, Math.min(180, (currentMetrics.heartRate || 140) + (Math.random() - 0.5) * 10)),
      caloriesBurned: currentMetrics.caloriesBurned + Math.random() * 2,
      pace: Math.max(8, Math.min(15, currentMetrics.pace + (Math.random() - 0.5) * 2)),
      timestamp: new Date(),
    };

    setCurrentMetrics(newMetrics);
  };

  const updateParticipantData = () => {
    if (!participants.length) return;

    const updatedParticipants = participants.map(participant => ({
      ...participant,
      currentMetrics: {
        ...participant.currentMetrics,
        heartRate: Math.max(120, Math.min(180, (participant.currentMetrics.heartRate || 140) + (Math.random() - 0.5) * 5)),
        caloriesBurned: participant.currentMetrics.caloriesBurned + Math.random(),
        pace: Math.max(8, Math.min(15, participant.currentMetrics.pace + (Math.random() - 0.5))),
        timestamp: new Date(),
      },
    }));

    setParticipants(updatedParticipants);
    updateLeaderboard(updatedParticipants);
  };

  const updateLeaderboard = (participants: Participant[]) => {
    const rankings: LeaderboardEntry[] = participants
      .map((participant, index) => ({
        rank: index + 1,
        userId: participant.user.id,
        displayName: participant.user.name,
        avatar: participant.user.avatar || '',
        score: participant.currentMetrics.caloriesBurned,
        metrics: {
          calories: participant.currentMetrics.caloriesBurned,
          exercises: participant.currentMetrics.exercisesCompleted,
          pace: participant.currentMetrics.pace,
        },
        badges: [],
        trending: 'stable' as const,
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    setLeaderboard(rankings);
  };

  const checkForNewMessages = () => {
    // Simulate receiving motivational messages
    if (Math.random() < 0.1) { // 10% chance every update
      const motivationalMessages = [
        'You\'re doing amazing! Keep pushing! 🔥',
        'Great pace everyone! Stay strong! 💪',
        'Halfway there! Don\'t give up now! ⚡',
        'Your effort is inspiring others! 🌟',
      ];

      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        userId: 'system',
        username: 'FitBot',
        message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
        timestamp: new Date(),
        type: 'system',
        isHighlighted: true,
        reactions: [],
      };

      if (session) {
        const updatedSession = {
          ...session,
          socialFeatures: {
            ...session.socialFeatures,
            chat: {
              ...session.socialFeatures.chat,
              messages: [...session.socialFeatures.chat.messages, newMessage],
            },
          },
        };
        setSession(updatedSession);
      }
    }
  };

  const updateChallenges = () => {
    // Simulate active challenges
    const challenges: ActiveChallenge[] = [
      {
        id: 'challenge_1',
        type: 'speed',
        name: 'Sprint Challenge',
        description: 'Complete 10 burpees in under 60 seconds',
        target: {
          metric: 'reps',
          value: 10,
          unit: 'burpees',
          timeLimit: 60,
        },
        participants: ['user1', 'user2'],
        currentLeader: 'user1',
        timeRemaining: 45,
        rewards: [
          {
            type: 'points',
            value: 50,
            description: 'Speed Demon Points',
            rarity: 'rare',
          }
        ],
        status: 'active',
      },
    ];

    setActiveChallenges(challenges);
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !session) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: 'user1', // Current user
      username: 'You',
      message: chatMessage,
      timestamp: new Date(),
      type: 'text',
      isHighlighted: false,
      reactions: [],
    };

    const updatedSession = {
      ...session,
      socialFeatures: {
        ...session.socialFeatures,
        chat: {
          ...session.socialFeatures.chat,
          messages: [...session.socialFeatures.chat.messages, newMessage],
        },
      },
    };

    setSession(updatedSession);
    setChatMessage('');
  };

  const addReaction = (emoji: string) => {
    // Simulate adding reaction to workout or participant
    console.log(`Added reaction: ${emoji}`);
  };

  const cleanup = () => {
    // Clean up any subscriptions or timers
    console.log('Cleaning up live workout session');
  };

  const renderWorkoutView = () => (
    <View style={styles.workoutContainer}>
      {/* Current Exercise Display */}
      <View style={styles.currentExerciseCard}>
        <Text style={styles.exerciseTitle}>
          {currentMetrics?.currentExercise || 'Getting Ready...'}
        </Text>
        <Text style={styles.exerciseSubtitle}>
          Exercise {currentMetrics?.exercisesCompleted || 0} of {session?.workout.exercises.length || 8}
        </Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="heart" size={24} color="#FF6B6B" />
          <Text style={styles.metricValue}>{currentMetrics?.heartRate || 0}</Text>
          <Text style={styles.metricLabel}>BPM</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="flame" size={24} color="#FF9500" />
          <Text style={styles.metricValue}>{Math.round(currentMetrics?.caloriesBurned || 0)}</Text>
          <Text style={styles.metricLabel}>Calories</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="speedometer" size={24} color="#007AFF" />
          <Text style={styles.metricValue}>{currentMetrics?.pace || 0}</Text>
          <Text style={styles.metricLabel}>Pace</Text>
        </View>

        <Animated.View style={[styles.metricCard, { transform: [{ scale: pulseAnimation }] }]}>
          <Ionicons name="happy" size={24} color="#32D74B" />
          <Text style={styles.metricValue}>{motivationLevel}</Text>
          <Text style={styles.metricLabel}>Energy</Text>
        </Animated.View>
      </View>

      {/* Participants Preview */}
      <View style={styles.participantsPreview}>
        <Text style={styles.sectionTitle}>Workout Buddies ({participants.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {participants.map((participant) => (
            <View key={participant.user.id} style={styles.participantAvatar}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {participant.user.name.split(' ').map(n => n[0]).join('')}
                </Text>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: participant.status === 'active' ? '#32D74B' : '#FF6B6B' }
                ]} />
              </View>
              <Text style={styles.participantName}>{participant.user.name.split(' ')[0]}</Text>
              <Text style={styles.participantMetric}>
                {Math.round(participant.currentMetrics.caloriesBurned)} cal
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => addReaction('💪')}
        >
          <Text style={styles.actionEmoji}>💪</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => addReaction('🔥')}
        >
          <Text style={styles.actionEmoji}>🔥</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => addReaction('⚡')}
        >
          <Text style={styles.actionEmoji}>⚡</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => addReaction('❤️')}
        >
          <Text style={styles.actionEmoji}>❤️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      <Text style={styles.sectionTitle}>Live Leaderboard 🏆</Text>
      <ScrollView style={styles.leaderboardList}>
        {leaderboard.map((entry, index) => (
          <View key={entry.userId} style={styles.leaderboardEntry}>
            <View style={styles.rankContainer}>
              <Text style={styles.rank}>#{entry.rank}</Text>
              {index < 3 && (
                <Ionicons 
                  name={index === 0 ? 'trophy' : index === 1 ? 'medal' : 'medal-outline'} 
                  size={16} 
                  color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'} 
                />
              )}
            </View>
            
            <View style={styles.leaderboardInfo}>
              <Text style={styles.leaderboardName}>{entry.displayName}</Text>
              <View style={styles.leaderboardMetrics}>
                <Text style={styles.leaderboardMetric}>
                  {Math.round(entry.score)} cal
                </Text>
                <Text style={styles.leaderboardMetric}>
                  {entry.metrics.exercises} exercises
                </Text>
                <Text style={styles.leaderboardMetric}>
                  {Math.round(entry.metrics.pace)} pace
                </Text>
              </View>
            </View>

            <Ionicons name="trending-up" size={16} color="#32D74B" />
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderChat = () => (
    <View style={styles.chatContainer}>
      <Text style={styles.sectionTitle}>Live Chat 💬</Text>
      
      <ScrollView style={styles.chatMessages}>
        {session?.socialFeatures.chat.messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.chatMessage,
              message.type === 'system' && styles.systemMessage,
              message.isHighlighted && styles.highlightedMessage,
            ]}
          >
            <Text style={styles.chatUsername}>{message.username}</Text>
            <Text style={styles.chatText}>{message.message}</Text>
            <Text style={styles.chatTimestamp}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          value={chatMessage}
          onChangeText={setChatMessage}
          placeholder="Send encouragement..."
          multiline
          maxLength={200}
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={sendChatMessage}
          disabled={!chatMessage.trim()}
        >
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={styles.quickReplies}>
        {session?.socialFeatures.chat.features.quickReplies.map((reply, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickReply}
            onPress={() => {
              setChatMessage(reply);
              setTimeout(sendChatMessage, 100);
            }}
          >
            <Text style={styles.quickReplyText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderChallenges = () => (
    <View style={styles.challengesContainer}>
      <Text style={styles.sectionTitle}>Live Challenges ⚡</Text>
      
      {activeChallenges.length === 0 ? (
        <View style={styles.emptyChallenges}>
          <Ionicons name="trophy-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>No active challenges</Text>
          <Text style={styles.emptySubtext}>New challenges will appear during your workout!</Text>
        </View>
      ) : (
        <ScrollView style={styles.challengesList}>
          {activeChallenges.map((challenge) => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeName}>{challenge.name}</Text>
                <View style={styles.challengeTimer}>
                  <Ionicons name="timer" size={16} color="#FF6B6B" />
                  <Text style={styles.timerText}>{challenge.timeRemaining}s</Text>
                </View>
              </View>
              
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              
              <View style={styles.challengeProgress}>
                <Text style={styles.challengeTarget}>
                  Target: {challenge.target.value} {challenge.target.unit}
                  {challenge.target.timeLimit && ` in ${challenge.target.timeLimit}s`}
                </Text>
                <Text style={styles.challengeLeader}>
                  Leader: {participants.find(p => p.user.id === challenge.currentLeader)?.user.name || 'Unknown'}
                </Text>
              </View>

              <View style={styles.challengeRewards}>
                <Text style={styles.rewardsTitle}>Rewards:</Text>
                {challenge.rewards.map((reward, index) => (
                  <Text key={index} style={styles.reward}>
                    +{reward.value} {reward.description}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'leaderboard':
        return renderLeaderboard();
      case 'chat':
        return renderChat();
      case 'challenges':
        return renderChallenges();
      default:
        return renderWorkoutView();
    }
  };

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={48} color="#007AFF" />
          <Text style={styles.loadingText}>Connecting to workout session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{session.workout.name}</Text>
          <View style={styles.connectionStatus}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#32D74B' : '#FF6B6B' }]} />
            <Text style={styles.statusText}>{isConnected ? 'LIVE' : 'RECONNECTING'}</Text>
          </View>
        </View>

        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderCurrentView()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, currentView === 'workout' && styles.activeNavButton]}
          onPress={() => setCurrentView('workout')}
        >
          <Ionicons 
            name="fitness" 
            size={20} 
            color={currentView === 'workout' ? '#007AFF' : '#666'} 
          />
          <Text style={[
            styles.navText, 
            currentView === 'workout' && styles.activeNavText
          ]}>
            Workout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentView === 'leaderboard' && styles.activeNavButton]}
          onPress={() => setCurrentView('leaderboard')}
        >
          <Ionicons 
            name="trophy" 
            size={20} 
            color={currentView === 'leaderboard' ? '#007AFF' : '#666'} 
          />
          <Text style={[
            styles.navText, 
            currentView === 'leaderboard' && styles.activeNavText
          ]}>
            Leaderboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentView === 'chat' && styles.activeNavButton]}
          onPress={() => setCurrentView('chat')}
        >
          <Ionicons 
            name="chatbubble" 
            size={20} 
            color={currentView === 'chat' ? '#007AFF' : '#666'} 
          />
          <Text style={[
            styles.navText, 
            currentView === 'chat' && styles.activeNavText
          ]}>
            Chat
          </Text>
          {session.socialFeatures.chat.messages.length > 0 && (
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>
                {session.socialFeatures.chat.messages.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentView === 'challenges' && styles.activeNavButton]}
          onPress={() => setCurrentView('challenges')}
        >
          <Ionicons 
            name="flash" 
            size={20} 
            color={currentView === 'challenges' ? '#007AFF' : '#666'} 
          />
          <Text style={[
            styles.navText, 
            currentView === 'challenges' && styles.activeNavText
          ]}>
            Challenges
          </Text>
          {activeChallenges.length > 0 && (
            <View style={styles.challengeBadge}>
              <Text style={styles.challengeBadgeText}>{activeChallenges.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#32D74B',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#111',
  },
  
  // Workout View Styles
  workoutContainer: {
    flex: 1,
    padding: 20,
  },
  currentExerciseCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  exerciseTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseSubtitle: {
    color: '#999',
    fontSize: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  metricValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metricLabel: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  participantsPreview: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  participantAvatar: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarText: {
    backgroundColor: '#007AFF',
    color: '#FFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    textAlign: 'center',
    lineHeight: 48,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#111',
  },
  participantName: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  participantMetric: {
    color: '#999',
    fontSize: 10,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 24,
  },

  // Leaderboard Styles
  leaderboardContainer: {
    flex: 1,
    padding: 20,
  },
  leaderboardList: {
    flex: 1,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  rank: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  leaderboardName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  leaderboardMetrics: {
    flexDirection: 'row',
  },
  leaderboardMetric: {
    color: '#999',
    fontSize: 12,
    marginRight: 12,
  },

  // Chat Styles
  chatContainer: {
    flex: 1,
    padding: 20,
  },
  chatMessages: {
    flex: 1,
    marginBottom: 16,
  },
  chatMessage: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  systemMessage: {
    backgroundColor: '#2C2C2E',
  },
  highlightedMessage: {
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  chatUsername: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  chatText: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 4,
  },
  chatTimestamp: {
    color: '#666',
    fontSize: 10,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFF',
    maxHeight: 80,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickReplies: {
    maxHeight: 40,
  },
  quickReply: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    justifyContent: 'center',
  },
  quickReplyText: {
    color: '#FFF',
    fontSize: 12,
  },

  // Challenges Styles
  challengesContainer: {
    flex: 1,
    padding: 20,
  },
  emptyChallenges: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  challengesList: {
    flex: 1,
  },
  challengeCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  challengeTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timerText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  challengeDescription: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
  },
  challengeProgress: {
    marginBottom: 16,
  },
  challengeTarget: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 4,
  },
  challengeLeader: {
    color: '#32D74B',
    fontSize: 12,
    fontWeight: '600',
  },
  challengeRewards: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 12,
  },
  rewardsTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  reward: {
    color: '#FFD700',
    fontSize: 12,
  },

  // Bottom Navigation Styles
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeNavButton: {
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  navText: {
    color: '#666',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  activeNavText: {
    color: '#007AFF',
  },
  chatBadge: {
    position: 'absolute',
    top: 4,
    right: 20,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  challengeBadge: {
    position: 'absolute',
    top: 4,
    right: 20,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default LiveSocialWorkoutScreen;
