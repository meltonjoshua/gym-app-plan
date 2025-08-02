import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  setChallenges, 
  setWorkoutShares, 
  setLeaderboards, 
  setFriends,
  setFriendRequests,
} from '../../store/slices/socialSlice';
import {
  sampleChallenges,
  sampleWorkoutShares,
  sampleLeaderboards,
  sampleFriends,
  sampleFriendRequests,
} from '../../data/sampleData';

const { width } = Dimensions.get('window');

interface SocialScreenProps {
  navigation: any;
}

export default function SocialScreen({ navigation }: SocialScreenProps) {
  const dispatch = useDispatch();
  const { 
    challenges, 
    workoutShares, 
    leaderboards, 
    friends, 
    friendRequests,
    isLoading 
  } = useSelector((state: RootState) => state.social);
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'leaderboard' | 'friends'>('feed');

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = () => {
    // Load sample data (in a real app, this would be API calls)
    dispatch(setChallenges(sampleChallenges));
    dispatch(setWorkoutShares(sampleWorkoutShares));
    dispatch(setLeaderboards(sampleLeaderboards));
    dispatch(setFriends(sampleFriends));
    dispatch(setFriendRequests(sampleFriendRequests));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    loadSocialData();
    setRefreshing(false);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const renderTabButton = (tabName: typeof activeTab, label: string, icon: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabName && styles.activeTabButton]}
      onPress={() => setActiveTab(tabName)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeTab === tabName ? '#007AFF' : '#666'} 
      />
      <Text style={[styles.tabLabel, activeTab === tabName && styles.activeTabLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderWorkoutFeed = () => (
    <View style={styles.feedContainer}>
      {workoutShares.map((share) => (
        <View key={share.id} style={styles.shareCard}>
          <View style={styles.shareHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{share.userName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{share.userName}</Text>
                <Text style={styles.shareTime}>{formatTimeAgo(share.sharedAt)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>{share.workoutName}</Text>
            <Text style={styles.workoutDuration}>{share.duration} minutes</Text>
          </View>
          
          {share.caption && (
            <Text style={styles.caption}>{share.caption}</Text>
          )}
          
          <View style={styles.shareActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons 
                name={share.likes.includes('currentUser') ? 'heart' : 'heart-outline'} 
                size={20} 
                color={share.likes.includes('currentUser') ? '#ff3040' : '#666'} 
              />
              <Text style={styles.actionText}>{share.likes.length}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#666" />
              <Text style={styles.actionText}>{share.comments.length}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color="#666" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderChallenges = () => (
    <View style={styles.challengesContainer}>
      <TouchableOpacity style={styles.createButton}>
        <LinearGradient
          colors={['#007AFF', '#0056CC']}
          style={styles.createButtonGradient}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>Create Challenge</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      {challenges.map((challenge) => (
        <View key={challenge.id} style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: challenge.status === 'active' ? '#34C759' : '#FF9500' }]}>
              <Text style={styles.statusText}>{challenge.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
          
          <View style={styles.challengeProgress}>
            <Text style={styles.progressLabel}>Progress ({challenge.participants.length} participants)</Text>
            {challenge.participants.map((participant, index) => (
              <View key={participant.userId} style={styles.participantRow}>
                <Text style={styles.participantRank}>#{participant.rank}</Text>
                <Text style={styles.participantName}>{participant.userName}</Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${(participant.currentValue / challenge.targetValue) * 100}%`,
                        backgroundColor: index === 0 ? '#34C759' : '#007AFF'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressValue}>
                  {participant.currentValue}/{challenge.targetValue}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      {leaderboards.map((board) => (
        <View key={board.id} style={styles.leaderboardCard}>
          <Text style={styles.leaderboardTitle}>{board.title}</Text>
          
          {board.entries.map((entry, index) => (
            <View key={entry.userId} style={styles.leaderboardEntry}>
              <View style={styles.rankContainer}>
                <Text style={[
                  styles.rank, 
                  index === 0 && styles.goldRank,
                  index === 1 && styles.silverRank,
                  index === 2 && styles.bronzeRank
                ]}>
                  #{entry.rank}
                </Text>
              </View>
              
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{entry.userName.charAt(0)}</Text>
              </View>
              
              <View style={styles.userDetails}>
                <Text style={styles.leaderboardUserName}>{entry.userName}</Text>
                <Text style={styles.leaderboardValue}>{entry.value} workouts</Text>
              </View>
              
              <View style={styles.changeContainer}>
                <Ionicons 
                  name={entry.change > 0 ? 'trending-up' : entry.change < 0 ? 'trending-down' : 'remove'}
                  size={16}
                  color={entry.change > 0 ? '#34C759' : entry.change < 0 ? '#ff3040' : '#666'}
                />
                <Text style={[
                  styles.changeText,
                  { color: entry.change > 0 ? '#34C759' : entry.change < 0 ? '#ff3040' : '#666' }
                ]}>
                  {entry.change === 0 ? '--' : (entry.change > 0 ? '+' : '') + entry.change}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderFriends = () => (
    <View style={styles.friendsContainer}>
      {friendRequests.length > 0 && (
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Friend Requests ({friendRequests.length})</Text>
          {friendRequests.map((request) => (
            <View key={request.id} style={styles.friendRequestCard}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{request.senderName.charAt(0)}</Text>
              </View>
              <View style={styles.requestInfo}>
                <Text style={styles.requestName}>{request.senderName}</Text>
                {request.message && (
                  <Text style={styles.requestMessage}>{request.message}</Text>
                )}
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity style={styles.acceptButton}>
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineButton}>
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
      
      <View style={styles.friendsListSection}>
        <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
        <TouchableOpacity style={styles.addFriendButton}>
          <Ionicons name="person-add" size={20} color="#007AFF" />
          <Text style={styles.addFriendText}>Add Friends</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return renderWorkoutFeed();
      case 'challenges':
        return renderChallenges();
      case 'leaderboard':
        return renderLeaderboard();
      case 'friends':
        return renderFriends();
      default:
        return renderWorkoutFeed();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color="white" />
          {friendRequests.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{friendRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.tabContainer}>
        {renderTabButton('feed', 'Feed', 'newspaper')}
        {renderTabButton('challenges', 'Challenges', 'trophy')}
        {renderTabButton('leaderboard', 'Ranking', 'podium')}
        {renderTabButton('friends', 'Friends', 'people')}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff3040',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#f0f7ff',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  feedContainer: {
    padding: 15,
  },
  shareCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  shareTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuButton: {
    padding: 5,
  },
  workoutInfo: {
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  workoutDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  caption: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  shareActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  challengesContainer: {
    padding: 15,
  },
  createButton: {
    marginBottom: 15,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  challengeProgress: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantRank: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 25,
  },
  participantName: {
    fontSize: 14,
    color: '#333',
    width: 80,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginHorizontal: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressValue: {
    fontSize: 12,
    color: '#666',
    minWidth: 60,
    textAlign: 'right',
  },
  leaderboardContainer: {
    padding: 15,
  },
  leaderboardCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  goldRank: {
    color: '#FFD700',
  },
  silverRank: {
    color: '#C0C0C0',
  },
  bronzeRank: {
    color: '#CD7F32',
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  leaderboardUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  leaderboardValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  friendsContainer: {
    padding: 15,
  },
  requestsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  friendRequestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  requestMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#ff3040',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  declineButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  friendsListSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addFriendText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});