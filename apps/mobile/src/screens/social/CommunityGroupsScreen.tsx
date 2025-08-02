import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SocialFitnessService, {
  CommunityGroup,
  GroupMember,
  GroupCategory,
  GroupActivity,
  CreateGroupRequest,
} from '../../services/SocialFitnessService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CommunityGroupsScreenProps {
  navigation: any;
}

const CommunityGroupsScreen: React.FC<CommunityGroupsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups' | 'create'>('discover');
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [myGroups, setMyGroups] = useState<CommunityGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GroupCategory | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const socialService = SocialFitnessService.getInstance();

  const groupCategories: GroupCategory[] = [
    {
      id: 'fitness_general',
      name: 'General Fitness',
      icon: 'fitness',
      description: 'All-around fitness communities',
      tags: ['fitness', 'health', 'general'],
      targetAudience: ['beginners', 'intermediate', 'advanced'],
    },
    {
      id: 'weightlifting',
      name: 'Weightlifting',
      icon: 'barbell',
      description: 'Strength training and powerlifting',
      tags: ['strength', 'powerlifting', 'bodybuilding'],
      targetAudience: ['intermediate', 'advanced'],
    },
    {
      id: 'running',
      name: 'Running',
      icon: 'walk',
      description: 'Running and marathon training',
      tags: ['cardio', 'endurance', 'marathon'],
      targetAudience: ['beginners', 'runners', 'athletes'],
    },
    {
      id: 'yoga',
      name: 'Yoga & Mindfulness',
      icon: 'leaf',
      description: 'Yoga, meditation, and mental wellness',
      tags: ['yoga', 'mindfulness', 'flexibility'],
      targetAudience: ['beginners', 'yogis', 'wellness'],
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      icon: 'nutrition',
      description: 'Healthy eating and meal planning',
      tags: ['nutrition', 'diet', 'healthy eating'],
      targetAudience: ['health enthusiasts', 'dieters'],
    },
    {
      id: 'crossfit',
      name: 'CrossFit',
      icon: 'flame',
      description: 'High-intensity functional fitness',
      tags: ['crossfit', 'HIIT', 'functional'],
      targetAudience: ['intermediate', 'advanced', 'athletes'],
    },
  ];

  useEffect(() => {
    loadGroups();
    loadMyGroups();
  }, []);

  const loadGroups = async () => {
    try {
      // Mock data for discover groups
      const mockGroups: CommunityGroup[] = [
        {
          id: 'group_1',
          name: 'Fitness Beginners United',
          description: 'A welcoming community for those just starting their fitness journey. Get support, tips, and motivation from fellow beginners and experienced members.',
          type: 'public',
          category: groupCategories[0],
          members: generateMockMembers(156),
          activities: [],
          events: [],
          resources: [],
          moderation: {
            level: 'moderated',
            moderators: ['mod1', 'mod2'],
            rules: [],
            reportingSystem: {
              enabled: true,
              anonymousReporting: true,
              categories: [],
              autoReview: false,
            },
          },
          settings: {
            visibility: 'public',
            memberApproval: false,
            contentModeration: true,
            allowInvites: true,
            maxMembers: 500,
          },
          stats: {
            totalMembers: 156,
            activeMembers: 89,
            totalActivities: 12,
            engagementRate: 67.5,
            growthRate: 8.2,
          },
        },
        {
          id: 'group_2',
          name: 'Powerlifting Masters',
          description: 'Elite powerlifting community for serious lifters. Share PRs, training programs, and compete in monthly challenges.',
          type: 'public',
          category: groupCategories[1],
          members: generateMockMembers(89),
          activities: [],
          events: [],
          resources: [],
          moderation: {
            level: 'moderated',
            moderators: ['mod1'],
            rules: [],
            reportingSystem: {
              enabled: true,
              anonymousReporting: true,
              categories: [],
              autoReview: false,
            },
          },
          settings: {
            visibility: 'public',
            memberApproval: true,
            contentModeration: true,
            allowInvites: true,
            maxMembers: 200,
          },
          stats: {
            totalMembers: 89,
            activeMembers: 71,
            totalActivities: 8,
            engagementRate: 79.8,
            growthRate: 5.1,
          },
        },
        {
          id: 'group_3',
          name: 'Marathon Training Squad',
          description: 'Training together for marathons and half-marathons. Weekly group runs, training tips, and race support.',
          type: 'public',
          category: groupCategories[2],
          members: generateMockMembers(203),
          activities: [],
          events: [],
          resources: [],
          moderation: {
            level: 'community',
            moderators: [],
            rules: [],
            reportingSystem: {
              enabled: true,
              anonymousReporting: false,
              categories: [],
              autoReview: true,
            },
          },
          settings: {
            visibility: 'public',
            memberApproval: false,
            contentModeration: false,
            allowInvites: true,
            maxMembers: 1000,
          },
          stats: {
            totalMembers: 203,
            activeMembers: 145,
            totalActivities: 15,
            engagementRate: 71.4,
            growthRate: 12.3,
          },
        },
      ];

      setGroups(mockGroups);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load groups:', error);
      setIsLoading(false);
    }
  };

  const loadMyGroups = async () => {
    try {
      // Mock data for user's groups
      const mockMyGroups: CommunityGroup[] = [
        {
          id: 'my_group_1',
          name: 'Morning Workout Crew',
          description: 'Early birds who love to start the day with a workout. Join our 6 AM sessions!',
          type: 'private',
          category: groupCategories[0],
          members: generateMockMembers(23),
          activities: [
            {
              id: 'activity_1',
              type: 'workout',
              title: 'Morning HIIT Session',
              description: 'High-intensity interval training to start the day',
              organizer: 'current_user',
              participants: ['user1', 'user2', 'user3'],
              schedule: {
                startDate: new Date(),
                endDate: new Date(),
                frequency: 'daily',
                timeSlots: [{
                  startTime: '06:00',
                  endTime: '07:00',
                  timezone: 'UTC',
                  maxParticipants: 10,
                }],
              },
              requirements: [],
              social: {
                allowComments: true,
                allowPhotos: true,
                allowSharing: true,
                leaderboard: true,
                teamFormation: false,
              },
            },
          ],
          events: [],
          resources: [],
          moderation: {
            level: 'community',
            moderators: [],
            rules: [],
            reportingSystem: {
              enabled: false,
              anonymousReporting: false,
              categories: [],
              autoReview: false,
            },
          },
          settings: {
            visibility: 'private',
            memberApproval: true,
            contentModeration: false,
            allowInvites: true,
            maxMembers: 50,
          },
          stats: {
            totalMembers: 23,
            activeMembers: 19,
            totalActivities: 5,
            engagementRate: 82.6,
            growthRate: 15.2,
          },
        },
      ];

      setMyGroups(mockMyGroups);
    } catch (error) {
      console.error('Failed to load my groups:', error);
    }
  };

  const generateMockMembers = (count: number): GroupMember[] => {
    const mockNames = ['Alex', 'Jordan', 'Sam', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery'];
    return Array.from({ length: Math.min(count, 8) }, (_, index) => ({
      userId: `user_${index}`,
      role: index === 0 ? 'owner' : index < 3 ? 'admin' : 'member',
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      contributions: [],
      reputation: Math.floor(Math.random() * 100) + 50,
      specializations: [],
      status: 'active',
    })) as GroupMember[];
  };

  const joinGroup = async (groupId: string) => {
    try {
      Alert.alert(
        'Group Joined!',
        'You have successfully joined the group. Welcome to the community!',
        [{ text: 'OK' }]
      );
      
      // Update groups state to reflect user has joined
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          const newMember: GroupMember = {
            userId: 'current_user',
            role: 'member',
            joinDate: new Date(),
            contributions: [],
            reputation: 50,
            specializations: [],
            status: 'active',
          };
          
          return {
            ...group,
            members: [...group.members, newMember],
            stats: {
              ...group.stats,
              totalMembers: group.stats.totalMembers + 1,
              activeMembers: group.stats.activeMembers + 1,
            },
          };
        }
        return group;
      });
      
      setGroups(updatedGroups);
    } catch (error) {
      console.error('Failed to join group:', error);
      Alert.alert('Error', 'Failed to join group. Please try again.');
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || group.category.id === selectedCategory.id;
    return matchesSearch && matchesCategory;
  });

  const renderGroupCard = (group: CommunityGroup, isMyGroup?: boolean) => {
    const isJoined = group.members.some(m => m.userId === 'current_user');
    const userMember = group.members.find(m => m.userId === 'current_user');

    return (
      <View key={group.id} style={styles.groupCard}>
        <View style={styles.groupHeader}>
          <View style={styles.groupInfo}>
            <View style={styles.groupBadges}>
              <View style={styles.categoryBadge}>
                <Ionicons name={group.category.icon as any} size={12} color="#FFF" />
                <Text style={styles.categoryBadgeText}>{group.category.name}</Text>
              </View>
              <View style={[
                styles.typeBadge,
                { backgroundColor: group.type === 'public' ? '#32D74B' : '#FF9500' }
              ]}>
                <Text style={styles.typeBadgeText}>
                  {group.type === 'public' ? 'Public' : group.type === 'private' ? 'Private' : 'Invite Only'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.groupName}>{group.name}</Text>
            <Text style={styles.groupDescription} numberOfLines={2}>
              {group.description}
            </Text>
          </View>
        </View>

        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color="#666" />
            <Text style={styles.statText}>{group.stats.totalMembers} members</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="pulse" size={16} color="#666" />
            <Text style={styles.statText}>{group.stats.activeMembers} active</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.statText}>{group.stats.totalActivities} activities</Text>
          </View>
        </View>

        {isMyGroup && userMember && (
          <View style={styles.membershipInfo}>
            <View style={styles.roleInfo}>
              <Text style={styles.roleText}>
                Your role: <Text style={styles.roleValue}>{userMember.role}</Text>
              </Text>
              <Text style={styles.reputationText}>
                Reputation: {userMember.reputation}
              </Text>
            </View>
            <View style={styles.engagementInfo}>
              <Text style={styles.engagementText}>
                Engagement: {Math.round(group.stats.engagementRate)}%
              </Text>
            </View>
          </View>
        )}

        <View style={styles.groupActions}>
          {!isJoined ? (
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => joinGroup(group.id)}
            >
              <Ionicons name="add" size={16} color="#FFF" />
              <Text style={styles.joinButtonText}>Join Group</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.joinedIndicator}>
              <Ionicons name="checkmark-circle" size={16} color="#32D74B" />
              <Text style={styles.joinedText}>Member</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => navigation.navigate('GroupDetails', { groupId: group.id })}
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
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList}>
          <TouchableOpacity
            style={[
              styles.categoryCard,
              !selectedCategory && styles.selectedCategoryCard
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="apps" size={24} color="#FFF" />
            <Text style={styles.categoryName}>All</Text>
          </TouchableOpacity>
          
          {groupCategories.map((category) => (
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Groups List */}
      <View style={styles.groupsSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory ? `${selectedCategory.name} Groups` : 'Discover Groups'}
          {searchQuery && ` • "${searchQuery}"`}
        </Text>
        
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => renderGroupCard(group))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#666" />
            <Text style={styles.emptyTitle}>No groups found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or browse different categories
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderMyGroupsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsOverview}>
        <Text style={styles.sectionTitle}>Your Community Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{myGroups.length}</Text>
            <Text style={styles.statTitle}>Groups Joined</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {myGroups.reduce((sum, group) => sum + group.stats.totalActivities, 0)}
            </Text>
            <Text style={styles.statTitle}>Activities</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.round(myGroups.reduce((sum, group) => sum + group.stats.engagementRate, 0) / Math.max(myGroups.length, 1))}%
            </Text>
            <Text style={styles.statTitle}>Avg Engagement</Text>
          </View>
        </View>
      </View>

      <View style={styles.groupsSection}>
        <Text style={styles.sectionTitle}>My Groups</Text>
        {myGroups.length > 0 ? (
          myGroups.map(group => renderGroupCard(group, true))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#666" />
            <Text style={styles.emptyTitle}>No Groups Yet</Text>
            <Text style={styles.emptySubtitle}>Join communities to connect with like-minded fitness enthusiasts!</Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => setActiveTab('discover')}
            >
              <Text style={styles.browseButtonText}>Discover Groups</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      {myGroups.length > 0 && (
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="calendar" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Schedule Activity</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="chatbubble" size={24} color="#32D74B" />
              <Text style={styles.quickActionText}>Start Discussion</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.quickActionText}>Create Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={48} color="#007AFF" />
          <Text style={styles.loadingText}>Loading communities...</Text>
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
        <Text style={styles.headerTitle}>Community Groups</Text>
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
          style={[styles.tab, activeTab === 'my-groups' && styles.activeTab]}
          onPress={() => setActiveTab('my-groups')}
        >
          <Text style={[styles.tabText, activeTab === 'my-groups' && styles.activeTabText]}>
            My Groups
          </Text>
          {myGroups.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{myGroups.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'discover' ? renderDiscoverTab() : renderMyGroupsTab()}
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
  searchSection: {
    padding: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
  },
  categoriesSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesList: {
    maxHeight: 100,
  },
  categoryCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
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
  groupsSection: {
    padding: 20,
    paddingTop: 0,
  },
  groupCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  groupHeader: {
    marginBottom: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupBadges: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  categoryBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  typeBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  groupName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  groupDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 6,
  },
  membershipInfo: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  roleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleText: {
    color: '#999',
    fontSize: 12,
  },
  roleValue: {
    color: '#007AFF',
    fontWeight: '600',
  },
  reputationText: {
    color: '#32D74B',
    fontSize: 12,
    fontWeight: '600',
  },
  engagementInfo: {
    alignItems: 'center',
  },
  engagementText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  groupActions: {
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
  quickActionsSection: {
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CommunityGroupsScreen;
