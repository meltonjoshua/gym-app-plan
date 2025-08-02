import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { apiIntegrationTest } from '../../services/apiIntegrationTest';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details?: any;
  error?: string;
}

export const IntegrationTestScreen: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Health Check', status: 'pending' },
    { name: 'API Status Check', status: 'pending' },
    { name: 'Workout APIs', status: 'pending' },
    { name: 'Exercise Database', status: 'pending' },
    { name: 'Nutrition APIs', status: 'pending' },
    { name: 'Analytics APIs', status: 'pending' },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const updateTestStatus = (index: number, status: TestResult['status'], details?: any, error?: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, details, error } : test
    ));
  };

  const runIndividualTests = async () => {
    setIsRunning(true);
    setSummary(null);

    try {
      // Test 1: Health Check
      updateTestStatus(0, 'running');
      const healthResult = await apiIntegrationTest.testHealthCheck();
      updateTestStatus(0, healthResult ? 'passed' : 'failed', 
        { healthy: healthResult }, 
        healthResult ? undefined : 'Backend not responding'
      );

      // Test 2: API Status
      updateTestStatus(1, 'running');
      const statusResult = await apiIntegrationTest.testApiStatus();
      updateTestStatus(1, statusResult.status === 'success' ? 'passed' : 'failed', 
        statusResult, 
        statusResult.error
      );

      // Test 3: Workout APIs
      updateTestStatus(2, 'running');
      const workoutResult = await apiIntegrationTest.testWorkoutAPIs();
      updateTestStatus(2, workoutResult.workouts.status === 'success' ? 'passed' : 'failed', 
        workoutResult.workouts, 
        workoutResult.workouts.error
      );

      // Test 4: Exercise Database
      updateTestStatus(3, 'running');
      const exerciseStatus = workoutResult.exercises.status === 'success' ? 'passed' : 'failed';
      updateTestStatus(3, exerciseStatus, workoutResult.exercises, workoutResult.exercises.error);

      // Test 5: Nutrition APIs
      updateTestStatus(4, 'running');
      const nutritionResult = await apiIntegrationTest.testNutritionAPIs();
      updateTestStatus(4, nutritionResult.status === 'success' ? 'passed' : 'failed', 
        nutritionResult, 
        nutritionResult.error
      );

      // Test 6: Analytics APIs
      updateTestStatus(5, 'running');
      const analyticsResult = await apiIntegrationTest.testAnalyticsAPIs();
      updateTestStatus(5, analyticsResult.status === 'success' ? 'passed' : 'failed', 
        analyticsResult, 
        analyticsResult.error
      );

      // Calculate summary
      const passed = tests.filter(t => t.status === 'passed').length;
      const failed = tests.filter(t => t.status === 'failed').length;
      setSummary({
        totalTests: tests.length,
        passed: passed,
        failed: failed,
        successRate: `${Math.round((passed / tests.length) * 100)}%`
      });

    } catch (error) {
      Alert.alert('Test Error', 'Failed to run integration tests');
      console.error('Test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runFullTest = async () => {
    setIsRunning(true);
    const results = await apiIntegrationTest.runFullIntegrationTest();
    setSummary(results.summary);
    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return '#4CAF50';
      case 'failed': return '#f44336';
      case 'running': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'running': return '🔄';
      default: return '⏳';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Phase 10: Full-Stack Integration Testing</Text>
        <Text style={styles.subtitle}>Testing React Native ↔ Backend API Integration</Text>
      </View>

      <View style={styles.serverStatus}>
        <Text style={styles.sectionTitle}>🔌 Server Status</Text>
        <Text style={styles.serverInfo}>Backend: http://localhost:5000</Text>
        <Text style={styles.serverInfo}>Frontend: React Native (Expo)</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runIndividualTests}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Tests...' : 'Run Step-by-Step Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={runFullTest}
          disabled={isRunning}
        >
          <Text style={[styles.buttonText, { color: '#333' }]}>
            Run Full Integration Test
          </Text>
        </TouchableOpacity>
      </View>

      {isRunning && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Running API Integration Tests...</Text>
        </View>
      )}

      <View style={styles.testsContainer}>
        <Text style={styles.sectionTitle}>📋 Test Results</Text>
        {tests.map((test, index) => (
          <View key={index} style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text style={styles.testIcon}>{getStatusIcon(test.status)}</Text>
              <Text style={styles.testName}>{test.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(test.status) }]}>
                <Text style={styles.statusText}>{test.status.toUpperCase()}</Text>
              </View>
            </View>
            
            {test.details && (
              <View style={styles.testDetails}>
                <Text style={styles.detailsText}>
                  {JSON.stringify(test.details, null, 2)}
                </Text>
              </View>
            )}

            {test.error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {test.error}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {summary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>📊 Test Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Tests</Text>
              <Text style={styles.summaryValue}>{summary.totalTests}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Passed</Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{summary.passed}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Failed</Text>
              <Text style={[styles.summaryValue, { color: '#f44336' }]}>{summary.failed}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Success Rate</Text>
              <Text style={styles.summaryValue}>{summary.successRate}</Text>
            </View>
          </View>

          {summary.passed === summary.totalTests && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>
                🎉 Full-Stack Integration Successful! 
                All APIs are operational and ready for production.
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Phase 10: Full-Stack Integration Testing
        </Text>
        <Text style={styles.footerSubtext}>
          Validating React Native ↔ Backend Communication
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
    marginTop: 5,
  },
  serverStatus: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  serverInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  testsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  testName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  testDetails: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  detailsText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
  },
  summaryContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  successBanner: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  successText: {
    color: '#2e7d32',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default IntegrationTestScreen;
