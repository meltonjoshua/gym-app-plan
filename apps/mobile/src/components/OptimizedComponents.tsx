import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  FlatList, 
  Image, 
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { usePerformanceOptimization } from '../hooks/usePerformanceOptimization';

/**
 * Performance-optimized React Native components
 * - Memoized rendering
 * - Virtualized lists
 * - Optimized images
 * - Smart re-rendering
 */

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Optimized Text Component
interface OptimizedTextProps {
  children: React.ReactNode;
  style?: any;
  numberOfLines?: number;
  onPress?: () => void;
  testID?: string;
}

const OptimizedText = memo<OptimizedTextProps>(({ 
  children, 
  style, 
  numberOfLines, 
  onPress, 
  testID 
}) => {
  // Skip re-render if text hasn't changed
  const memoizedStyle = useMemo(() => style, [JSON.stringify(style)]);
  
  return (
    <Text
      style={memoizedStyle}
      numberOfLines={numberOfLines}
      onPress={onPress}
      testID={testID}
      allowFontScaling={false} // Prevent layout shifts
    >
      {children}
    </Text>
  );
});

OptimizedText.displayName = 'OptimizedText';

// Optimized Image Component with lazy loading
interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: any;
  width?: number;
  height?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  testID?: string;
}

const OptimizedImage = memo<OptimizedImageProps>(({ 
  source, 
  style, 
  width, 
  height, 
  resizeMode = 'cover',
  placeholder,
  onLoad,
  onError,
  lazy = true,
  testID
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  
  const { getOptimizedImageProps } = usePerformanceOptimization();
  
  useEffect(() => {
    if (lazy) {
      // Simulate intersection observer for lazy loading
      const timer = setTimeout(() => setShouldLoad(true), 100);
      return () => clearTimeout(timer);
    }
  }, [lazy]);
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);
  
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);
  
  const imageStyle = useMemo(() => [
    style,
    width && height && { width, height },
    !isLoaded && { opacity: 0 }
  ], [style, width, height, isLoaded]);
  
  if (!shouldLoad) {
    return (
      <View style={[imageStyle, styles.imagePlaceholder]} testID={`${testID}-placeholder`}>
        {placeholder || <ActivityIndicator size="small" color="#999" />}
      </View>
    );
  }
  
  if (hasError) {
    return (
      <View style={[imageStyle, styles.imageError]} testID={`${testID}-error`}>
        <Text style={styles.errorText}>Failed to load</Text>
      </View>
    );
  }
  
  const optimizedProps = typeof source === 'object' && source.uri
    ? getOptimizedImageProps(source.uri, width || 200, height || 200)
    : {};
  
  return (
    <Image
      source={typeof source === 'object' ? { ...source, ...optimizedProps } : source}
      style={imageStyle}
      resizeMode={resizeMode}
      onLoad={handleLoad}
      onError={handleError}
      testID={testID}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Optimized List Component with virtualization
interface OptimizedListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
  horizontal?: boolean;
  numColumns?: number;
  estimatedItemSize?: number;
  maxItemsToRender?: number;
  windowSize?: number;
  testID?: string;
}

function OptimizedList<T>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  horizontal = false,
  numColumns = 1,
  estimatedItemSize = 80,
  maxItemsToRender = 50,
  windowSize = 10,
  testID
}: OptimizedListProps<T>) {
  const { useDebouncedValue } = usePerformanceOptimization();
  
  // Debounce data updates to prevent excessive re-renders
  const debouncedData = useDebouncedValue(data, 100);
  
  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      return (
        <View key={keyExtractor?.(item, index) || index.toString()}>
          {renderItem({ item, index })}
        </View>
      );
    },
    [renderItem, keyExtractor]
  );
  
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: estimatedItemSize,
      offset: estimatedItemSize * index,
      index,
    }),
    [estimatedItemSize]
  );
  
  return (
    <FlatList
      data={debouncedData}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      horizontal={horizontal}
      numColumns={numColumns}
      getItemLayout={getItemLayout}
      maxToRenderPerBatch={windowSize}
      windowSize={windowSize}
      initialNumToRender={Math.min(windowSize, maxItemsToRender)}
      removeClippedSubviews={true}
      scrollEventThrottle={16}
      testID={testID}
    />
  );
}

// Optimized Button Component
interface OptimizedButtonProps {
  title: string;
  onPress: () => void;
  style?: any;
  textStyle?: any;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  testID?: string;
}

