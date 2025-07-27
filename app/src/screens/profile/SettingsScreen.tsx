import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

const { width } = Dimensions.get('window');

interface SettingsScreenProps {
  navigation: any;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  color?: string;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    progressUpdates: true,
    socialUpdates: false,
    weeklyReports: true,
    achievementAlerts: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    workoutVisible: false,
    progressVisible: false,
    shareWithFriends: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    autoBackup: true,
    offlineMode: false,
    soundEffects: true,
    hapticFeedback: true,
  });

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          icon: 'person',
          type: 'navigation',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'goals',
          title: 'Fitness Goals',
          subtitle: 'Manage your fitness objectives',
          icon: 'trophy',
          type: 'navigation',
          onPress: () => navigation.navigate('FitnessGoals'),
        },
        {
          id: 'subscription',
          title: 'Subscription',
          subtitle: 'Manage your premium features',
          icon: 'card',
          type: 'navigation',
          onPress: () => navigation.navigate('Subscription'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'workout_reminders',
          title: 'Workout Reminders',
          subtitle: 'Get notified when it\'s time to workout',
          icon: 'alarm',
          type: 'toggle',
          value: notifications.workoutReminders,
          onValueChange: (value) => setNotifications(prev => ({ ...prev, workoutReminders: value })),
        },
        {
          id: 'progress_updates',
          title: 'Progress Updates',
          subtitle: 'Weekly progress summaries',
          icon: 'trending-up',
          type: 'toggle',
          value: notifications.progressUpdates,
          onValueChange: (value) => setNotifications(prev => ({ ...prev, progressUpdates: value })),
        },
        {
          id: 'social_updates',
          title: 'Social Updates',
          subtitle: 'Friend activities and challenges',
          icon: 'people',
          type: 'toggle',
          value: notifications.socialUpdates,
          onValueChange: (value) => setNotifications(prev => ({ ...prev, socialUpdates: value })),
        },
        {
          id: 'weekly_reports',
          title: 'Weekly Reports',
          subtitle: 'Detailed weekly fitness reports',
          icon: 'document-text',
          type: 'toggle',
          value: notifications.weeklyReports,
          onValueChange: (value) => setNotifications(prev => ({ ...prev, weeklyReports: value })),
        },
        {
          id: 'achievement_alerts',
          title: 'Achievement Alerts',
          subtitle: 'Celebrate your milestones',
          icon: 'medal',
          type: 'toggle',
          value: notifications.achievementAlerts,
          onValueChange: (value) => setNotifications(prev => ({ ...prev, achievementAlerts: value })),
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'profile_visible',
          title: 'Public Profile',
          subtitle: 'Make your profile visible to others',
          icon: 'eye',
          type: 'toggle',
          value: privacy.profileVisible,
          onValueChange: (value) => setPrivacy(prev => ({ ...prev, profileVisible: value })),
        },
        {
          id: 'workout_visible',
          title: 'Share Workouts',
          subtitle: 'Allow others to see your workouts',
          icon: 'fitness',
          type: 'toggle',
          value: privacy.workoutVisible,
          onValueChange: (value) => setPrivacy(prev => ({ ...prev, workoutVisible: value })),
        },
        {
          id: 'progress_visible',
          title: 'Share Progress',
          subtitle: 'Allow others to see your progress',
          icon: 'stats-chart',
          type: 'toggle',
          value: privacy.progressVisible,
          onValueChange: (value) => setPrivacy(prev => ({ ...prev, progressVisible: value })),
        },
        {
          id: 'data_export',
          title: 'Export Data',
          subtitle: 'Download your fitness data',
          icon: 'download',
          type: 'action',
          onPress: () => handleDataExport(),
        },
        {
          id: 'privacy_policy',
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          icon: 'shield-checkmark',
          type: 'navigation',
          onPress: () => navigation.navigate('PrivacyPolicy'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'dark_mode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme throughout the app',
          icon: 'moon',
          type: 'toggle',
          value: preferences.darkMode,
          onValueChange: (value) => setPreferences(prev => ({ ...prev, darkMode: value })),
        },
        {
          id: 'auto_backup',
          title: 'Auto Backup',
          subtitle: 'Automatically backup your data',
          icon: 'cloud',
          type: 'toggle',
          value: preferences.autoBackup,
          onValueChange: (value) => setPreferences(prev => ({ ...prev, autoBackup: value })),
        },
        {
          id: 'offline_mode',
          title: 'Offline Mode',
          subtitle: 'Use app features without internet',
          icon: 'cellular',
          type: 'toggle',
          value: preferences.offlineMode,
          onValueChange: (value) => setPreferences(prev => ({ ...prev, offlineMode: value })),
        },
        {
          id: 'sound_effects',
          title: 'Sound Effects',
          subtitle: 'Play sounds for actions and achievements',
          icon: 'volume-high',
          type: 'toggle',
          value: preferences.soundEffects,
          onValueChange: (value) => setPreferences(prev => ({ ...prev, soundEffects: value })),
        },
        {
          id: 'haptic_feedback',
          title: 'Haptic Feedback',
          subtitle: 'Feel vibrations for interactions',
          icon: 'phone-portrait',
          type: 'toggle',
          value: preferences.hapticFeedback,
          onValueChange: (value) => setPreferences(prev => ({ ...prev, hapticFeedback: value })),
        },
        {
          id: 'units',
          title: 'Units & Measurements',
          subtitle: 'Metric or Imperial units',
          icon: 'speedometer',
          type: 'navigation',
          onPress: () => navigation.navigate('UnitsSettings'),
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'Choose your preferred language',
          icon: 'language',
          type: 'navigation',
          onPress: () => navigation.navigate('LanguageSettings'),
        },
      ],
    },
    {
      title: 'Support & About',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'Get help and find answers',
          icon: 'help-circle',
          type: 'navigation',
          onPress: () => navigation.navigate('HelpCenter'),
        },
        {
          id: 'contact',
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          icon: 'mail',
          type: 'action',
          onPress: () => handleContactSupport(),
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          icon: 'chatbubble',
          type: 'action',
          onPress: () => handleSendFeedback(),
        },
        {
          id: 'rate',
          title: 'Rate App',
          subtitle: 'Rate us on the app store',
          icon: 'star',
          type: 'action',
          onPress: () => handleRateApp(),
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          icon: 'document',
          type: 'navigation',
          onPress: () => navigation.navigate('TermsOfService'),
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'App version and information',
          icon: 'information-circle',
          type: 'navigation',
          onPress: () => navigation.navigate('About'),
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          id: 'logout',
          title: 'Sign Out',
          subtitle: 'Sign out of your account',
          icon: 'log-out',
          type: 'action',
          color: '#ef4444',
          onPress: () => handleSignOut(),
        },
        {
          id: 'delete',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account',
          icon: 'trash',
          type: 'action',
          color: '#dc2626',
          onPress: () => handleDeleteAccount(),
        },
      ],
    },
  ];

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'Your fitness data will be prepared and sent to your email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Data export requested') },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => console.log('Email support') },
        { text: 'Chat', onPress: () => console.log('Live chat') },
      ]
    );
  };

  const handleSendFeedback = () => {
    Alert.alert(
      'Send Feedback',
      'Thank you for helping us improve! Your feedback will be sent to our development team.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => console.log('Feedback sent') },
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate Our App',
      'Love our app? Please take a moment to rate us on the app store!',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Rate Now', onPress: () => console.log('Open app store') },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            Alert.alert('Signed Out', 'You have been signed out successfully.');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'This will permanently delete your account and all associated data.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete Forever', 
                  style: 'destructive',
                  onPress: () => console.log('Account deletion requested')
                },
              ]
            );
          }
        },
      ]
    );
  };

  const renderSettingItem = (item: SettingItem) => {
    const iconColor = item.color || '#667eea';
    
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.settingItemLeft}>
          <View style={[styles.settingIcon, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={item.icon as any} size={20} color={iconColor} />
          </View>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, item.color && { color: item.color }]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        {item.type === 'toggle' && item.onValueChange && (
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: '#f3f4f6', true: '#667eea' }}
            thumbColor={item.value ? 'white' : '#f4f3f4'}
          />
        )}
        
        {item.type === 'navigation' && (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
        
        {item.type === 'action' && (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Summary */}
        <View style={styles.profileSummary}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{currentUser?.email || 'user@example.com'}</Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="pencil" size={18} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item) => renderSettingItem(item))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0 (Build 1)</Text>
          <Text style={styles.versionSubtext}>© 2025 FitnessPro. All rights reserved.</Text>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  editProfileButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#d1d5db',
  },
});
