import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ErrorHandler, ErrorFactory, ErrorSeverity } from '../utils/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Create and log the error
    const appError = ErrorFactory.createServerError(
      `React Error Boundary: ${error.message}`,
      `${error.stack}\n\nComponent Stack: ${errorInfo.componentStack}`
    );
    appError.severity = ErrorSeverity.CRITICAL;
    
    ErrorHandler.logError(appError);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorId: appError.id
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (__DEV__) {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.container}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            
            <Text style={styles.errorMessage}>
              We're sorry, but something unexpected happened. The error has been logged and our team will look into it.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Information:</Text>
                <Text style={styles.debugText}>
                  Error: {this.state.error.message}
                </Text>
                {this.state.errorId && (
                  <Text style={styles.debugText}>
                    Error ID: {this.state.errorId}
                  </Text>
                )}
                {this.state.error.stack && (
                  <Text style={styles.debugText}>
                    Stack: {this.state.error.stack}
                  </Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    maxWidth: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  debugContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    maxHeight: 200,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Specific error boundary for screens
export const ScreenErrorBoundary: React.FC<{ children: ReactNode; screenName?: string }> = ({ 
  children, 
  screenName 
}) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      // Custom logging for screen errors
      const appError = ErrorFactory.createServerError(
        `Screen Error (${screenName || 'Unknown'}): ${error.message}`,
        `${error.stack}\n\nComponent Stack: ${errorInfo.componentStack}`
      );
      appError.severity = ErrorSeverity.HIGH;
      ErrorHandler.logError(appError);
    }}
  >
    {children}
  </ErrorBoundary>
);

// Hook for handling async errors in components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: any, context?: string) => {
    const appError = ErrorFactory.createServerError(
      `Component Error${context ? ` (${context})` : ''}: ${error.message || 'Unknown error'}`,
      error.stack
    );
    
    ErrorHandler.logError(appError);
    ErrorHandler.showUserFriendlyError(appError);
  }, []);

  return handleError;
};
