import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  generateSimulatedData,
  addDevice,
  setCurrentHeartRate,
  startHeartRateMonitoring,
  stopHeartRateMonitoring 
} from '../../store/slices/wearableSlice';

const { width } = Dimensions.get('window');

interface WearableDevicesScreenProps {
  navigation: any;
}

export default function WearableDevicesScreen({ navigation }: WearableDevicesScreenProps) {
  const dispatch = useDispatch();
  const { devices, currentHeartRate, todaysData, isLoading } = useSelector((state: RootState) => state.wearable);
  const { currentUser } = useSelector((state: RootState) => state.user);
  
  const [heartRateMonitoring, setHeartRateMonitoring] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with sample wearable data if none exists
    if (devices.length === 0 && currentUser) {
      dispatch(generateSimulatedData({ 
        userId: currentUser.id, 
        deviceType: 'smartwatch' 
      }));
    }
  }, [dispatch, devices.length, currentUser]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (heartRateMonitoring) {
      // Simulate real-time heart rate monitoring
      interval = setInterval(() => {
        const baseRate = 72;
        const variation = Math.random() * 20 - 10; // ±10 BPM variation
        const newRate = Math.max(60, Math.min(100, baseRate + variation));
        dispatch(setCurrentHeartRate(Math.round(newRate)));
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [heartRateMonitoring, dispatch]);

  const handleConnectDevice = () => {
    Alert.alert(
      'Connect Device',
      'Choose a device type to simulate',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Smartwatch', 
          onPress: () => connectDevice('smartwatch')
        },
        { 
          text: 'Fitness Tracker', 
          onPress: () => connectDevice('fitness_tracker')
        },
        { 
          text: 'Heart Rate Monitor', 
          onPress: () => connectDevice('heart_rate_monitor')
        },
      ]
    );
  };

  const connectDevice = (deviceType: 'smartwatch' | 'fitness_tracker' | 'heart_rate_monitor') => {
    if (!currentUser) return;

    dispatch(generateSimulatedData({ 
      userId: currentUser.id, 
      deviceType 
    }));
    
    Alert.alert('Success', `${deviceType.replace('_', ' ')} connected successfully!`);
  };

  const toggleHeartRateMonitoring = (value: boolean) => {
    setHeartRateMonitoring(value);
    if (value) {
      dispatch(startHeartRateMonitoring());
    } else {
      dispatch(stopHeartRateMonitoring());
    }
  };

  const renderDeviceCard = (device: any) => {
    const isSelected = selectedDevice === device.id;
    
    return (
      <TouchableOpacity
        key={device.id}
        style={[styles.deviceCard, isSelected && styles.selectedDeviceCard]}
        onPress={() => setSelectedDevice(isSelected ? null : device.id)}
      >
        <View style={styles.deviceHeader}>
          <View style={styles.deviceInfo}>
            <Ionicons 
              name={device.deviceType === 'smartwatch' ? 'watch' : 
                    device.deviceType === 'fitness_tracker' ? 'fitness' : 'heart'} 
              size={32} 
              color="#667eea" 
            />
            <View style={styles.deviceDetails}>
              <Text style={styles.deviceName}>{device.deviceName}</Text>
              <Text style={styles.deviceType}>
                {device.deviceType.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.syncTime}>
                Last sync: {device.syncTime.toLocaleTimeString()}
              </Text>
            </View>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: '#52c41a' }]}>
            <Text style={styles.statusText}>CONNECTED</Text>
          </View>
        </View>

        {isSelected && (
          <View style={styles.deviceExpanded}>
            <View style={styles.dataGrid}>
              {device.data.heartRate && (
                <View style={styles.dataItem}>
                  <Ionicons name="heart" size={20} color="#ff4d4f" />
                  <Text style={styles.dataLabel}>Heart Rate</Text>
                  <Text style={styles.dataValue}>
                    {device.data.restingHeartRate} BPM
                  </Text>
                </View>
              )}
              
              {device.data.steps && (
                <View style={styles.dataItem}>
                  <Ionicons name="walk" size={20} color="#52c41a" />
                  <Text style={styles.dataLabel}>Steps</Text>
                  <Text style={styles.dataValue}>
                    {device.data.steps.toLocaleString()}
                  </Text>
                </View>
              )}
              
              {device.data.calories && (
                <View style={styles.dataItem}>
                  <Ionicons name="flame" size={20} color="#fa8c16" />
                  <Text style={styles.dataLabel}>Calories</Text>
                  <Text style={styles.dataValue}>
                    {device.data.calories}
                  </Text>
                </View>
              )}
              
              {device.data.sleepHours && (
                <View style={styles.dataItem}>
                  <Ionicons name="moon" size={20} color="#722ed1" />
                  <Text style={styles.dataLabel}>Sleep</Text>
                  <Text style={styles.dataValue}>
                    {device.data.sleepHours.toFixed(1)}h
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const heartRateData = todaysData?.data.heartRate ? {
    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
    datasets: [{
      data: todaysData.data.heartRate.slice(6, 22).filter((_, i) => i % 3 === 0),
      strokeWidth: 3,
      color: (opacity = 1) => `rgba(255, 48, 64, ${opacity})`,
    }]
  } : null;

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(255, 48, 64, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
    },
  };

  const dailyGoalsData = todaysData ? [
    (todaysData.data.steps || 0) / 10000, // Steps goal progress (0-1)
    (todaysData.data.calories || 0) / 2500, // Calories goal progress (0-1)
    (todaysData.data.activeMinutes || 0) / 60, // Active minutes goal progress (0-1)
  ] : [0, 0, 0];

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Wearable Devices</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleConnectDevice}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Real-time Heart Rate Monitoring */}
        <View style={styles.monitoringSection}>
          <View style={styles.monitoringHeader}>
            <Text style={styles.sectionTitle}>Real-time Monitoring</Text>
            <Switch
              value={heartRateMonitoring}
              onValueChange={toggleHeartRateMonitoring}
              thumbColor={heartRateMonitoring ? '#667eea' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#b3c7ff' }}
            />
          </View>
          
          {heartRateMonitoring && (
            <View style={styles.heartRateDisplay}>
              <Ionicons name="heart" size={40} color="#ff4d4f" />
              <Text style={styles.heartRateValue}>
                {currentHeartRate || '--'}
              </Text>
              <Text style={styles.heartRateUnit}>BPM</Text>
              <Text style={styles.heartRateLabel}>Live Heart Rate</Text>
            </View>
          )}
        </View>

        {/* Connected Devices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Devices ({devices.length})</Text>
          {devices.map(renderDeviceCard)}
        </View>

        {/* Today's Health Data */}
        {todaysData && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Progress</Text>
              <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>Daily Goals Progress</Text>
                <View style={styles.progressLabels}>
                  <View style={styles.progressLabel}>
                    <View style={[styles.colorIndicator, { backgroundColor: '#52c41a' }]} />
                    <Text style={styles.labelText}>Steps: {((todaysData.data.steps || 0) / 10000 * 100).toFixed(0)}%</Text>
                  </View>
                  <View style={styles.progressLabel}>
                    <View style={[styles.colorIndicator, { backgroundColor: '#fa8c16' }]} />
                    <Text style={styles.labelText}>Calories: {((todaysData.data.calories || 0) / 2500 * 100).toFixed(0)}%</Text>
                  </View>
                  <View style={styles.progressLabel}>
                    <View style={[styles.colorIndicator, { backgroundColor: '#667eea' }]} />
                    <Text style={styles.labelText}>Active: {((todaysData.data.activeMinutes || 0) / 60 * 100).toFixed(0)}%</Text>
                  </View>
                </View>
                <ProgressChart
                  data={dailyGoalsData}
                  width={width - 80}
                  height={180}
                  strokeWidth={16}
                  radius={32}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1, index) => {
                      const colors = ['#52c41a', '#fa8c16', '#667eea'];
                      return colors[index || 0] || '#667eea';
                    },
                  }}
                  hideLegend={true}
                  style={styles.chart}
                />
              </View>
            </View>

            {heartRateData && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Heart Rate Today</Text>
                <View style={styles.chartContainer}>
                  <LineChart
                    data={heartRateData}
                    width={width - 40}
                    height={200}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                  />
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health Insights</Text>
              <View style={styles.insightsContainer}>
                <View style={styles.insightCard}>
                  <Ionicons name="checkmark-circle" size={24} color="#52c41a" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Excellent Activity Level</Text>
                    <Text style={styles.insightDescription}>
                      You've been consistently active with {todaysData.data.activeMinutes} minutes of exercise today.
                    </Text>
                  </View>
                </View>

                <View style={styles.insightCard}>
                  <Ionicons name="moon" size={24} color="#722ed1" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Quality Sleep</Text>
                    <Text style={styles.insightDescription}>
                      Your {todaysData.data.sleepHours?.toFixed(1)} hours of sleep supports optimal recovery.
                    </Text>
                  </View>
                </View>

                <View style={styles.insightCard}>
                  <Ionicons name="heart" size={24} color="#ff4d4f" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>Heart Health</Text>
                    <Text style={styles.insightDescription}>
                      Resting heart rate of {todaysData.data.restingHeartRate} BPM indicates good cardiovascular fitness.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Device Integration Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integration Tips</Text>
          <View style={styles.tipsContainer}>
            <Text style={styles.tipText}>
              📱 Connect multiple devices for comprehensive health tracking
            </Text>
            <Text style={styles.tipText}>
              ⌚ Enable real-time monitoring during workouts for better insights
            </Text>
            <Text style={styles.tipText}>
              🔄 Data syncs automatically every 15 minutes when connected
            </Text>
            <Text style={styles.tipText}>
              🎯 Set daily goals to stay motivated and track progress
            </Text>
          </View>
        </View>
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  monitoringSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monitoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  heartRateDisplay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  heartRateValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff4d4f',
    marginTop: 10,
  },
  heartRateUnit: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  heartRateLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  deviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDeviceCard: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceDetails: {
    marginLeft: 15,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceType: {
    fontSize: 12,
    color: '#667eea',
    marginTop: 2,
  },
  syncTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  deviceExpanded: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dataItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9ff',
    borderRadius: 8,
  },
  dataLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  labelText: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 8,
  },
  insightsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  insightContent: {
    flex: 1,
    marginLeft: 15,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
    marginBottom: 8,
  },
});