const OptimizedButton = memo<OptimizedButtonProps>(({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  size = 'medium',
  testID
}) => {
  const { useThrottledCallback } = usePerformanceOptimization();
  
  // Throttle button presses to prevent double-taps
  const throttledOnPress = useThrottledCallback(onPress, 300);
  
  const buttonStyle = useMemo(() => [
    styles.button,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'outline' && styles.buttonOutline,
    variant === 'ghost' && styles.buttonGhost,
    size === 'small' && styles.buttonSmall,
    size === 'medium' && styles.buttonMedium,
    size === 'large' && styles.buttonLarge,
    disabled && styles.buttonDisabled,
    style
  ], [variant, size, disabled, style]);
  
  const buttonTextStyle = useMemo(() => [
    styles.buttonText,
    variant === 'primary' && styles.buttonTextPrimary,
    variant === 'secondary' && styles.buttonTextSecondary,
    variant === 'outline' && styles.buttonTextOutline,
    variant === 'ghost' && styles.buttonTextGhost,
    size === 'small' && styles.buttonTextSmall,
    size === 'medium' && styles.buttonTextMedium,
    size === 'large' && styles.buttonTextLarge,
    disabled && styles.buttonTextDisabled,
    textStyle
  ], [variant, size, disabled, textStyle]);
  
  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={disabled || loading ? undefined : throttledOnPress}
      disabled={disabled || loading}
      testID={testID}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFF" />
      ) : (
        <OptimizedText style={buttonTextStyle}>
          {title}
        </OptimizedText>
      )}
    </TouchableOpacity>
  );
});

OptimizedButton.displayName = 'OptimizedButton';

// Optimized Card Component
interface OptimizedCardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  shadow?: boolean;
  padding?: number;
  margin?: number;
  testID?: string;
}

const OptimizedCard = memo<OptimizedCardProps>(({ 
  children, 
  style, 
  onPress, 
  shadow = true,
  padding = 16,
  margin = 8,
  testID
}) => {
  const cardStyle = useMemo(() => [
    styles.card,
    shadow && styles.cardShadow,
    { padding, margin },
    style
  ], [shadow, padding, margin, style]);
  
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent
      style={cardStyle}
      onPress={onPress}
      testID={testID}
      activeOpacity={onPress ? 0.9 : 1}
    >
      {children}
    </CardComponent>
  );
});

OptimizedCard.displayName = 'OptimizedCard';

// Optimized ScrollView with performance enhancements
interface OptimizedScrollViewProps {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  onScroll?: (event: any) => void;
  refreshControl?: React.ReactElement;
  testID?: string;
}

const OptimizedScrollView = memo<OptimizedScrollViewProps>(({ 
  children, 
  style, 
  contentContainerStyle,
  horizontal = false,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
  onScroll,
  refreshControl,
  testID
}) => {
  const { useThrottledCallback } = usePerformanceOptimization();
  
  // Throttle scroll events for better performance
  const throttledOnScroll = useThrottledCallback(onScroll || (() => {}), 16);
  
  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      horizontal={horizontal}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      onScroll={onScroll ? throttledOnScroll : undefined}
      scrollEventThrottle={16}
      refreshControl={refreshControl as any}
      testID={testID}
      removeClippedSubviews={true}
    >
      {children}
    </ScrollView>
  );
});

OptimizedScrollView.displayName = 'OptimizedScrollView';

// Optimized Loading Component
interface OptimizedLoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  testID?: string;
}

const OptimizedLoading = memo<OptimizedLoadingProps>(({ 
  size = 'large', 
  color = '#007AFF', 
  text, 
  overlay = false,
  testID
}) => {
  const containerStyle = useMemo(() => [
    styles.loadingContainer,
    overlay && styles.loadingOverlay
  ], [overlay]);
  
  return (
    <View style={containerStyle} testID={testID}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <OptimizedText style={styles.loadingText}>
          {text}
        </OptimizedText>
      )}
    </View>
  );
});

OptimizedLoading.displayName = 'OptimizedLoading';

// Styles
const styles = StyleSheet.create({
  // Image styles
  imagePlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageError: {
    backgroundColor: '#FFE6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    textAlign: 'center',
  },
  
  // Button styles
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#8E8E93',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 32,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
  buttonTextOutline: {
    color: '#007AFF',
  },
  buttonTextGhost: {
    color: '#007AFF',
  },
  buttonTextSmall: {
    fontSize: 14,
  },
  buttonTextMedium: {
    fontSize: 16,
  },
  buttonTextLarge: {
    fontSize: 18,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
  
  // Card styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Loading styles
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

// Export all optimized components
export {
  OptimizedText,
  OptimizedImage,
  OptimizedList,
  OptimizedButton,
  OptimizedCard,
  OptimizedScrollView,
  OptimizedLoading,
};
