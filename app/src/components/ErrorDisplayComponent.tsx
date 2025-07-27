import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  selectAllErrors,
  selectCurrentError,
  selectIsShowingError,
  selectNetworkStatus,
  selectErrorStats,
  dismissError,
  clearAllErrors,
  hideCurrentError,
  addError,
} from '../store/slices/errorSlice';
import { RootState } from '../store';
import { 
  ErrorFactory, 
  ErrorHandler, 
  ErrorType, 
  ErrorSeverity,
  useErrorHandler 
} from '../utils/errorHandling';

interface ErrorDisplayComponentProps {
  showDetails?: boolean;
}

const ErrorDisplayComponent: React.FC<ErrorDisplayComponentProps> = ({ showDetails = false }) => {
  const dispatch = useDispatch();
  const handleError = useErrorHandler();
  
  // Redux selectors
  const allErrors = useSelector(selectAllErrors);
  const currentError = useSelector(selectCurrentError);
  const isShowingError = useSelector(selectIsShowingError);
  const networkStatus = useSelector(selectNetworkStatus);
  const errorStats = useSelector(selectErrorStats);
  
  // Local state
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle global error display
  useEffect(() => {
    if (currentError && isShowingError) {
      Alert.alert(
        getErrorTitle(currentError.type),
        currentError.message,
        [
          {
            text: 'Dismiss',
            onPress: () => {
              dispatch(dismissError(currentError.id));
              dispatch(hideCurrentError());
            }
          },
          ...(currentError.isRetryable ? [{
            text: 'Retry',
            onPress: () => handleRetry(currentError.id)
          }] : [])
        ]
      );
    }
  }, [currentError, isShowingError]);

  const getErrorTitle = (type: ErrorType): string => {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Connection Error';
      case ErrorType.AUTHENTICATION:
        return 'Authentication Required';
      case ErrorType.AUTHORIZATION:
        return 'Access Denied';
      case ErrorType.VALIDATION:
        return 'Invalid Input';
      case ErrorType.SERVER:
        return 'Server Error';
      case ErrorType.TIMEOUT:
        return 'Request Timeout';
      default:
        return 'Error';
    }
  };

  const getErrorIcon = (type: ErrorType): string => {
    switch (type) {
      case ErrorType.NETWORK:
        return 'wifi-outline';
      case ErrorType.AUTHENTICATION:
        return 'lock-closed';
      case ErrorType.AUTHORIZATION:
        return 'shield-outline';
      case ErrorType.VALIDATION:
        return 'warning';
      case ErrorType.SERVER:
        return 'server-outline';
      case ErrorType.TIMEOUT:
        return 'time';
      default:
        return 'alert-circle';
    }
  };

  const getSeverityColor = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return '#d32f2f';
      case ErrorSeverity.HIGH:
        return '#f57c00';
      case ErrorSeverity.MEDIUM:
        return '#fbc02d';
      case ErrorSeverity.LOW:
        return '#689f38';
      default:
        return '#757575';
    }
  };

  const handleRetry = (errorId: string) => {
    // Implementation would trigger the retry mechanism
    console.log('Retrying operation for error:', errorId);
    dispatch(hideCurrentError());
  };

  const handleClearAllErrors = () => {
    Alert.alert(
      'Clear All Errors',
      'Are you sure you want to clear all error logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => dispatch(clearAllErrors())
        }
      ]
    );
  };

  // Test error generation functions
  const generateTestError = (type: ErrorType, severity: ErrorSeverity) => {
    let error;
    
    switch (type) {
      case ErrorType.NETWORK:
        error = ErrorFactory.createNetworkError('Test network error', 'Simulated network failure');
        break;
      case ErrorType.VALIDATION:
        error = ErrorFactory.createValidationError('Test validation error', 'Invalid test data');
        break;
      case ErrorType.AUTHENTICATION:
        error = ErrorFactory.createAuthenticationError('Test auth error', 'Simulated auth failure');
        break;
      case ErrorType.SERVER:
        error = ErrorFactory.createServerError('Test server error', 'Simulated server failure');
        break;
      case ErrorType.TIMEOUT:
        error = ErrorFactory.createTimeoutError('Test timeout error', 'Simulated timeout');
        break;
      default:
        error = ErrorFactory.createServerError('Test generic error', 'Simulated generic error');
    }
    
    error.severity = severity;
    dispatch(addError(error));
  };

  const handleAsyncError = async () => {
    try {
      // Simulate an async operation that fails
      throw new Error('Simulated async operation failure');
    } catch (error: any) {
      handleError(error, 'AsyncErrorTest');
    }
  };

  if (!showDetails && allErrors.length === 0) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Network Status Indicator */}
      <View style={[styles.statusBar, { backgroundColor: networkStatus === 'online' ? '#4caf50' : '#f44336' }]}>
        <Ionicons 
          name={networkStatus === 'online' ? 'wifi' : 'wifi-outline'} 
          size={16} 
          color="white" 
        />
        <Text style={styles.statusText}>
          Network: {networkStatus.toUpperCase()}
        </Text>
      </View>

      {/* Error Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Error Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{errorStats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#ddd' }]}>
            <Text style={[styles.statNumber, { color: '#d32f2f' }]}>{errorStats.critical}</Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#ddd' }]}>
            <Text style={[styles.statNumber, { color: '#f57c00' }]}>{errorStats.high}</Text>
            <Text style={styles.statLabel}>High</Text>
          </View>
          <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#ddd' }]}>
            <Text style={[styles.statNumber, { color: '#689f38' }]}>{errorStats.retryable}</Text>
            <Text style={styles.statLabel}>Retryable</Text>
          </View>
        </View>
      </View>

      {/* Error Testing Controls */}
      <View style={styles.testContainer}>
        <Text style={styles.sectionTitle}>Error Testing</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#f44336' }]}
            onPress={() => generateTestError(ErrorType.NETWORK, ErrorSeverity.HIGH)}
          >
            <Text style={styles.testButtonText}>Network Error</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#ff9800' }]}
            onPress={() => generateTestError(ErrorType.VALIDATION, ErrorSeverity.LOW)}
          >
            <Text style={styles.testButtonText}>Validation Error</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#9c27b0' }]}
            onPress={() => generateTestError(ErrorType.AUTHENTICATION, ErrorSeverity.HIGH)}
          >
            <Text style={styles.testButtonText}>Auth Error</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#607d8b' }]}
            onPress={() => generateTestError(ErrorType.SERVER, ErrorSeverity.CRITICAL)}
          >
            <Text style={styles.testButtonText}>Server Error</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#795548' }]}
            onPress={handleAsyncError}
          >
            <Text style={styles.testButtonText}>Async Error</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#d32f2f' }]}
            onPress={handleClearAllErrors}
          >
            <Text style={styles.testButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Log */}
      {allErrors.length > 0 && (
        <View style={styles.errorLogContainer}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.sectionTitle}>
              Error Log ({allErrors.length})
            </Text>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
          
          {isExpanded && (
            <View style={styles.errorList}>
              {allErrors.slice(0, 10).map((error) => (
                <View key={error.id} style={styles.errorItem}>
                  <View style={styles.errorHeader}>
                    <View style={styles.errorIconContainer}>
                      <Ionicons 
                        name={getErrorIcon(error.type) as any} 
                        size={16} 
                        color={getSeverityColor(error.severity)} 
                      />
                    </View>
                    <View style={styles.errorContent}>
                      <Text style={styles.errorType}>{error.type}</Text>
                      <Text style={styles.errorMessage} numberOfLines={2}>
                        {error.message}
                      </Text>
                      <Text style={styles.errorTime}>
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                    <View style={[
                      styles.severityBadge, 
                      { backgroundColor: getSeverityColor(error.severity) }
                    ]}>
                      <Text style={styles.severityText}>{error.severity}</Text>
                    </View>
                  </View>
                  
                  {error.details && (
                    <Text style={styles.errorDetails}>{error.details}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  statusText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  testContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  testButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  errorLogContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorList: {
    padding: 15,
  },
  errorItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorIconContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  errorContent: {
    flex: 1,
  },
  errorType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
  },
  errorMessage: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  errorTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  errorDetails: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    paddingLeft: 26,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  severityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ErrorDisplayComponent;
