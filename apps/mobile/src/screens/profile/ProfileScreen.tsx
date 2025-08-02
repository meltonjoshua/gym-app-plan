import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { clearUser } from '../../store/slices/userSlice';

export default function ProfileScreen({ navigation }: any) {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
            dispatch(logout());
            dispatch(clearUser());
          }
        }
      ]
    );
  };

  const ProfileSection = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ProfileItem = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#667eea" />
      <View style={styles.profileItemContent}>
        <Text style={styles.profileItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, unit }: any) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.name}>{currentUser?.name || 'User'}</Text>
          <Text style={styles.email}>{currentUser?.email}</Text>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Current Weight"
          value={currentUser?.weight || '--'}
          unit="kg"
        />
        <StatCard
          title="Height"
          value={currentUser?.height || '--'}
          unit="cm"
        />
        <StatCard
          title="Fitness Level"
          value={currentUser?.fitnessLevel || 'Beginner'}
          unit=""
        />
      </View>

      {/* Profile Sections */}
      <ProfileSection title="Personal Information">
        <ProfileItem
          icon="person-circle"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => Alert.alert('Edit Profile', 'Feature coming soon!')}
        />
        <ProfileItem
          icon="fitness"
          title="Fitness Goals"
          subtitle="Manage your fitness objectives"
          onPress={() => Alert.alert('Fitness Goals', 'Feature coming soon!')}
        />
        <ProfileItem
          icon="body"
          title="Body Measurements"
          subtitle="Track your body measurements"
          onPress={() => Alert.alert('Body Measurements', 'Feature coming soon!')}
        />
      </ProfileSection>

      <ProfileSection title="App Settings">
        <ProfileItem
          icon="notifications"
          title="Notifications"
          subtitle="Manage your notification preferences"
          onPress={() => Alert.alert('Notifications', 'Feature coming soon!')}
        />
        <ProfileItem
          icon="watch"
          title="Wearable Devices"
          subtitle="Connect fitness trackers and smartwatches"
          onPress={() => navigation.navigate('WearableDevices')}
        />
        <ProfileItem
          icon="people"
          title="Trainer Marketplace"
          subtitle="Find and book certified trainers"
          onPress={() => navigation.navigate('TrainerMarketplace')}
        />
        <ProfileItem
          icon="time"
          title="Workout Reminders"
          subtitle="Set reminders for your workouts"
          onPress={() => Alert.alert('Reminders', 'Feature coming soon!')}
        />
        <ProfileItem
          icon="settings"
          title="App Preferences"
          subtitle="Customize your app experience"
          onPress={() => Alert.alert('Preferences', 'Feature coming soon!')}
        />
      </ProfileSection>

      <ProfileSection title="Data & Privacy">
        <ProfileItem
          icon="cloud-upload"
          title="Backup Data"
          subtitle="Backup your fitness data"
          onPress={() => Alert.alert('Backup', 'Feature coming soon!')}
        />
        <ProfileItem
          icon="download"
          title="Export Data"
          subtitle="Download your fitness data"
          onPress={() => Alert.alert('Export', 'Feature coming soon!')}
        />
        <ProfileItem
          icon="shield-checkmark"
          title="Privacy Settings"
          subtitle="Control your data privacy"
          onPress={() => Alert.alert('Privacy', 'Feature coming soon!')}
        />
      </ProfileSection>

      <ProfileSection title="Support">
        <ProfileItem
          icon="help-circle"
          title="Help & FAQ"
          subtitle="Get help and find answers"
          onPress={() => Alert.alert('Help', 'Feature coming soon!')}
        />
        <ProfileItem
          icon="mail"
          title="Contact Support"
          subtitle="Get in touch with our team"
          onPress={() => Alert.alert('Contact', 'Feature coming soon!')}
        />
        <ProfileItem
          icon="star"
          title="Rate App"
          subtitle="Rate us on the app store"
          onPress={() => Alert.alert('Rate App', 'Thank you for your support!')}
        />
      </ProfileSection>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#f5222d" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  profileItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileItemContent: {
    flex: 1,
    marginLeft: 15,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5222d',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 50,
  },
});