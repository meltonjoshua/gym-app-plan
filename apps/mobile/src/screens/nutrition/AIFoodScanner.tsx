import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AdvancedNutritionService, { FoodPhotoAnalysis } from '../../services/AdvancedNutritionService';

const { width, height } = Dimensions.get('window');

interface AIFoodScannerProps {
  navigation: any;
}

export default function AIFoodScanner({ navigation }: AIFoodScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState<CameraType>('back');
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodPhotoAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [portion, setPortion] = useState<'small' | 'medium' | 'large'>('medium');

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setSelectedImage(photo.uri);
        analyzeFood(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      analyzeFood(result.assets[0].uri);
    }
  };

  const analyzeFood = async (imageUri: string) => {
    setIsAnalyzing(true);
    try {
      const nutritionService = AdvancedNutritionService.getInstance();
      const result = await nutritionService.analyzeFoodPhoto(imageUri);
      
      // Adjust nutrition based on portion size
      const portionMultiplier = {
        small: 0.75,
        medium: 1.0,
        large: 1.25,
      }[portion];

      const adjustedResult: FoodPhotoAnalysis = {
        ...result,
        estimatedNutrition: {
          calories: Math.round(result.estimatedNutrition.calories * portionMultiplier),
          protein: Math.round(result.estimatedNutrition.protein * portionMultiplier),
          carbs: Math.round(result.estimatedNutrition.carbs * portionMultiplier),
          fat: Math.round(result.estimatedNutrition.fat * portionMultiplier),
          fiber: Math.round((result.estimatedNutrition.fiber || 0) * portionMultiplier),
          sugar: Math.round((result.estimatedNutrition.sugar || 0) * portionMultiplier),
          sodium: Math.round((result.estimatedNutrition.sodium || 0) * portionMultiplier),
          vitamins: result.estimatedNutrition.vitamins || {},
          minerals: result.estimatedNutrition.minerals || {},
        },
      };

      setAnalysis(adjustedResult);
      setShowResults(true);
    } catch (error) {
      console.error('Error analyzing food:', error);
      Alert.alert('Error', 'Failed to analyze food. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToFoodLog = () => {
    if (analysis) {
      // In a real app, this would add to the user's food log
      Alert.alert(
        'Added to Food Log',
        `${analysis.detectedFoods[0]?.name} has been added to your nutrition log.`,
        [
          {
            text: 'View Log',
            onPress: () => navigation.navigate('NutritionLog'),
          },
          { text: 'OK' },
        ]
      );
      navigation.goBack();
    }
  };

  const retakePhoto = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setShowResults(false);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.noPermissionContainer}>
          <Ionicons name="camera" size={64} color="#d1d5db" />
          <Text style={styles.noPermissionText}>Camera access is required</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={requestPermission}
          >
            <Text style={styles.settingsButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showResults && analysis) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Food Analysis</Text>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={retakePhoto}
          >
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.resultsContainer}>
          {/* Photo */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage || '' }} style={styles.capturedImage} />
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {(analysis.confidence * 100).toFixed(0)}% match
              </Text>
            </View>
          </View>

          {/* Detection Results */}
          <View style={styles.detectionCard}>
            <Text style={styles.detectedTitle}>Detected Food</Text>
            <Text style={styles.detectedFood}>
              {analysis.detectedFoods[0]?.name || 'Unknown Food'}
            </Text>
          </View>

          {/* Portion Size Selector */}
          <View style={styles.portionCard}>
            <Text style={styles.sectionTitle}>Portion Size</Text>
            <View style={styles.portionOptions}>
              {[
                { key: 'small', label: 'Small', description: '25% less' },
                { key: 'medium', label: 'Medium', description: 'Standard' },
                { key: 'large', label: 'Large', description: '25% more' },
              ].map((size) => (
                <TouchableOpacity
                  key={size.key}
                  style={[
                    styles.portionOption,
                    portion === size.key && styles.portionOptionSelected
                  ]}
                  onPress={() => {
                    setPortion(size.key as any);
                    if (selectedImage) {
                      analyzeFood(selectedImage);
                    }
                  }}
                >
                  <Text style={[
                    styles.portionLabel,
                    portion === size.key && styles.portionLabelSelected
                  ]}>
                    {size.label}
                  </Text>
                  <Text style={[
                    styles.portionDescription,
                    portion === size.key && styles.portionDescriptionSelected
                  ]}>
                    {size.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nutrition Information */}
          <View style={styles.nutritionCard}>
            <Text style={styles.sectionTitle}>Estimated Nutrition</Text>
            
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <View style={[styles.nutritionIcon, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="flame" size={20} color="#dc2626" />
                </View>
                <Text style={styles.nutritionValue}>
                  {analysis.estimatedNutrition.calories}
                </Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>

              <View style={styles.nutritionItem}>
                <View style={[styles.nutritionIcon, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="barbell" size={20} color="#d97706" />
                </View>
                <Text style={styles.nutritionValue}>
                  {analysis.estimatedNutrition.protein}g
                </Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>

              <View style={styles.nutritionItem}>
                <View style={[styles.nutritionIcon, { backgroundColor: '#fef3c7' }]}>
                  <Ionicons name="nutrition" size={20} color="#f59e0b" />
                </View>
                <Text style={styles.nutritionValue}>
                  {analysis.estimatedNutrition.carbs}g
                </Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>

              <View style={styles.nutritionItem}>
                <View style={[styles.nutritionIcon, { backgroundColor: '#d1fae5' }]}>
                  <Ionicons name="water" size={20} color="#10b981" />
                </View>
                <Text style={styles.nutritionValue}>
                  {analysis.estimatedNutrition.fat}g
                </Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>

            {/* Additional nutrients if available */}
            {(analysis.estimatedNutrition.fiber || analysis.estimatedNutrition.sugar || analysis.estimatedNutrition.sodium) && (
              <View style={styles.additionalNutrients}>
                {analysis.estimatedNutrition.fiber && (
                  <View style={styles.nutrientRow}>
                    <Text style={styles.nutrientName}>Fiber</Text>
                    <Text style={styles.nutrientValue}>{analysis.estimatedNutrition.fiber}g</Text>
                  </View>
                )}
                {analysis.estimatedNutrition.sugar && (
                  <View style={styles.nutrientRow}>
                    <Text style={styles.nutrientName}>Sugar</Text>
                    <Text style={styles.nutrientValue}>{analysis.estimatedNutrition.sugar}g</Text>
                  </View>
                )}
                {analysis.estimatedNutrition.sodium && (
                  <View style={styles.nutrientRow}>
                    <Text style={styles.nutrientName}>Sodium</Text>
                    <Text style={styles.nutrientValue}>{analysis.estimatedNutrition.sodium}mg</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* AI Insights */}
          {analysis.suggestions.length > 0 && (
            <View style={styles.insightsCard}>
              <Text style={styles.sectionTitle}>AI Insights</Text>
              {analysis.suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <View style={[
                    styles.suggestionIcon,
                    { backgroundColor: suggestion.type === 'warning' ? '#fef3c7' : '#d1fae5' }
                  ]}>
                    <Ionicons 
                      name={suggestion.type === 'warning' ? 'warning' : 'bulb'} 
                      size={16} 
                      color={suggestion.type === 'warning' ? '#d97706' : '#10b981'} 
                    />
                  </View>
                  <Text style={styles.suggestionText}>{suggestion.message}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Accuracy Disclaimer */}
          <View style={styles.disclaimerCard}>
            <Ionicons name="information-circle" size={20} color="#6b7280" />
            <Text style={styles.disclaimerText}>
              Nutrition estimates are based on AI analysis and may vary from actual values. 
              For precise tracking, verify with packaging information.
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.retakeActionButton}
            onPress={retakePhoto}
          >
            <Ionicons name="camera" size={20} color="#6b7280" />
            <Text style={styles.retakeActionText}>Retake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={addToFoodLog}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add to Log</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Food Scanner</Text>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={pickImage}
        >
          <Ionicons name="images" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        {selectedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.analyzingText}>Analyzing food...</Text>
              </View>
            )}
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            facing={type}
            ref={(ref: any) => setCameraRef(ref)}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.instructionText}>
                Position food in the frame and tap to capture
              </Text>
            </View>
          </CameraView>
        )}
      </View>

      {/* Camera Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={() => {
            setType(type === 'back' ? 'front' : 'back');
          }}
        >
          <Ionicons name="camera-reverse" size={24} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePicture}
          disabled={isAnalyzing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.galleryControlButton}
          onPress={pickImage}
        >
          <Ionicons name="images" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips for better results:</Text>
        <Text style={styles.tipText}>• Ensure good lighting</Text>
        <Text style={styles.tipText}>• Center the food in frame</Text>
        <Text style={styles.tipText}>• Use a contrasting background</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  galleryButton: {
    padding: 8,
  },
  retakeButton: {
    padding: 8,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#10b981',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
    backgroundColor: '#000',
  },
  flipButton: {
    padding: 16,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#10b981',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
  },
  galleryControlButton: {
    padding: 16,
  },
  tipsContainer: {
    backgroundColor: '#1f2937',
    padding: 20,
  },
  tipsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipText: {
    color: '#d1d5db',
    fontSize: 14,
    marginBottom: 4,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  confidenceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detectionCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detectedTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  detectedFood: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  alternatives: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  portionCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  portionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  portionOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  portionOptionSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  portionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  portionLabelSelected: {
    color: '#10b981',
  },
  portionDescription: {
    fontSize: 12,
    color: '#9ca3af',
  },
  portionDescriptionSelected: {
    color: '#059669',
  },
  nutritionCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  nutritionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  additionalNutrients: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    marginTop: 16,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutrientName: {
    fontSize: 14,
    color: '#6b7280',
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  insightsCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: '#f9fafb',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  retakeActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  retakeActionText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
    marginLeft: 8,
  },
  addButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  addButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noPermissionText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 20,
  },
  settingsButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
