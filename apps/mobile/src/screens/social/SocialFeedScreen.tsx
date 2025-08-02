import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';

const { width } = Dimensions.get('window');

interface SocialFeedScreenProps {
  navigation: any;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  workoutId?: string;
  workoutName?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  isFollowing: boolean;
  type: 'workout' | 'achievement' | 'progress' | 'text';
  achievement?: {
    title: string;
    description: string;
    badge: string;
  };
  progress?: {
    metric: string;
    value: number;
    unit: string;
    change: number;
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'distance' | 'time' | 'reps' | 'weight';
  target: number;
  unit: string;
  duration: number; // days
  participants: number;
  reward: string;
  isJoined: boolean;
  progress: number;
  startDate: Date;
  endDate: Date;
}

export default function SocialFeedScreen({ navigation }: SocialFeedScreenProps) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'leaderboard'>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const samplePosts: Post[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah Johnson',
      userAvatar: undefined,
      content: 'Just completed my morning workout! Feeling energized and ready to take on the day. 💪',
      imageUrl: undefined,
      workoutId: 'workout1',
      workoutName: 'Full Body HIIT',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 24,
      comments: 5,
      isLiked: false,
      isFollowing: true,
      type: 'workout',
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Mike Chen',
      userAvatar: undefined,
      content: 'New personal record! So pumped right now! 🎉',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      likes: 18,
      comments: 8,
      isLiked: true,
      isFollowing: false,
      type: 'achievement',
      achievement: {
        title: 'Deadlift PR',
        description: 'Achieved new personal record in deadlift',
        badge: '🏆',
      },
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Emily Rodriguez',
      userAvatar: undefined,
      content: 'Progress update! Down 5 pounds this month. Consistency is key! 📈',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      likes: 31,
      comments: 12,
      isLiked: false,
      isFollowing: true,
      type: 'progress',
      progress: {
        metric: 'Weight',
        value: 145,
        unit: 'lbs',
        change: -5,
      },
    },
    {
      id: '4',
      userId: 'user4',
      userName: 'Alex Thompson',
      userAvatar: undefined,
      content: 'Beautiful morning run by the lake. Nature is the best gym! 🌅',
      imageUrl: undefined,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      likes: 42,
      comments: 7,
      isLiked: true,
      isFollowing: true,
      type: 'workout',
      workoutName: 'Morning Run',
    },
  ];

  useEffect(() => {
    setPosts(samplePosts);
  }, []);

  const toggleFollow = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, isFollowing: !post.isFollowing }
          : post
      )
    );
  };

  const toggleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const sampleChallenges: Challenge[] = [
    {
      id: '1',
      title: '30-Day Push-up Challenge',
      description: 'Complete 1000 push-ups in 30 days',
      type: 'reps',
      target: 1000,
      unit: 'push-ups',
      duration: 30,
      participants: 127,
      reward: 'Push-up Master Badge',
      isJoined: true,
      progress: 340,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Weekly Running Goal',
      description: 'Run 25 miles this week',
      type: 'distance',
      target: 25,
      unit: 'miles',
      duration: 7,
      participants: 89,
      reward: 'Runner Badge',
      isJoined: false,
      progress: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Strength Month',
      description: 'Increase your max squat by 20 lbs',
      type: 'weight',
      target: 20,
      unit: 'lbs',
      duration: 30,
      participants: 65,
      reward: 'Strength Warrior Badge',
      isJoined: true,
      progress: 12,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    },
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const renderPost = ({ item: post }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{post.userName.charAt(0)}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timestamp}>{formatTimeAgo(post.timestamp)}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.followButton}
          onPress={() => toggleFollow(post.id)}
        >
          <Text style={[styles.followButtonText, post.isFollowing && styles.followingText]}>
            {post.isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.type === 'workout' && post.workoutName && (
        <View style={styles.workoutTag}>
          <Ionicons name="fitness" size={16} color="#667eea" />
          <Text style={styles.workoutTagText}>{post.workoutName}</Text>
        </View>
      )}

      {post.type === 'achievement' && post.achievement && (
        <View style={styles.achievementCard}>
          <Text style={styles.achievementBadge}>{post.achievement.badge}</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>{post.achievement.title}</Text>
            <Text style={styles.achievementDescription}>{post.achievement.description}</Text>
          </View>
        </View>
      )}

      {post.type === 'progress' && post.progress && (
        <View style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressMetric}>{post.progress.metric}</Text>
            <Text style={styles.progressValue}>
              {post.progress.value} {post.progress.unit}
            </Text>
            <Text style={[
              styles.progressChange,
              post.progress.change > 0 ? styles.progressPositive : styles.progressNegative
            ]}>
              {post.progress.change > 0 ? '+' : ''}{post.progress.change} {post.progress.unit}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleLike(post.id)}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.isLiked ? '#ef4444' : '#6b7280'}
          />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#6b7280" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChallenge = (challenge: Challenge) => (
    <View key={challenge.id} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <View style={styles.challengeParticipants}>
          <Ionicons name="people" size={16} color="#6b7280" />
          <Text style={styles.participantsText}>{challenge.participants}</Text>
        </View>
      </View>

      <Text style={styles.challengeDescription}>{challenge.description}</Text>

      <View style={styles.challengeProgress}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            {challenge.isJoined ? 'Your Progress' : 'Goal'}
          </Text>
          <Text style={styles.progressNumbers}>
            {challenge.isJoined ? challenge.progress : challenge.target} / {challenge.target} {challenge.unit}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(challenge.progress / challenge.target) * 100}%` }
            ]}
          />
        </View>
      </View>

      <View style={styles.challengeFooter}>
        <View style={styles.challengeReward}>
          <Ionicons name="trophy" size={16} color="#f59e0b" />
          <Text style={styles.rewardText}>{challenge.reward}</Text>
        </View>
        <TouchableOpacity
          style={[styles.joinButton, challenge.isJoined && styles.joinedButton]}
          onPress={() => {
            Alert.alert('Challenge', challenge.isJoined ? 'Left challenge!' : 'Joined challenge!');
          }}
        >
          <Text style={[styles.joinButtonText, challenge.isJoined && styles.joinedButtonText]}>
            {challenge.isJoined ? 'Joined' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      <Text style={styles.leaderboardTitle}>This Week's Top Performers</Text>
      
      {[
        { rank: 1, name: 'Sarah Johnson', points: 1240, badge: '🥇' },
        { rank: 2, name: 'Mike Chen', points: 1180, badge: '🥈' },
        { rank: 3, name: 'Emily Rodriguez', points: 1150, badge: '🥉' },
        { rank: 4, name: 'Alex Thompson', points: 1100, badge: '' },
        { rank: 5, name: 'Jessica Kim', points: 1050, badge: '' },
      ].map((user) => (
        <View key={user.rank} style={styles.leaderboardItem}>
          <View style={styles.leaderboardRank}>
            <Text style={styles.rankNumber}>{user.rank}</Text>
            {user.badge && <Text style={styles.rankBadge}>{user.badge}</Text>}
          </View>
          <View style={styles.leaderboardUser}>
            <View style={styles.leaderboardAvatar}>
              <Text style={styles.leaderboardAvatarText}>{user.name.charAt(0)}</Text>
            </View>
            <Text style={styles.leaderboardName}>{user.name}</Text>
          </View>
          <Text style={styles.leaderboardPoints}>{user.points} pts</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreatePost(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'feed', label: 'Feed', icon: 'home' },
          { key: 'challenges', label: 'Challenges', icon: 'trophy' },
          { key: 'leaderboard', label: 'Leaderboard', icon: 'podium' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#667eea' : '#9ca3af'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'feed' && (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          style={styles.feedList}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === 'challenges' && (
        <ScrollView style={styles.challengesList} contentContainerStyle={styles.challengesContent}>
          {sampleChallenges.map(renderChallenge)}
        </ScrollView>
      )}

      {activeTab === 'leaderboard' && renderLeaderboard()}

      {/* Create Post Modal */}
      <Modal
        visible={showCreatePost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.createPostModal}>
          <View style={styles.createPostHeader}>
            <TouchableOpacity onPress={() => setShowCreatePost(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.createPostTitle}>Create Post</Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Post Created', 'Your post has been shared!');
                setPostContent('');
                setShowCreatePost(false);
              }}
              disabled={postContent.trim().length === 0}
            >
              <Text style={[
                styles.postText,
                postContent.trim().length === 0 && styles.postTextDisabled
              ]}>
                Post
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.createPostContent}>
            <TextInput
              style={styles.postInput}
              placeholder="What's on your mind?"
              value={postContent}
              onChangeText={setPostContent}
              multiline
              textAlignVertical="top"
              autoFocus
            />

            <View style={styles.postOptions}>
              <TouchableOpacity style={styles.postOption}>
                <Ionicons name="image" size={24} color="#667eea" />
                <Text style={styles.postOptionText}>Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.postOption}>
                <Ionicons name="fitness" size={24} color="#667eea" />
                <Text style={styles.postOptionText}>Workout</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.postOption}>
                <Ionicons name="trophy" size={24} color="#667eea" />
                <Text style={styles.postOptionText}>Achievement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  createButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  feedList: {
    flex: 1,
  },
  feedContent: {
    padding: 15,
    gap: 15,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userDetails: {
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  followButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  followButtonText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  followingText: {
    color: '#6b7280',
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  workoutTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  workoutTagText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 12,
  },
  achievementBadge: {
    fontSize: 32,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#d97706',
  },
  progressCard: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressMetric: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#15803d',
    marginVertical: 4,
  },
  progressChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressPositive: {
    color: '#16a34a',
  },
  progressNegative: {
    color: '#dc2626',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  challengesList: {
    flex: 1,
  },
  challengesContent: {
    padding: 15,
    gap: 15,
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  challengeParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  challengeProgress: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  progressNumbers: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  challengeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  rewardText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: '#667eea',
  },
  joinedButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  joinButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  joinedButtonText: {
    color: '#6b7280',
  },
  leaderboardContainer: {
    flex: 1,
    padding: 15,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
    marginRight: 15,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  rankBadge: {
    fontSize: 20,
    marginTop: 2,
  },
  leaderboardUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  leaderboardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  leaderboardPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  createPostModal: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  createPostTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  postText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  postTextDisabled: {
    color: '#9ca3af',
  },
  createPostContent: {
    flex: 1,
    padding: 20,
  },
  postInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    textAlignVertical: 'top',
    padding: 0,
  },
  postOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  postOption: {
    alignItems: 'center',
    gap: 8,
  },
  postOptionText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
});
