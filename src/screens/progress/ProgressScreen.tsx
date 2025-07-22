import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  // Sample data for charts
  const weightData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [75, 74, 72, 71, 70, 69],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const StatCard = ({ title, value, unit, change, icon }: any) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color="#667eea" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statChange, { color: change > 0 ? '#52c41a' : '#f5222d' }]}>
        {change > 0 ? '+' : ''}{change}% this month
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Progress Tracking</Text>
        <Text style={styles.headerSubtitle}>
          Monitor your fitness journey
        </Text>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsContainer}>
          <StatCard
            title="Weight"
            value="69"
            unit="kg"
            change={-8.5}
            icon="scale"
          />
          <StatCard
            title="Workouts"
            value="42"
            unit="completed"
            change={15}
            icon="fitness"
          />
        </View>
        <View style={styles.statsContainer}>
          <StatCard
            title="Strength"
            value="95"
            unit="kg max"
            change={12}
            icon="barbell"
          />
          <StatCard
            title="Streak"
            value="12"
            unit="days"
            change={5}
            icon="flame"
          />
        </View>
      </View>

      {/* Weight Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weight Progress</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={weightData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Track Progress</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="scale" size={24} color="#667eea" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Log Weight</Text>
            <Text style={styles.actionSubtitle}>Record your current weight</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="camera" size={24} color="#667eea" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Progress Photo</Text>
            <Text style={styles.actionSubtitle}>Take a progress picture</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="resize" size={24} color="#667eea" />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Body Measurements</Text>
            <Text style={styles.actionSubtitle}>Update your measurements</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

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
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statTitle: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  statChange: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chart: {
    borderRadius: 16,
  },
  actionButton: {
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
  actionContent: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bottomPadding: {
    height: 50,
  },
});