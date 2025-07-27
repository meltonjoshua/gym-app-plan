import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SocialFitnessService, {
  SocialChallenge,
  ChallengeParticipant,
  ChallengeCategory,
  CreateChallengeRequest,
} from '../../services/SocialFitnessService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SocialChallengeScreenProps {
  navigation: any;
}

const SocialChallengeScreen: React.FC<SocialChallengeScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'my-challenges' | 'create'>('discover');
  const [challenges, setChallenges] = useState<SocialChallenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<SocialChallenge[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const socialService = SocialFitnessService.getInstance();

  const challengeCategories: ChallengeCategory[] = [
    {
      id: 'fitness',
      name: 'Fitness',
      icon: 'fitness',
      description: 'General fitness challenges',
      metrics: ['calories', 'workouts', 'duration'],
      popularityScore: 95,
    },
    {
      id: 'strength',
      name: 'Strength',
      icon: 'barbell',
      description: 'Strength training challenges',
      metrics: ['weight', 'reps', 'sets'],
      popularityScore: 88,
    },
    {
      id: 'cardio',
      name: 'Cardio',
      icon: 'heart',
      description: 'Cardiovascular endurance',
      metrics: ['distance', 'time', 'pace'],
      popularityScore: 92,
    },
    {
      id: 'flexibility',
      name: 'Flexibility',
      icon: 'body',
      description: 'Flexibility and mobility',
      metrics: ['sessions', 'duration', 'improvement'],
      popularityScore: 76,
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      icon: 'nutrition',
      description: 'Healthy eating challenges',
      metrics: ['calories', 'macros', 'water'],
      popularityScore: 84,
    },
    {
      id: 'mindfulness',
      name: 'Mindfulness',
      icon: 'flower',
      description: 'Mental wellness challenges',
      metrics: ['meditation', 'mood', 'stress'],
      popularityScore: 71,
    },
  ];

  useEffect(() => {
    loadChallenges();
    loadMyChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      // Mock data for discover challenges
      const mockChallenges: SocialChallenge[] = [
        {
          id: 'challenge_1',
          type: 'community',
          category: challengeCategories[0],
          name: '30-Day Fitness Transformation',
          description: 'Complete 30 workouts in 30 days and transform your fitness level!',
          goal: {
            type: 'target',
            metric: 'workouts',
            target: 30,
            unit: 'sessions',
            rules: [],
            verification: {
              type: 'automatic',
              requirements: [],
              confidence: 95,
              backup: [],
            },
          },
          participants: [],
          rewards: {
            pointsAwarded: 500,
            badges: [
              {
                id: 'transformer',
                name: 'Transformer',
                description: 'Completed 30-day transformation',
                rarity: 'epic',
                design: {
                  shape: 'star',
                  color: '#FFD700',
                  icon: 'trophy',
                  background: 'gradient',
                },
                requirements: [],
                displayOrder: 1,
              }
            ],
            titles: [],
            unlocks: [],
            physicalRewards: [],
            socialRecognition: [],
            tierBonuses: [],
          },
          timeline: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            registrationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            milestones: [],
            phases: [],
            checkpoints: [],
          },
          socialFeatures: {
            leaderboards: [],
            chat: {
              enabled: true,
              channels: [],
              moderation: {
                level: 'moderate',
                autoMod: true,
                moderators: [],
                bannedWords: [],
              },
              announcements: [],
            },
            forums: {
              enabled: true,
              categories: [],
              posts: [],
              moderation: {
                level: 'community',
                moderators: [],
                reportingEnabled: true,
              },
            },
            livestreams: {
              enabled: false,
              platform: 'native',
              schedule: [],
              features: {
                chat: false,
                donations: false,
                polls: false,
                challenges: false,
                realTimeStats: false,
              },
            },
            updates: [],
            mentorship: {
              enabled: false,
              mentorProgram: [],
              peerSupport: {
                enabled: false,
                buddyMatching: false,
                supportGroups: [],
                checkInFrequency: 0,
              },
              expertAdvice: {
                enabled: false,
                experts: [],
                consultationTypes: [],
                bookingSystem: {
                  enabled: false,
                  advanceBooking: 0,
                  cancellationPolicy: '',
                  paymentRequired: false,
                },
              },
            },
          },
          difficulty: {
            level: 'intermediate',
            score: 7,
            factors: [],
          },
          status: 'active',
          createdBy: 'admin',
          isOfficial: true,
        },
        {
          id: 'challenge_2',
          type: 'team',
          category: challengeCategories[1],
          name: 'Strength Squad Challenge',
          description: 'Form teams of 4 and compete to lift the most total weight this month!',
          goal: {
            type: 'ranking',
            metric: 'total_weight',
            unit: 'kg',
            rules: [],
            verification: {
              type: 'automatic',
              requirements: [],
              confidence: 90,
              backup: [],
            },
          },
          participants: [],
          teams: [],
          rewards: {
            pointsAwarded: 300,
            badges: [],
            titles: [],
            unlocks: [],
            physicalRewards: [],
            socialRecognition: [],
            tierBonuses: [],
          },
          timeline: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
            registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            milestones: [],
            phases: [],
            checkpoints: [],
          },
          socialFeatures: {
            leaderboards: [],
            chat: {
              enabled: true,
              channels: [],
              moderation: {
                level: 'basic',
                autoMod: false,
                moderators: [],
                bannedWords: [],
              },
              announcements: [],
            },
            forums: {
              enabled: true,
              categories: [],
              posts: [],
              moderation: {
                level: 'community',
                moderators: [],
                reportingEnabled: true,
              },
            },
            livestreams: {
              enabled: false,
              platform: 'native',
              schedule: [],
              features: {
                chat: false,
                donations: false,
                polls: false,
                challenges: false,
                realTimeStats: false,
              },
            },
            updates: [],
            mentorship: {
              enabled: false,
              mentorProgram: [],
              peerSupport: {
                enabled: false,
                buddyMatching: false,
                supportGroups: [],
                checkInFrequency: 0,
              },
              expertAdvice: {
                enabled: false,
                experts: [],
                consultationTypes: [],
                bookingSystem: {
                  enabled: false,
                  advanceBooking: 0,
                  cancellationPolicy: '',
                  paymentRequired: false,
                },
              },
            },
          },
          difficulty: {
            level: 'advanced',
            score: 8,
            factors: [],
          },
          status: 'active',
          createdBy: 'user_123',
          isOfficial: false,
        },
      ];

      setChallenges(mockChallenges);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      setIsLoading(false);
    }
  };

  const loadMyChallenges = async () => {
    try {
      // Mock data for user's challenges
      const mockMyChallenges: SocialChallenge[] = [
        {
          id: 'my_challenge_1',
          type: 'individual',
          category: challengeCategories[2],
          name: 'My Personal 5K Goal',
          description: 'Run a 5K in under 25 minutes by the end of the month',
          goal: {
            type: 'target',
            metric: 'time',
            target: 25,
            unit: 'minutes',
            rules: [],
            verification: {
              type: 'gps',
              requirements: ['distance_5k', 'time_validation'],
              confidence: 98,
              backup: [],
            },
          },
          participants: [
            {
              userId: 'current_user',
              joinDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              currentProgress: {
                current: 27.5,
                target: 25,
                percentage: 45,
                milestones: [],
                trend: 'improving',
                projectedCompletion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                dailyAverage: 0.2,
              },
              rank: 1,
              achievements: [],
              socialContributions: [],
              motivationFactors: [],
            }
          ],
          rewards: {
            pointsAwarded: 150,
            badges: [],
            titles: [],
            unlocks: [],
            physicalRewards: [],
            socialRecognition: [],
            tierBonuses: [],
          },
          timeline: {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            registrationDeadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            milestones: [],
            phases: [],
            checkpoints: [],
          },
          socialFeatures: {
            leaderboards: [],
            chat: {
              enabled: false,
              channels: [],
              moderation: {
                level: 'none',
                autoMod: false,
                moderators: [],
                bannedWords: [],
              },
              announcements: [],
            },
            forums: {
              enabled: false,
              categories: [],
              posts: [],
              moderation: {
                level: 'community',
                moderators: [],
                reportingEnabled: false,
              },
            },
            livestreams: {
              enabled: false,
              platform: 'native',
              schedule: [],
              features: {
                chat: false,
                donations: false,
                polls: false,
                challenges: false,
                realTimeStats: false,
              },
            },
            updates: [],
            mentorship: {
              enabled: false,
              mentorProgram: [],
              peerSupport: {
                enabled: false,
                buddyMatching: false,
                supportGroups: [],
                checkInFrequency: 0,
              },
              expertAdvice: {
                enabled: false,
                experts: [],
                consultationTypes: [],
                bookingSystem: {
                  enabled: false,
                  advanceBooking: 0,
                  cancellationPolicy: '',
                  paymentRequired: false,
                },
              },
            },
          },
          difficulty: {
            level: 'intermediate',
            score: 6,
            factors: [],
          },
          status: 'active',
          createdBy: 'current_user',
          isOfficial: false,
        }
      ];

      setMyChallenges(mockMyChallenges);
    } catch (error) {
      console.error('Failed to load my challenges:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      // Mock joining challenge
      Alert.alert(
        'Challenge Joined!',
        'You have successfully joined the challenge. Good luck!',
        [{ text: 'OK' }]
      );
      
      // Update challenges state to reflect user has joined
      const updatedChallenges = challenges.map(challenge => {
        if (challenge.id === challengeId) {
          const mockParticipant: ChallengeParticipant = {
            userId: 'current_user',
            joinDate: new Date(),
            currentProgress: {
              current: 0,
              target: challenge.goal.target || 0,
              percentage: 0,
              milestones: [],
              trend: 'stable',
              projectedCompletion: challenge.timeline.endDate,
              dailyAverage: 0,
            },
            rank: challenge.participants.length + 1,
            achievements: [],
            socialContributions: [],
            motivationFactors: [],
          };
          
          return {
            ...challenge,
            participants: [...challenge.participants, mockParticipant],
          };
        }
        return challenge;
      });
      
      setChallenges(updatedChallenges);
    } catch (error) {
      console.error('Failed to join challenge:', error);
      Alert.alert('Error', 'Failed to join challenge. Please try again.');
    }
  };

  const renderChallengeCard = (challenge: SocialChallenge, showProgress?: boolean) => {
    const isJoined = challenge.participants.some(p => p.userId === 'current_user');
    const userProgress = challenge.participants.find(p => p.userId === 'current_user')?.currentProgress;

    return (
      <View key={challenge.id} style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View style={styles.challengeInfo}>
            <View style={styles.challengeBadge}>
              <Ionicons name={challenge.category.icon as any} size={16} color="#FFF" />
              <Text style={styles.challengeBadgeText}>{challenge.category.name}</Text>
            </View>
            <Text style={styles.challengeName}>{challenge.name}</Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
          </View>
          
          <View style={styles.challengeStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{challenge.participants.length}</Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{challenge.rewards.pointsAwarded}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
        </View>

        <View style={styles.challengeDetails}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalText}>
              Goal: {challenge.goal.target} {challenge.goal.unit}
            </Text>
            <Text style={styles.difficultyText}>
              Difficulty: {challenge.difficulty.level}
            </Text>
          </View>

          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>
              Ends: {challenge.timeline.endDate.toLocaleDateString()}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: challenge.status === 'active' ? '#32D74B' : '#FF6B6B' }
            ]}>
              <Text style={styles.statusText}>{challenge.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {showProgress && userProgress && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Text style={styles.progressPercentage}>{Math.round(userProgress.percentage)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(100, userProgress.percentage)}%` }
                ]} 
              />
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.progressStat}>
                Current: {userProgress.current} {challenge.goal.unit}
              </Text>
              <Text style={styles.progressStat}>
                Target: {userProgress.target} {challenge.goal.unit}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.challengeActions}>
          {!isJoined ? (
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => joinChallenge(challenge.id)}
            >
              <Ionicons name="add" size={16} color="#FFF" />
              <Text style={styles.joinButtonText}>Join Challenge</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.joinedIndicator}>
              <Ionicons name="checkmark-circle" size={16} color="#32D74B" />
              <Text style={styles.joinedText}>Joined</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => navigation.navigate('ChallengeDetails', { challengeId: challenge.id })}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDiscoverTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList}>
          {challengeCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory?.id === category.id && styles.selectedCategoryCard
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Ionicons name={category.icon as any} size={24} color="#FFF" />
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.challengesSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory ? `${selectedCategory.name} Challenges` : 'Popular Challenges'}
        </Text>
        {challenges.map(challenge => renderChallengeCard(challenge))}
      </View>
    </ScrollView>
  );

  const renderMyChallengesTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsOverview}>
        <Text style={styles.sectionTitle}>Your Challenge Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{myChallenges.length}</Text>
            <Text style={styles.statTitle}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statTitle}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>850</Text>
            <Text style={styles.statTitle}>Points Earned</Text>
          </View>
        </View>
      </View>

      <View style={styles.challengesSection}>
        <Text style={styles.sectionTitle}>My Active Challenges</Text>
        {myChallenges.length > 0 ? (
          myChallenges.map(challenge => renderChallengeCard(challenge, true))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color="#666" />
            <Text style={styles.emptyTitle}>No Active Challenges</Text>
            <Text style={styles.emptySubtitle}>Join a challenge to start tracking your progress!</Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => setActiveTab('discover')}
            >
              <Text style={styles.browseButtonText}>Browse Challenges</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={48} color="#007AFF" />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Challenges</Text>
        <TouchableOpacity onPress={() => setCreateModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
            Discover
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-challenges' && styles.activeTab]}
          onPress={() => setActiveTab('my-challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'my-challenges' && styles.activeTabText]}>
            My Challenges
          </Text>
          {myChallenges.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{myChallenges.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'discover' ? renderDiscoverTab() : renderMyChallengesTab()}
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
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#007AFF',
  },
  tabBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  tabBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#111',
  },
  categoriesSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesList: {
    maxHeight: 120,
  },
  categoryCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    width: 100,
  },
  selectedCategoryCard: {
    backgroundColor: '#007AFF',
  },
  categoryName: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryDescription: {
    color: '#999',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  challengesSection: {
    padding: 20,
    paddingTop: 0,
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
    marginBottom: 16,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  challengeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  challengeName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  challengeDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
  challengeStats: {
    alignItems: 'flex-end',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    fontSize: 10,
  },
  challengeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  difficultyText: {
    color: '#FFD700',
    fontSize: 12,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  timeText: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercentage: {
    color: '#32D74B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#3C3C3E',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#32D74B',
    borderRadius: 3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    color: '#999',
    fontSize: 12,
  },
  challengeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  joinedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinedText: {
    color: '#32D74B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewButtonText: {
    color: '#007AFF',
    fontSize: 14,
    marginRight: 4,
  },
  statsOverview: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SocialChallengeScreen;
