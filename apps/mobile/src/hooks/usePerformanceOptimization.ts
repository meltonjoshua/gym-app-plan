import React, { useCallback, useMemo, useRef, useEffect, useState, useContext } from 'react';
import { InteractionManager, LayoutAnimation, Platform } from 'react-native';

/**
 * Performance optimization hook for React Native components
 * Provides memoization, debouncing, and performance monitoring
 */

export interface PerformanceConfig {
  enableMemoization?: boolean;
  enableDebouncing?: boolean;
  debounceDelay?: number;
  enableLayoutAnimations?: boolean;
  enableInteractionManager?: boolean;
  profileRendering?: boolean;
}

export interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
  memoryWarnings: number;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableMemoization: true,
  enableDebouncing: true,
  debounceDelay: 300,
  enableLayoutAnimations: true,
  enableInteractionManager: true,
  profileRendering: __DEV__
};

export function usePerformanceOptimization(config: PerformanceConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    totalRenderTime: 0,
    memoryWarnings: 0
  });

  // Performance monitoring
  useEffect(() => {
    if (finalConfig.profileRendering) {
      const startTime = performance.now();
      renderCountRef.current += 1;

      return () => {
        const renderTime = performance.now() - startTime;
        renderTimesRef.current.push(renderTime);

        // Keep only last 100 render times for average calculation
        if (renderTimesRef.current.length > 100) {
          renderTimesRef.current.shift();
        }

        const totalTime = renderTimesRef.current.reduce((sum, time) => sum + time, 0);
        const averageTime = totalTime / renderTimesRef.current.length;

        setMetrics({
          renderCount: renderCountRef.current,
          lastRenderTime: renderTime,
          averageRenderTime: averageTime,
          totalRenderTime: totalTime,
          memoryWarnings: 0 // Would need native module for actual memory warnings
        });

        // Log slow renders in development
        if (__DEV__ && renderTime > 16) {
          console.warn(`🐌 Slow render detected: ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  });

  /**
   * Optimized callback with memoization
   */
  const useOptimizedCallback = useCallback(
    <T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList): T => {
      if (finalConfig.enableMemoization) {
        return useCallback(callback, deps);
      }
      return callback;
    },
    [finalConfig.enableMemoization]
  );

  /**
   * Optimized memo with deep comparison options
   */
  const useOptimizedMemo = useCallback(
    <T>(factory: () => T, deps: React.DependencyList | undefined): T => {
      if (finalConfig.enableMemoization) {
        return useMemo(factory, deps);
      }
      return factory();
    },
    [finalConfig.enableMemoization]
  );

  /**
   * Debounced value hook
   */
  const useDebouncedValue = useCallback(
    <T>(value: T, delay?: number): T => {
      const [debouncedValue, setDebouncedValue] = useState<T>(value);
      const actualDelay = delay ?? finalConfig.debounceDelay ?? 300;

      useEffect(() => {
        if (!finalConfig.enableDebouncing) {
          setDebouncedValue(value);
          return;
        }

        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, actualDelay);

        return () => {
          clearTimeout(handler);
        };
      }, [value, actualDelay]);

      return debouncedValue;
    },
    [finalConfig.enableDebouncing, finalConfig.debounceDelay]
  );

  /**
   * Run after interactions complete (for better performance)
   */
  const runAfterInteractions = useCallback(
    (callback: () => void): void => {
      if (finalConfig.enableInteractionManager) {
        InteractionManager.runAfterInteractions(callback);
      } else {
        callback();
      }
    },
    [finalConfig.enableInteractionManager]
  );

  /**
   * Optimized layout animation
   */
  const configureLayoutAnimation = useCallback(
    (config?: any): void => {
      if (finalConfig.enableLayoutAnimations && Platform.OS !== 'web') {
        LayoutAnimation.configureNext(
          config || LayoutAnimation.Presets.easeInEaseOut
        );
      }
    },
    [finalConfig.enableLayoutAnimations]
  );

  /**
   * Batch state updates for better performance
   */
  const batchStateUpdates = useCallback(
    (updates: (() => void)[]): void => {
      if (Platform.OS === 'web') {
        // On web, use React's automatic batching
        updates.forEach(update => update());
      } else {
        // On native, run after interactions
        runAfterInteractions(() => {
          updates.forEach(update => update());
        });
      }
    },
    [runAfterInteractions]
  );

  /**
   * Throttled function execution
   */
  const useThrottledCallback = useCallback(
    <T extends (...args: any[]) => any>(
      callback: T,
      delay: number = 100
    ): T => {
      const lastCallRef = useRef(0);
      
      return useCallback(
        ((...args: Parameters<T>) => {
          const now = Date.now();
          if (now - lastCallRef.current >= delay) {
            lastCallRef.current = now;
            return callback(...args);
          }
        }) as T,
        [callback, delay]
      );
    },
    []
  );

  /**
   * Virtual list optimization helpers
   */
  const getVirtualizedProps = useCallback(
    (itemCount: number, itemHeight: number, containerHeight: number) => {
      const visibleItemCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
      const overscan = 5; // Additional items to render outside viewport
      
      return {
        itemCount,
        itemHeight,
        overscanCount: overscan,
        visibleItemCount,
        estimatedItemSize: itemHeight
      };
    },
    []
  );

  /**
   * Image optimization helpers
   */
  const getOptimizedImageProps = useCallback(
    (uri: string, width: number, height: number) => {
      const devicePixelRatio = Platform.select({
        ios: 2,
        android: 2,
        default: 1
      });

      return {
        uri,
        width: width * devicePixelRatio,
        height: height * devicePixelRatio,
        resizeMode: 'cover' as const,
        cache: 'force-cache' as const,
        priority: 'normal' as const
      };
    },
    []
  );

  return {
    // Performance monitoring
    metrics,
    
    // Optimization hooks
    useOptimizedCallback,
    useOptimizedMemo,
    useDebouncedValue,
    useThrottledCallback,
    
    // Performance utilities
    runAfterInteractions,
    configureLayoutAnimation,
    batchStateUpdates,
    getVirtualizedProps,
    getOptimizedImageProps,
    
    // Configuration
    config: finalConfig
  };
}

/**
 * Higher-order component for performance optimization
 */
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  config: PerformanceConfig = {}
) {
  const OptimizedComponent = React.memo((props: P) => {
    const performance = usePerformanceOptimization(config);
    
    return <Component {...props} performance={performance} />;
  });

  OptimizedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name})`;
  
  return OptimizedComponent;
}

/**
 * Performance monitoring context
 */
export interface PerformanceContextValue {
  globalMetrics: PerformanceMetrics;
  componentMetrics: Map<string, PerformanceMetrics>;
  addComponentMetrics: (componentName: string, metrics: PerformanceMetrics) => void;
  clearMetrics: () => void;
}

export const PerformanceContext = React.createContext<PerformanceContextValue | null>(null);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [globalMetrics, setGlobalMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    totalRenderTime: 0,
    memoryWarnings: 0
  });
  
  const [componentMetrics, setComponentMetrics] = useState(new Map<string, PerformanceMetrics>());

  const addComponentMetrics = useCallback((componentName: string, metrics: PerformanceMetrics) => {
    setComponentMetrics(prev => new Map(prev.set(componentName, metrics)));
    
    // Update global metrics
    setGlobalMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      lastRenderTime: metrics.lastRenderTime,
      averageRenderTime: (prev.totalRenderTime + metrics.lastRenderTime) / (prev.renderCount + 1),
      totalRenderTime: prev.totalRenderTime + metrics.lastRenderTime,
      memoryWarnings: prev.memoryWarnings + metrics.memoryWarnings
    }));
  }, []);

  const clearMetrics = useCallback(() => {
    setGlobalMetrics({
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      totalRenderTime: 0,
      memoryWarnings: 0
    });
    setComponentMetrics(new Map());
  }, []);

  const value = useMemo(() => ({
    globalMetrics,
    componentMetrics,
    addComponentMetrics,
    clearMetrics
  }), [globalMetrics, componentMetrics, addComponentMetrics, clearMetrics]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformanceContext() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within a PerformanceProvider');
  }
  return context;
}
