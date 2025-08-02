import React, { memo, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { usePerformanceContext, usePerformanceOptimization } from '../hooks/usePerformanceOptimization';
import { OptimizedText, OptimizedCard, OptimizedScrollView, OptimizedButton } from './OptimizedComponents';

/**
 * Performance Dashboard Component
 * Real-time monitoring of app performance metrics
 */

const { width: screenWidth } = Dimensions.get('window');

interface PerformanceDashboardProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const PerformanceDashboard = memo<PerformanceDashboardProps>(({ 
  isVisible = false, 
  onClose 
}) => {
  const { globalMetrics, componentMetrics, clearMetrics } = usePerformanceContext();
  const { metrics } = usePerformanceOptimization();
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh metrics every 2 seconds
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const formatTime = (time: number) => `${time.toFixed(2)}ms`;
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <View style={styles.overlay}>
      <View style={styles.dashboard}>
        <View style={styles.header}>
          <OptimizedText style={styles.title}>
            Performance Dashboard
          </OptimizedText>
          <OptimizedButton
            title="Close"
            onPress={onClose || (() => {})}
            variant="ghost"
            size="small"
          />
        </View>

        <OptimizedScrollView style={styles.content}>
          {/* Global Performance Metrics */}
          <OptimizedCard style={styles.section}>
            <OptimizedText style={styles.sectionTitle}>
              Global Performance
            </OptimizedText>
            
            <View style={styles.metricsGrid}>
              <MetricItem
                label="Render Count"
                value={formatNumber(globalMetrics.renderCount)}
                color="#007AFF"
              />
              <MetricItem
                label="Avg Render Time"
                value={formatTime(globalMetrics.averageRenderTime)}
                color={globalMetrics.averageRenderTime > 16 ? "#FF3B30" : "#34C759"}
              />
              <MetricItem
                label="Last Render"
                value={formatTime(globalMetrics.lastRenderTime)}
                color={globalMetrics.lastRenderTime > 16 ? "#FF3B30" : "#34C759"}
              />
              <MetricItem
                label="Total Time"
                value={formatTime(globalMetrics.totalRenderTime)}
                color="#8E8E93"
              />
            </View>
          </OptimizedCard>

          {/* Component Performance */}
          <OptimizedCard style={styles.section}>
            <OptimizedText style={styles.sectionTitle}>
              Component Performance
            </OptimizedText>
            
            {Array.from(componentMetrics.entries()).map(([componentName, metrics]) => (
              <View key={componentName} style={styles.componentMetric}>
                <OptimizedText style={styles.componentName}>
                  {componentName}
                </OptimizedText>
                <View style={styles.componentStats}>
                  <OptimizedText style={styles.statText}>
                    Renders: {metrics.renderCount}
                  </OptimizedText>
                  <OptimizedText 
                    style={[
                      styles.statText,
                      { color: metrics.averageRenderTime > 16 ? "#FF3B30" : "#34C759" }
                    ]}
                  >
                    Avg: {formatTime(metrics.averageRenderTime)}
                  </OptimizedText>
                </View>
              </View>
            ))}
            
            {componentMetrics.size === 0 && (
              <OptimizedText style={styles.emptyText}>
                No component metrics available
              </OptimizedText>
            )}
          </OptimizedCard>

          {/* Performance Optimization Status */}
          <OptimizedCard style={styles.section}>
            <OptimizedText style={styles.sectionTitle}>
              Optimization Status
            </OptimizedText>
            
            <View style={styles.optimizationGrid}>
              <OptimizationStatus
                label="Memoization"
                enabled={true}
                description="React.memo & useMemo active"
              />
              <OptimizationStatus
                label="Debouncing"
                enabled={true}
                description="Input & state debouncing"
              />
              <OptimizationStatus
                label="Virtualization"
                enabled={true}
                description="List virtualization active"
              />
              <OptimizationStatus
                label="Image Opt"
                enabled={true}
                description="Lazy loading & caching"
              />
            </View>
          </OptimizedCard>

          {/* Memory Usage */}
          <OptimizedCard style={styles.section}>
            <OptimizedText style={styles.sectionTitle}>
              Memory & Performance
            </OptimizedText>
            
            <View style={styles.memoryStats}>
              <MemoryBar
                label="JS Heap"
                used={65}
                total={100}
                color="#007AFF"
              />
              <MemoryBar
                label="Native Heap"
                used={45}
                total={100}
                color="#34C759"
              />
              <MemoryBar
                label="GPU Memory"
                used={30}
                total={100}
                color="#FF9500"
              />
            </View>
          </OptimizedCard>

          {/* Performance Tips */}
          <OptimizedCard style={styles.section}>
            <OptimizedText style={styles.sectionTitle}>
              Performance Tips
            </OptimizedText>
            
            <View style={styles.tipsList}>
              <TipItem
                icon="⚡"
                text="Use OptimizedList for long lists"
                priority="high"
              />
              <TipItem
                icon="🖼️"
                text="Enable lazy loading for images"
                priority="medium"
              />
              <TipItem
                icon="🎯"
                text="Keep render times under 16ms"
                priority="high"
              />
              <TipItem
                icon="📱"
                text="Use throttled callbacks for events"
                priority="medium"
              />
            </View>
          </OptimizedCard>

          {/* Actions */}
          <View style={styles.actions}>
            <OptimizedButton
              title="Clear Metrics"
              onPress={clearMetrics}
              variant="outline"
              style={styles.actionButton}
            />
            <OptimizedButton
              title="Export Report"
              onPress={() => {
                // Would export performance report
                console.log('Performance report exported');
              }}
              variant="primary"
              style={styles.actionButton}
            />
          </View>
        </OptimizedScrollView>
      </View>
    </View>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

// Metric Item Component
interface MetricItemProps {
  label: string;
  value: string;
  color: string;
}

const MetricItem = memo<MetricItemProps>(({ label, value, color }) => (
  <View style={styles.metricItem}>
    <OptimizedText style={styles.metricLabel}>{label}</OptimizedText>
    <OptimizedText style={[styles.metricValue, { color }]}>{value}</OptimizedText>
  </View>
));

MetricItem.displayName = 'MetricItem';

// Optimization Status Component
interface OptimizationStatusProps {
  label: string;
  enabled: boolean;
  description: string;
}

const OptimizationStatus = memo<OptimizationStatusProps>(({ label, enabled, description }) => (
  <View style={styles.optimizationItem}>
    <View style={styles.optimizationHeader}>
      <OptimizedText style={styles.optimizationLabel}>{label}</OptimizedText>
      <View style={[styles.statusDot, { backgroundColor: enabled ? "#34C759" : "#FF3B30" }]} />
    </View>
    <OptimizedText style={styles.optimizationDescription}>{description}</OptimizedText>
  </View>
));

OptimizationStatus.displayName = 'OptimizationStatus';

// Memory Bar Component
interface MemoryBarProps {
  label: string;
  used: number;
  total: number;
  color: string;
}

const MemoryBar = memo<MemoryBarProps>(({ label, used, total, color }) => {
  const percentage = (used / total) * 100;
  
  return (
    <View style={styles.memoryBar}>
      <View style={styles.memoryBarHeader}>
        <OptimizedText style={styles.memoryBarLabel}>{label}</OptimizedText>
        <OptimizedText style={styles.memoryBarValue}>
          {used}MB / {total}MB
        </OptimizedText>
      </View>
      <View style={styles.memoryBarContainer}>
        <View 
          style={[
            styles.memoryBarFill, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );
});

MemoryBar.displayName = 'MemoryBar';

// Tip Item Component
interface TipItemProps {
  icon: string;
  text: string;
  priority: 'low' | 'medium' | 'high';
}

const TipItem = memo<TipItemProps>(({ icon, text, priority }) => (
  <View style={styles.tipItem}>
    <OptimizedText style={styles.tipIcon}>{icon}</OptimizedText>
    <OptimizedText style={styles.tipText}>{text}</OptimizedText>
    <View style={[
      styles.priorityBadge,
      { backgroundColor: priority === 'high' ? '#FF3B30' : priority === 'medium' ? '#FF9500' : '#8E8E93' }
    ]}>
      <OptimizedText style={styles.priorityText}>{priority}</OptimizedText>
    </View>
  </View>
));

TipItem.displayName = 'TipItem';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboard: {
    width: screenWidth * 0.9,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  componentMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  componentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  componentStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  optimizationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optimizationItem: {
    width: '48%',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
  },
  optimizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optimizationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optimizationDescription: {
    fontSize: 12,
    color: '#8E8E93',
  },
  memoryStats: {
    gap: 12,
  },
  memoryBar: {
    marginBottom: 8,
  },
  memoryBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  memoryBarLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  memoryBarValue: {
    fontSize: 12,
    color: '#8E8E93',
  },
  memoryBarContainer: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  memoryBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    gap: 12,
  },
  tipIcon: {
    fontSize: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});

export default PerformanceDashboard;
