import { Middleware } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import React from 'react';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Enhanced error interface
export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  timestamp: Date;
  action?: string; // Which action triggered the error
  userId?: string;
  stackTrace?: string;
  isRetryable: boolean;
  retryCount?: number;
  maxRetries?: number;
}

// Error factory functions
export class ErrorFactory {
  static createNetworkError(message: string, details?: string): AppError {
    return {
      id: this.generateErrorId(),
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      message,
      details,
      timestamp: new Date(),
      isRetryable: true,
      maxRetries: 3,
      retryCount: 0
    };
  }

  static createValidationError(message: string, details?: string): AppError {
    return {
      id: this.generateErrorId(),
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      message,
      details,
      timestamp: new Date(),
      isRetryable: false
    };
  }

  static createAuthenticationError(message: string, details?: string): AppError {
    return {
      id: this.generateErrorId(),
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      message,
      details,
      timestamp: new Date(),
      isRetryable: false
    };
  }

  static createServerError(message: string, details?: string): AppError {
    return {
      id: this.generateErrorId(),
      type: ErrorType.SERVER,
      severity: ErrorSeverity.HIGH,
      message,
      details,
      timestamp: new Date(),
      isRetryable: true,
      maxRetries: 2,
      retryCount: 0
    };
  }

  static createTimeoutError(message: string, details?: string): AppError {
    return {
      id: this.generateErrorId(),
      type: ErrorType.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      message,
      details,
      timestamp: new Date(),
      isRetryable: true,
      maxRetries: 2,
      retryCount: 0
    };
  }

  static fromHttpError(status: number, message: string, details?: string): AppError {
    let type: ErrorType;
    let severity: ErrorSeverity;

    if (status >= 400 && status < 500) {
      if (status === 401) {
        type = ErrorType.AUTHENTICATION;
        severity = ErrorSeverity.HIGH;
      } else if (status === 403) {
        type = ErrorType.AUTHORIZATION;
        severity = ErrorSeverity.HIGH;
      } else if (status === 404) {
        type = ErrorType.NOT_FOUND;
        severity = ErrorSeverity.MEDIUM;
      } else {
        type = ErrorType.CLIENT;
        severity = ErrorSeverity.LOW;
      }
    } else if (status >= 500) {
      type = ErrorType.SERVER;
      severity = ErrorSeverity.HIGH;
    } else {
      type = ErrorType.UNKNOWN;
      severity = ErrorSeverity.MEDIUM;
    }

    return {
      id: this.generateErrorId(),
      type,
      severity,
      message,
      details: details || `HTTP ${status}`,
      timestamp: new Date(),
      isRetryable: status >= 500 || status === 408 || status === 429,
      maxRetries: status >= 500 ? 2 : 0,
      retryCount: 0
    };
  }

  private static generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Error handler utility class
export class ErrorHandler {
  private static errorLog: AppError[] = [];
  private static maxLogSize = 100;

  static logError(error: AppError): void {
    // Add to error log
    this.errorLog.unshift(error);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (__DEV__) {
      console.error('App Error:', {
        id: error.id,
        type: error.type,
        severity: error.severity,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp
      });
    }

    // Handle critical errors
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.handleCriticalError(error);
    }
  }

