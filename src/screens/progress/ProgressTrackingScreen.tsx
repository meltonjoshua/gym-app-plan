import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addProgressEntry } from '../../store/slices/progressSlice';
import { ProgressEntry } from '../../types';

const { width } = Dimensions.get('window');

export default function ProgressTrackingScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { entries } = useSelector((state: RootState) => state.progress);
  const { userId } = useSelector((state: RootState) => state.auth);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'bodyFat' | 'muscle' | 'measurements'>('weight');
  const [newEntry, setNewEntry] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    measurements: {
      chest: '',
      waist: '',
      hips: '',
      arms: '',
      thighs: '',
    },
    notes: '',
  });

  const getLatestEntry = () => {
    return entries.length > 0 ? entries[entries.length - 1] : null;
  };

  const getLatestWeightEntry = () => {
    return entries.filter(entry => entry.type === 'weight').pop();
  };

  const getLatestMeasurementEntry = () => {
    return entries.filter(entry => entry.type === 'measurement').pop();
  };

  const getProgressData = () => {
    const last30Days = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return entryDate >= thirtyDaysAgo;
    });

    return {
      weightData: last30Days
        .filter(entry => entry.type === 'weight')
        .map(entry => ({
          date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: entry.value || 0,
        })),
      bodyFatData: last30Days
        .filter(entry => entry.type === 'measurement' && entry.measurements?.bodyFat)
        .map(entry => ({
          date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: entry.measurements?.bodyFat || 0,
        })),
      muscleMassData: last30Days
        .filter(entry => entry.type === 'measurement')
        .map(entry => ({
          date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: 0, // We don't have muscle mass in the current type
        })),
    };
  };

  const calculateProgress = () => {
    const weightEntries = entries.filter(entry => entry.type === 'weight');
    const measurementEntries = entries.filter(entry => entry.type === 'measurement');

    if (weightEntries.length < 2 && measurementEntries.length < 2) return null;

    const latestWeight = weightEntries.pop();
    const previousWeight = weightEntries.pop();
    const latestMeasurement = measurementEntries.pop();
    const previousMeasurement = measurementEntries.pop();

    return {
      weightChange: latestWeight && previousWeight && latestWeight.value && previousWeight.value
        ? latestWeight.value - previousWeight.value : 0,
      bodyFatChange: latestMeasurement?.measurements?.bodyFat && previousMeasurement?.measurements?.bodyFat
        ? latestMeasurement.measurements.bodyFat - previousMeasurement.measurements.bodyFat : 0,
      muscleMassChange: 0, // Not available in current type
    };
  };

  const saveProgress = () => {
    if (!newEntry.weight && !newEntry.bodyFat && !newEntry.muscleMass) {
      Alert.alert('Missing Data', 'Please enter at least one measurement.');
      return;
    }

    const progressEntry: ProgressEntry = {
      id: Date.now().toString(),
      userId: userId || 'demo-user',
      date: new Date(),
      type: 'weight',
      value: newEntry.weight ? parseFloat(newEntry.weight) : undefined,
      notes: newEntry.notes || undefined,
    };

    // If we have body measurements, create a separate measurement entry
    if (newEntry.bodyFat || Object.values(newEntry.measurements).some(val => val)) {
      const measurementEntry: ProgressEntry = {
        id: (Date.now() + 1).toString(),
        userId: '1',
        date: new Date(),
        type: 'measurement',
        measurements: {
          chest: newEntry.measurements.chest ? parseFloat(newEntry.measurements.chest) : undefined,
          waist: newEntry.measurements.waist ? parseFloat(newEntry.measurements.waist) : undefined,
          hips: newEntry.measurements.hips ? parseFloat(newEntry.measurements.hips) : undefined,
          biceps: newEntry.measurements.arms ? parseFloat(newEntry.measurements.arms) : undefined,
          thighs: newEntry.measurements.thighs ? parseFloat(newEntry.measurements.thighs) : undefined,
          bodyFat: newEntry.bodyFat ? parseFloat(newEntry.bodyFat) : undefined,
        },
        notes: newEntry.notes || undefined,
      };
      dispatch(addProgressEntry(measurementEntry));
    }

    dispatch(addProgressEntry(progressEntry));
    
    // Reset form
    setNewEntry({
      weight: '',
      bodyFat: '',
      muscleMass: '',
      measurements: {
        chest: '',
        waist: '',
        hips: '',
        arms: '',
        thighs: '',
      },
      notes: '',
    });
    
    setShowAddModal(false);
    Alert.alert('Success', 'Progress entry added successfully!');
  };

  const latestWeightEntry = getLatestWeightEntry();
  const latestMeasurementEntry = getLatestMeasurementEntry();
  const progressData = getProgressData();
  const progressChanges = calculateProgress();

  const renderMetricCard = (title: string, value: string, unit: string, icon: string, color: string, change?: number) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        {change !== undefined && change !== 0 && (
          <View style={styles.changeContainer}>
            <Ionicons 
              name={change > 0 ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={change > 0 ? '#ef4444' : '#10b981'} 
            />
            <Text style={[styles.changeText, { color: change > 0 ? '#ef4444' : '#10b981' }]}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricUnit}>{unit}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );

  const renderMeasurementInput = (label: string, value: string, key: keyof typeof newEntry.measurements) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(text) => setNewEntry(prev => ({
          ...prev,
          measurements: { ...prev.measurements, [key]: text }
        }))}
        placeholder={`Enter ${label.toLowerCase()}`}
        keyboardType="decimal-pad"
      />
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
        <Text style={styles.headerTitle}>Progress Tracking</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Current Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Current Metrics</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Weight',
              latestWeightEntry?.value?.toString() || '0',
              'lbs',
              'scale',
              '#667eea',
              progressChanges?.weightChange
            )}
            {renderMetricCard(
              'Body Fat',
              latestMeasurementEntry?.measurements?.bodyFat?.toString() || '0',
              '%',
              'analytics',
              '#ef4444',
              progressChanges?.bodyFatChange
            )}
            {renderMetricCard(
              'Muscle Mass',
              '0', // Not available in current type
              'lbs',
              'fitness',
              '#10b981',
              progressChanges?.muscleMassChange
            )}
            {renderMetricCard(
              'BMI',
              '23.4',
              '',
              'body',
              '#f59e0b'
            )}
          </View>
        </View>

        {/* Progress Charts */}
        <View style={styles.chartsContainer}>
          <Text style={styles.sectionTitle}>30-Day Trends</Text>
          
          {/* Weight Trend */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Weight Trend</Text>
              <Text style={styles.chartPeriod}>Last 30 days</Text>
            </View>
            <View style={styles.miniChart}>
              {progressData.weightData.length > 0 ? (
                <View style={styles.chartPlaceholder}>
                  <Ionicons name="trending-up" size={32} color="#667eea" />
                  <Text style={styles.chartPlaceholderText}>Weight trending up</Text>
                </View>
              ) : (
                <View style={styles.chartPlaceholder}>
                  <Ionicons name="analytics-outline" size={32} color="#9ca3af" />
                  <Text style={styles.chartPlaceholderText}>No data yet</Text>
                </View>
              )}
            </View>
          </View>

          {/* Body Fat Trend */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Body Fat Trend</Text>
              <Text style={styles.chartPeriod}>Last 30 days</Text>
            </View>
            <View style={styles.miniChart}>
              {progressData.bodyFatData.length > 0 ? (
                <View style={styles.chartPlaceholder}>
                  <Ionicons name="trending-down" size={32} color="#10b981" />
                  <Text style={styles.chartPlaceholderText}>Body fat decreasing</Text>
                </View>
              ) : (
                <View style={styles.chartPlaceholder}>
                  <Ionicons name="analytics-outline" size={32} color="#9ca3af" />
                  <Text style={styles.chartPlaceholderText}>No data yet</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Body Measurements */}
        <View style={styles.measurementsContainer}>
          <Text style={styles.sectionTitle}>Body Measurements</Text>
          <View style={styles.measurementsList}>
            {latestMeasurementEntry?.measurements && (
              <>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Chest</Text>
                  <Text style={styles.measurementValue}>
                    {latestMeasurementEntry.measurements.chest || '--'} in
                  </Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Waist</Text>
                  <Text style={styles.measurementValue}>
                    {latestMeasurementEntry.measurements.waist || '--'} in
                  </Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Hips</Text>
                  <Text style={styles.measurementValue}>
                    {latestMeasurementEntry.measurements.hips || '--'} in
                  </Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Biceps</Text>
                  <Text style={styles.measurementValue}>
                    {latestMeasurementEntry.measurements.biceps || '--'} in
                  </Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Thighs</Text>
                  <Text style={styles.measurementValue}>
                    {latestMeasurementEntry.measurements.thighs || '--'} in
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Progress Photos */}
        <View style={styles.photosContainer}>
          <View style={styles.photosHeader}>
            <Text style={styles.sectionTitle}>Progress Photos</Text>
            <TouchableOpacity style={styles.addPhotoButton}>
              <Ionicons name="camera" size={16} color="#667eea" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.photoGallery}>
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={32} color="#9ca3af" />
              <Text style={styles.photoPlaceholderText}>No photos yet</Text>
            </View>
          </View>
        </View>

        {/* Progress History */}
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          {entries.slice(-5).reverse().map((entry, index) => (
            <View key={entry.id} style={styles.historyItem}>
              <View style={styles.historyDate}>
                <Text style={styles.historyDateText}>
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.historyData}>
                {entry.type === 'weight' && entry.value && (
                  <Text style={styles.historyDataText}>Weight: {entry.value} lbs</Text>
                )}
                {entry.type === 'measurement' && entry.measurements?.bodyFat && (
                  <Text style={styles.historyDataText}>Body Fat: {entry.measurements.bodyFat}%</Text>
                )}
                {entry.type === 'measurement' && entry.measurements?.chest && (
                  <Text style={styles.historyDataText}>Chest: {entry.measurements.chest} in</Text>
                )}
              </View>
            </View>
          ))}
          
          {entries.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No progress entries yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your progress by adding your first measurement
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Progress Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Progress Entry</Text>
            <TouchableOpacity onPress={saveProgress}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Metric Selector */}
            <View style={styles.metricSelector}>
              {(['weight', 'bodyFat', 'muscle', 'measurements'] as const).map((metric) => (
                <TouchableOpacity
                  key={metric}
                  style={[
                    styles.metricButton,
                    selectedMetric === metric && styles.metricButtonActive,
                  ]}
                  onPress={() => setSelectedMetric(metric)}
                >
                  <Text
                    style={[
                      styles.metricButtonText,
                      selectedMetric === metric && styles.metricButtonTextActive,
                    ]}
                  >
                    {metric === 'bodyFat' ? 'Body Fat' : 
                     metric === 'muscle' ? 'Muscle Mass' :
                     metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input Forms */}
            {selectedMetric === 'weight' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Weight (lbs)</Text>
                <TextInput
                  style={styles.input}
                  value={newEntry.weight}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, weight: text }))}
                  placeholder="Enter your weight"
                  keyboardType="decimal-pad"
                />
              </View>
            )}

            {selectedMetric === 'bodyFat' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Body Fat Percentage (%)</Text>
                <TextInput
                  style={styles.input}
                  value={newEntry.bodyFat}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, bodyFat: text }))}
                  placeholder="Enter body fat percentage"
                  keyboardType="decimal-pad"
                />
              </View>
            )}

            {selectedMetric === 'muscle' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Muscle Mass (lbs)</Text>
                <TextInput
                  style={styles.input}
                  value={newEntry.muscleMass}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, muscleMass: text }))}
                  placeholder="Enter muscle mass"
                  keyboardType="decimal-pad"
                />
              </View>
            )}

            {selectedMetric === 'measurements' && (
              <View style={styles.measurementsForm}>
                {renderMeasurementInput('Chest (in)', newEntry.measurements.chest, 'chest')}
                {renderMeasurementInput('Waist (in)', newEntry.measurements.waist, 'waist')}
                {renderMeasurementInput('Hips (in)', newEntry.measurements.hips, 'hips')}
                {renderMeasurementInput('Arms (in)', newEntry.measurements.arms, 'arms')}
                {renderMeasurementInput('Thighs (in)', newEntry.measurements.thighs, 'thighs')}
              </View>
            )}

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={newEntry.notes}
                onChangeText={(text) => setNewEntry(prev => ({ ...prev, notes: text }))}
                placeholder="Add any notes about your progress..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
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
  addButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  metricsContainer: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    backgroundColor: 'white',
    width: (width - 50) / 2,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  chartsContainer: {
    margin: 15,
  },
  chartCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  chartPeriod: {
    fontSize: 12,
    color: '#6b7280',
  },
  miniChart: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  measurementsContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  measurementsList: {},
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  measurementLabel: {
    fontSize: 16,
    color: '#374151',
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  photosContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addPhotoText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  photoGallery: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  historyContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyDate: {
    width: 80,
  },
  historyDateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  historyData: {
    flex: 1,
  },
  historyDataText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  saveButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  metricSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  metricButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  metricButtonActive: {
    backgroundColor: '#667eea',
  },
  metricButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  metricButtonTextActive: {
    color: 'white',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  measurementsForm: {},
});
