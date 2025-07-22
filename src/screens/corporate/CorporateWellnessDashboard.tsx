import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface Employee {
  id: string;
  name: string;
  department: string;
  fitnessScore: number;
  activeMinutes: number;
  challengesCompleted: number;
  lastActivity: string;
}

interface Department {
  name: string;
  employeeCount: number;
  averageFitnessScore: number;
  participationRate: number;
  color: string;
}

interface WellnessChallenge {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  completionRate: number;
  status: 'active' | 'upcoming' | 'completed';
}

const CorporateWellnessDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = React.useState<'7d' | '30d' | '90d'>('30d');
  
  const companyStats = {
    totalEmployees: 245,
    activeUsers: 178,
    participationRate: 72.6,
    averageFitnessScore: 78.4,
    totalWorkoutsCompleted: 1247,
    avgWorkoutsPerEmployee: 7.8,
    healthRiskReduction: 15.3,
    absenteeismReduction: 8.7
  };

  const departments: Department[] = [
    { name: 'Engineering', employeeCount: 85, averageFitnessScore: 82.1, participationRate: 78.8, color: '#667eea' },
    { name: 'Sales', employeeCount: 42, averageFitnessScore: 75.3, participationRate: 85.7, color: '#f093fb' },
    { name: 'Marketing', employeeCount: 28, averageFitnessScore: 79.6, participationRate: 75.0, color: '#4facfe' },
    { name: 'HR', employeeCount: 15, averageFitnessScore: 81.2, participationRate: 93.3, color: '#43e97b' },
    { name: 'Finance', employeeCount: 22, averageFitnessScore: 73.8, participationRate: 63.6, color: '#fa709a' },
    { name: 'Operations', employeeCount: 53, averageFitnessScore: 76.9, participationRate: 69.8, color: '#ffd89b' }
  ];

  const activeChallenges: WellnessChallenge[] = [
    {
      id: '1',
      name: 'Step It Up Challenge',
      description: '10,000 steps daily for 30 days',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      participants: 156,
      completionRate: 68.5,
      status: 'active'
    },
    {
      id: '2',
      name: 'Mindful Moments',
      description: '10 minutes of meditation daily',
      startDate: '2024-12-15',
      endDate: '2025-01-15',
      participants: 89,
      completionRate: 45.2,
      status: 'active'
    },
    {
      id: '3',
      name: 'New Year Fitness Sprint',
      description: 'Complete 20 workouts in January',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      participants: 0,
      completionRate: 0,
      status: 'upcoming'
    }
  ];

  const topPerformers: Employee[] = [
    { id: '1', name: 'Sarah Johnson', department: 'Engineering', fitnessScore: 94.2, activeMinutes: 285, challengesCompleted: 8, lastActivity: '2 hours ago' },
    { id: '2', name: 'Mike Chen', department: 'Sales', fitnessScore: 91.7, activeMinutes: 312, challengesCompleted: 7, lastActivity: '4 hours ago' },
    { id: '3', name: 'Emily Rodriguez', department: 'Marketing', fitnessScore: 89.5, activeMinutes: 298, challengesCompleted: 9, lastActivity: '1 hour ago' },
    { id: '4', name: 'David Kim', department: 'HR', fitnessScore: 87.3, activeMinutes: 267, challengesCompleted: 6, lastActivity: '3 hours ago' },
    { id: '5', name: 'Lisa Wong', department: 'Finance', fitnessScore: 85.9, activeMinutes: 234, challengesCompleted: 5, lastActivity: '6 hours ago' }
  ];

  const engagementData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      data: [65, 72, 78, 75],
      strokeWidth: 3,
      color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`
    }]
  };

  const departmentParticipationData = {
    labels: departments.map(d => d.name.substring(0, 4)),
    datasets: [{
      data: departments.map(d => d.participationRate)
    }]
  };

  const fitnessScoreDistribution = departments.map((dept, index) => ({
    name: dept.name,
    population: dept.averageFitnessScore,
    color: dept.color,
    legendFontColor: '#333',
    legendFontSize: 12
  }));

  const renderStatCard = (title: string, value: string | number, icon: string, change?: string) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <MaterialIcons name={icon as any} size={24} color="#667eea" />
        {change && (
          <View style={[styles.changeIndicator, { backgroundColor: change.startsWith('+') ? '#4CAF50' : '#FF6B6B' }]}>
            <Text style={styles.changeText}>{change}</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderDepartmentCard = (department: Department) => (
    <View key={department.name} style={styles.departmentCard}>
      <View style={styles.departmentHeader}>
        <View style={[styles.departmentColor, { backgroundColor: department.color }]} />
        <View>
          <Text style={styles.departmentName}>{department.name}</Text>
          <Text style={styles.departmentEmployees}>{department.employeeCount} employees</Text>
        </View>
      </View>
      <View style={styles.departmentStats}>
        <View style={styles.departmentStat}>
          <Text style={styles.departmentStatValue}>{department.participationRate}%</Text>
          <Text style={styles.departmentStatLabel}>Participation</Text>
        </View>
        <View style={styles.departmentStat}>
          <Text style={styles.departmentStatValue}>{department.averageFitnessScore}</Text>
          <Text style={styles.departmentStatLabel}>Avg Fitness Score</Text>
        </View>
      </View>
    </View>
  );

  const renderChallengeCard = (challenge: WellnessChallenge) => (
    <View key={challenge.id} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View>
          <Text style={styles.challengeName}>{challenge.name}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
        </View>
        <View style={[
          styles.challengeStatus,
          { backgroundColor: challenge.status === 'active' ? '#4CAF50' : challenge.status === 'upcoming' ? '#FF9800' : '#2196F3' }
        ]}>
          <Text style={styles.challengeStatusText}>
            {challenge.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.challengeStats}>
        <View style={styles.challengeStat}>
          <Text style={styles.challengeStatValue}>{challenge.participants}</Text>
          <Text style={styles.challengeStatLabel}>Participants</Text>
        </View>
        <View style={styles.challengeStat}>
          <Text style={styles.challengeStatValue}>{challenge.completionRate}%</Text>
          <Text style={styles.challengeStatLabel}>Completion</Text>
        </View>
      </View>
    </View>
  );

  const renderTopPerformer = (employee: Employee, index: number) => (
    <View key={employee.id} style={styles.performerCard}>
      <View style={styles.performerRank}>
        <Text style={styles.performerRankText}>{index + 1}</Text>
      </View>
      <View style={styles.performerInfo}>
        <Text style={styles.performerName}>{employee.name}</Text>
        <Text style={styles.performerDepartment}>{employee.department}</Text>
      </View>
      <View style={styles.performerStats}>
        <Text style={styles.performerScore}>{employee.fitnessScore}</Text>
        <Text style={styles.performerScoreLabel}>Score</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Corporate Wellness</Text>
          <Text style={styles.headerSubtitle}>TechCorp Inc. Dashboard</Text>
        </View>
        <View style={styles.timeframeSelector}>
          {(['7d', '30d', '90d'] as const).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.selectedTimeframeButton
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text style={[
                styles.timeframeButtonText,
                selectedTimeframe === timeframe && styles.selectedTimeframeButtonText
              ]}>
                {timeframe.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Total Employees', companyStats.totalEmployees, 'people', undefined)}
            {renderStatCard('Active Users', companyStats.activeUsers, 'fitness-center', '+12%')}
            {renderStatCard('Participation Rate', `${companyStats.participationRate}%`, 'trending-up', '+5.2%')}
            {renderStatCard('Avg Fitness Score', companyStats.averageFitnessScore, 'stars', '+8.1%')}
            {renderStatCard('Total Workouts', companyStats.totalWorkoutsCompleted, 'fitness-center', '+23%')}
            {renderStatCard('Health Risk Reduction', `${companyStats.healthRiskReduction}%`, 'health-and-safety', '+2.1%')}
          </View>
        </View>

        {/* Engagement Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engagement Trends</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={engagementData}
              width={width - 40}
              height={200}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                strokeWidth: 3,
                barPercentage: 0.5,
                useShadowColorFromDataset: false,
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Department Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Department Performance</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={departmentParticipationData}
              width={width - 40}
              height={200}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
                strokeWidth: 2,
                barPercentage: 0.7,
              }}
              style={styles.chart}
              verticalLabelRotation={30}
            />
          </View>
          <View style={styles.departmentList}>
            {departments.map(renderDepartmentCard)}
          </View>
        </View>

        {/* Active Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          {activeChallenges.map(renderChallengeCard)}
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          {topPerformers.map(renderTopPerformer)}
        </View>

        {/* Fitness Score Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Score Distribution</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={fitnessScoreDistribution}
              width={width - 40}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  selectedTimeframeButton: {
    backgroundColor: 'white',
  },
  timeframeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTimeframeButtonText: {
    color: '#667eea',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    margin: 5,
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  changeIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  changeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 10,
  },
  departmentList: {
    marginTop: 15,
  },
  departmentCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  departmentColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  departmentEmployees: {
    fontSize: 12,
    color: '#666',
  },
  departmentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  departmentStat: {
    alignItems: 'center',
  },
  departmentStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  departmentStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  challengeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
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
    marginBottom: 15,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    maxWidth: '70%',
  },
  challengeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  challengeStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  challengeStat: {
    alignItems: 'center',
  },
  challengeStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  challengeStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  performerCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  performerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  performerRankText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  performerDepartment: {
    fontSize: 12,
    color: '#666',
  },
  performerStats: {
    alignItems: 'center',
  },
  performerScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  performerScoreLabel: {
    fontSize: 10,
    color: '#666',
  },
});

export default CorporateWellnessDashboard;