  static handleCriticalError(error: AppError): void {
    Alert.alert(
      'Critical Error',
      'A critical error occurred. The app may need to restart.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Could trigger app restart or recovery
            console.log('Critical error acknowledged');
          }
        }
      ]
    );
  }

  static showUserFriendlyError(error: AppError): void {
    let title = 'Error';
    let message = error.message;

    switch (error.type) {
      case ErrorType.NETWORK:
        title = 'Connection Error';
        message = 'Please check your internet connection and try again.';
        break;
      case ErrorType.AUTHENTICATION:
        title = 'Authentication Required';
        message = 'Please log in to continue.';
        break;
      case ErrorType.AUTHORIZATION:
        title = 'Access Denied';
        message = 'You don\'t have permission to perform this action.';
        break;
      case ErrorType.VALIDATION:
        title = 'Invalid Input';
        break;
      case ErrorType.SERVER:
        title = 'Server Error';
        message = 'Our servers are experiencing issues. Please try again later.';
        break;
      case ErrorType.TIMEOUT:
        title = 'Request Timeout';
        message = 'The request took too long. Please try again.';
        break;
      default:
        title = 'Unexpected Error';
        message = 'Something went wrong. Please try again.';
    }

    const buttons: Array<{ text: string; onPress?: () => void }> = [{ text: 'OK' }];
    
    if (error.isRetryable && (error.retryCount || 0) < (error.maxRetries || 0)) {
      buttons.unshift({
        text: 'Retry',
        onPress: () => {
          // This would trigger a retry mechanism
          console.log('Retry requested for error:', error.id);
        }
      });
    }

    Alert.alert(title, message, buttons);
  }

  static getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  static clearErrorLog(): void {
    this.errorLog = [];
  }

  static getErrorById(id: string): AppError | undefined {
    return this.errorLog.find(error => error.id === id);
  }

  static getErrorsByType(type: ErrorType): AppError[] {
    return this.errorLog.filter(error => error.type === type);
  }

  static getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errorLog.filter(error => error.severity === severity);
  }
}

// Redux middleware for error handling
export const errorHandlingMiddleware: Middleware = (store) => (next) => (action: any) => {
  try {
    return next(action);
  } catch (error) {
    const appError = ErrorFactory.createServerError(
      'Redux action failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    if (action && typeof action === 'object' && 'type' in action) {
      appError.action = action.type;
    }
    
    ErrorHandler.logError(appError);
    
    // Dispatch error action to update UI
    store.dispatch({
      type: 'error/globalError',
      payload: appError
    });
    
    throw error; // Re-throw to maintain Redux behavior
  }
};

// Async thunk error handler
export const handleAsyncThunkError = (error: any, actionType?: string): AppError => {
  let appError: AppError;

  if (error?.response) {
    // HTTP error
    appError = ErrorFactory.fromHttpError(
      error.response.status,
      error.response.data?.message || error.message || 'HTTP request failed',
      JSON.stringify(error.response.data)
    );
  } else if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
    // Network error
    appError = ErrorFactory.createNetworkError(
      'Unable to connect to the server',
      'Please check your internet connection'
    );
  } else if (error?.code === 'TIMEOUT') {
    // Timeout error
    appError = ErrorFactory.createTimeoutError(
      'Request timed out',
      'The server took too long to respond'
    );
  } else {
    // Generic error
    appError = ErrorFactory.createServerError(
      error?.message || 'An unexpected error occurred',
      error?.stack
    );
  }

  if (actionType) {
    appError.action = actionType;
  }

  ErrorHandler.logError(appError);
  return appError;
};

// Validation helpers
export class ValidationHelper {
  static validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  }

  static validatePassword(password: string): string | null {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return null;
  }

  static validateRequired(value: any, fieldName: string): string | null {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  }

  static validateNumber(value: any, fieldName: string, min?: number, max?: number): string | null {
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a valid number`;
    if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
    if (max !== undefined && num > max) return `${fieldName} must be no more than ${max}`;
    return null;
  }

  static validateForm<T extends Record<string, any>>(
    data: T,
    validators: Record<keyof T, (value: any) => string | null>
  ): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const [field, validator] of Object.entries(validators)) {
      const error = validator(data[field as keyof T]);
      if (error) {
        errors[field as keyof T] = error;
        isValid = false;
      }
    }

    return { isValid, errors };
  }
}

// Network status helper
export class NetworkHelper {
  static isOnline(): boolean {
    return navigator.onLine;
  }

  static async checkConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Retry mechanism
export class RetryHelper {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    backoff: number = 2
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt)));
      }
    }

    throw lastError;
  }
}

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
