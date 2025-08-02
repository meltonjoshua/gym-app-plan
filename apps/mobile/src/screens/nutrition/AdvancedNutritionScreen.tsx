import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Dimensions,
  FlatList,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  startNutritionChat,
  sendNutritionMessage,
  createMealPlan,
  activateMealPlan,
  addFoodAnalysis,
  generateGroceryList,
} from '../../store/slices/advancedNutritionSlice';
import { NutritionMessage, SmartMealPlan, Recipe } from '../../types';

const { width, height } = Dimensions.get('window');

const AdvancedNutritionScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { aiNutritionist, mealPlans, nutritionChats, foodAnalyses, recipes } = useSelector((state: RootState) => state.advancedNutrition);
  const { currentUser } = useSelector((state: RootState) => state.user);
  
  const [activeTab, setActiveTab] = useState<'chat' | 'meals' | 'recipes' | 'analysis'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const chatScrollRef = useRef<FlatList>(null);

  const [mealPlanForm, setMealPlanForm] = useState({
    name: '',
    duration: 7,
    goals: [{ type: 'calories', targetValue: 2000, unit: 'kcal' }],
    restrictions: [],
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedChatId && chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [nutritionChats, selectedChatId]);

  const handleStartChat = () => {
    if (currentUser) {
      dispatch(startNutritionChat({ userId: currentUser.id }));
      if (nutritionChats.length === 0) {
        setSelectedChatId(`nutrition_chat_${Date.now()}`);
      }
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChatId && currentUser) {
      dispatch(sendNutritionMessage({
        chatId: selectedChatId,
        senderId: currentUser.id,
        senderType: 'user',
        message: newMessage.trim(),
      }));
      setNewMessage('');
    }
  };

  const handleCreateMealPlan = () => {
    if (!currentUser || !mealPlanForm.name.trim()) {
      Alert.alert('Error', 'Please enter a meal plan name');
      return;
    }

    dispatch(createMealPlan({
      userId: currentUser.id,
      name: mealPlanForm.name,
      duration: mealPlanForm.duration,
      goals: mealPlanForm.goals,
      restrictions: mealPlanForm.restrictions,
    }));

    setShowMealPlanModal(false);
    setMealPlanForm({
      name: '',
      duration: 7,
      goals: [{ type: 'calories', targetValue: 2000, unit: 'kcal' }],
      restrictions: [],
    });
    
    Alert.alert('Success', 'Your personalized meal plan has been created!');
  };

  const simulateFoodAnalysis = () => {
    const sampleAnalysis = {
      imageUrl: 'https://via.placeholder.com/300x200',
      analysisDate: new Date(),
      identifiedFoods: [
        {
          name: 'Grilled Chicken Breast',
          confidence: 0.92,
          estimatedQuantity: 150,
          unit: 'grams',
          nutritionPer100g: {
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            fiber: 0,
            sugar: 0,
            sodium: 74,
          },
        },
        {
          name: 'Steamed Broccoli',
          confidence: 0.88,
          estimatedQuantity: 100,
          unit: 'grams',
          nutritionPer100g: {
            calories: 34,
            protein: 2.8,
            carbs: 7,
            fat: 0.4,
            fiber: 2.6,
            sugar: 1.5,
            sodium: 33,
          },
        }
      ],
      confidence: 0.90,
      nutritionEstimate: {
        calories: 282,
        protein: 49.3,
        carbs: 7,
        fat: 5.8,
        fiber: 2.6,
        sugar: 1.5,
        sodium: 144,
      },
      suggestions: [
        'Great protein choice! Consider adding a complex carb like quinoa for balanced macros.',
        'Excellent vegetable choice. Broccoli is rich in vitamin C and fiber.',
        'This meal is well-balanced for muscle building goals.',
      ],
    };

    dispatch(addFoodAnalysis(sampleAnalysis));
    setActiveTab('analysis');
  };

  const renderMessage = ({ item, index }: { item: NutritionMessage; index: number }) => {
    const isUser = item.senderType === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
        <View style={styles.messageHeader}>
          <Image 
            source={{ uri: isUser ? (currentUser?.profilePhoto || 'https://via.placeholder.com/40') : (aiNutritionist?.profilePhoto || 'https://via.placeholder.com/40') }}
            style={styles.messageAvatar}
          />
          <Text style={styles.messageSender}>
            {isUser ? 'You' : aiNutritionist?.name}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
          {item.message}
        </Text>
      </View>
    );
  };

  const renderChatTab = () => {
    const selectedChat = selectedChatId ? nutritionChats.find(c => c.id === selectedChatId) : null;

    return (
      <View style={styles.chatContainer}>
        {!selectedChat ? (
          <View style={styles.emptyChatContainer}>
            <Ionicons name="nutrition-outline" size={80} color="#ccc" />
            <Text style={styles.emptyChatText}>Start a conversation with your AI nutritionist</Text>
            <TouchableOpacity style={styles.startChatButton} onPress={handleStartChat}>
              <Text style={styles.startChatButtonText}>Start Chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              ref={chatScrollRef}
              data={selectedChat.messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              style={styles.messagesList}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Ask about nutrition, meal plans, or diet advice..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={24} 
                  color={newMessage.trim() ? '#4CAF50' : '#ccc'} 
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderMealsTab = () => (
    <View style={styles.mealsContainer}>
      <View style={styles.mealsHeader}>
        <Text style={styles.mealsTitle}>Meal Plans</Text>
        <TouchableOpacity 
          style={styles.createPlanButton}
          onPress={() => setShowMealPlanModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.createPlanButtonText}>Create Plan</Text>
        </TouchableOpacity>
      </View>

      {mealPlans.length === 0 ? (
        <View style={styles.emptyMealsContainer}>
          <Ionicons name="restaurant-outline" size={80} color="#ccc" />
          <Text style={styles.emptyMealsText}>No meal plans yet</Text>
          <Text style={styles.emptyMealsSubtext}>Create personalized meal plans with AI assistance</Text>
        </View>
      ) : (
        <ScrollView style={styles.mealPlansList}>
          {mealPlans.map((plan, index) => (
            <View key={index} style={[styles.mealPlanCard, plan.isActive && styles.activeMealPlan]}>
              <View style={styles.mealPlanHeader}>
                <Text style={styles.mealPlanName}>{plan.name}</Text>
                {plan.isActive && (
                  <View style={styles.activeLabel}>
                    <Text style={styles.activeLabelText}>Active</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.mealPlanDuration}>{plan.duration} days</Text>
              
              <View style={styles.mealPlanGoals}>
                {plan.goals.slice(0, 3).map((goal, goalIndex) => (
                  <View key={goalIndex} style={styles.goalTag}>
                    <Text style={styles.goalTagText}>
                      {goal.targetValue} {goal.unit} {goal.type}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.mealPlanActions}>
                <TouchableOpacity 
                  style={styles.activateButton}
                  onPress={() => dispatch(activateMealPlan({ mealPlanId: plan.id }))}
                  disabled={plan.isActive}
                >
                  <Text style={[styles.activateButtonText, plan.isActive && styles.disabledText]}>
                    {plan.isActive ? 'Active' : 'Activate'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.groceryButton}
                  onPress={() => dispatch(generateGroceryList({ mealPlanId: plan.id }))}
                >
                  <Ionicons name="basket" size={16} color="#4CAF50" />
                  <Text style={styles.groceryButtonText}>Grocery List</Text>
                </TouchableOpacity>
              </View>

              {plan.estimatedCost > 0 && (
                <Text style={styles.estimatedCost}>
                  Estimated weekly cost: ${plan.estimatedCost.toFixed(2)}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderRecipesTab = () => (
    <View style={styles.recipesContainer}>
      <Text style={styles.recipesTitle}>Smart Recipes</Text>
      <ScrollView style={styles.recipesList}>
        {recipes.map((recipe, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.recipeCard}
            onPress={() => {
              setSelectedRecipe(recipe);
              setShowRecipeModal(true);
            }}
          >
            <Image source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/100x80' }} style={styles.recipeImage} />
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeName}>{recipe.name}</Text>
              <Text style={styles.recipeDescription} numberOfLines={2}>
                {recipe.description}
              </Text>
              <View style={styles.recipeStats}>
                <View style={styles.recipeStat}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.recipeStatText}>
                    {(recipe.servings * 15)} min
                  </Text>
                </View>
                <View style={styles.recipeStat}>
                  <Ionicons name="flame-outline" size={14} color="#666" />
                  <Text style={styles.recipeStatText}>
                    {recipe.nutritionPer100g.calories} cal
                  </Text>
                </View>
                <View style={styles.recipeStat}>
                  <Text style={styles.difficultyBadge}>
                    {recipe.difficulty}
                  </Text>
                </View>
              </View>
              <View style={styles.recipeTags}>
                {recipe.dietaryTags.slice(0, 2).map((tag, tagIndex) => (
                  <View key={tagIndex} style={styles.recipeTag}>
                    <Text style={styles.recipeTagText}>{tag.replace('_', ' ')}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAnalysisTab = () => (
    <View style={styles.analysisContainer}>
      <View style={styles.analysisHeader}>
        <Text style={styles.analysisTitle}>Food Analysis</Text>
        <TouchableOpacity 
          style={styles.analyzeButton}
          onPress={simulateFoodAnalysis}
        >
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.analyzeButtonText}>Analyze Meal</Text>
        </TouchableOpacity>
      </View>

      {foodAnalyses.length === 0 ? (
        <View style={styles.emptyAnalysisContainer}>
          <Ionicons name="camera-outline" size={80} color="#ccc" />
          <Text style={styles.emptyAnalysisText}>No food analyses yet</Text>
          <Text style={styles.emptyAnalysisSubtext}>Take photos of your meals for instant nutrition analysis</Text>
        </View>
      ) : (
        <ScrollView style={styles.analysesList}>
          {foodAnalyses.map((analysis, index) => (
            <View key={index} style={styles.analysisCard}>
              <Image source={{ uri: analysis.imageUrl }} style={styles.analysisImage} />
              <View style={styles.analysisContent}>
                <View style={styles.analysisHeader}>
                  <Text style={styles.analysisDate}>
                    {new Date(analysis.analysisDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.confidenceScore}>
                    {Math.round(analysis.confidence * 100)}% confidence
                  </Text>
                </View>

                <View style={styles.identifiedFoods}>
                  <Text style={styles.identifiedFoodsTitle}>Identified Foods:</Text>
                  {analysis.identifiedFoods.map((food, foodIndex) => (
                    <Text key={foodIndex} style={styles.identifiedFood}>
                      • {food.name} ({food.estimatedQuantity}{food.unit}) - {Math.round(food.confidence * 100)}%
                    </Text>
                  ))}
                </View>

                <View style={styles.nutritionSummary}>
                  <Text style={styles.nutritionTitle}>Nutrition Summary:</Text>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{analysis.nutritionEstimate.calories}</Text>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{analysis.nutritionEstimate.protein}g</Text>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{analysis.nutritionEstimate.carbs}g</Text>
                      <Text style={styles.nutritionLabel}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{analysis.nutritionEstimate.fat}g</Text>
                      <Text style={styles.nutritionLabel}>Fat</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.suggestions}>
                  <Text style={styles.suggestionsTitle}>💡 AI Suggestions:</Text>
                  {analysis.suggestions.map((suggestion, sgIndex) => (
                    <Text key={sgIndex} style={styles.suggestionText}>• {suggestion}</Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderMealPlanModal = () => (
    <Modal visible={showMealPlanModal} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create Meal Plan</Text>
          <TouchableOpacity onPress={() => setShowMealPlanModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Plan Name</Text>
            <TextInput
              style={styles.formInput}
              value={mealPlanForm.name}
              onChangeText={(text) => setMealPlanForm(prev => ({ ...prev, name: text }))}
              placeholder="e.g., Muscle Building Plan"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Duration (days)</Text>
            <View style={styles.durationOptions}>
              {[7, 14, 30].map(days => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.durationOption,
                    mealPlanForm.duration === days && styles.durationOptionActive
                  ]}
                  onPress={() => setMealPlanForm(prev => ({ ...prev, duration: days }))}
                >
                  <Text style={[
                    styles.durationOptionText,
                    mealPlanForm.duration === days && styles.durationOptionTextActive
                  ]}>
                    {days} days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Daily Calorie Goal</Text>
            <TextInput
              style={styles.formInput}
              value={mealPlanForm.goals[0].targetValue.toString()}
              onChangeText={(text) => {
                const value = parseInt(text) || 0;
                setMealPlanForm(prev => ({
                  ...prev,
                  goals: [{ ...prev.goals[0], targetValue: value }]
                }));
              }}
              placeholder="2000"
              keyboardType="numeric"
            />
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateMealPlan}>
            <Text style={styles.createButtonText}>Create Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderRecipeModal = () => (
    <Modal visible={showRecipeModal} animationType="slide">
      <View style={styles.recipeModalContainer}>
        <View style={styles.recipeModalHeader}>
          <TouchableOpacity onPress={() => setShowRecipeModal(false)}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.recipeModalTitle}>{selectedRecipe?.name}</Text>
          <View />
        </View>

        {selectedRecipe && (
          <ScrollView style={styles.recipeModalContent}>
            <Image 
              source={{ uri: selectedRecipe.imageUrl || 'https://via.placeholder.com/300x200' }} 
              style={styles.recipeModalImage} 
            />
            
            <View style={styles.recipeModalInfo}>
              <Text style={styles.recipeModalDescription}>{selectedRecipe.description}</Text>
              
              <View style={styles.recipeModalStats}>
                <View style={styles.recipeModalStat}>
                  <Ionicons name="people" size={20} color="#666" />
                  <Text style={styles.recipeModalStatText}>{selectedRecipe.servings} servings</Text>
                </View>
                <View style={styles.recipeModalStat}>
                  <Ionicons name="flame" size={20} color="#666" />
                  <Text style={styles.recipeModalStatText}>{selectedRecipe.nutritionPer100g.calories} cal</Text>
                </View>
              </View>

              <View style={styles.recipeSection}>
                <Text style={styles.recipeSectionTitle}>Ingredients</Text>
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <Text key={index} style={styles.ingredientText}>
                    • {ingredient.quantity} {ingredient.unit} {ingredient.foodId.replace('_', ' ')}
                  </Text>
                ))}
              </View>

              <View style={styles.recipeSection}>
                <Text style={styles.recipeSectionTitle}>Instructions</Text>
                {selectedRecipe.instructions.map((instruction, index) => (
                  <Text key={index} style={styles.instructionText}>
                    {index + 1}. {instruction}
                  </Text>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  if (!aiNutritionist) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading AI Nutritionist...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Image source={{ uri: aiNutritionist.profilePhoto }} style={styles.nutritionistAvatar} />
          <View style={styles.nutritionistInfo}>
            <Text style={styles.nutritionistName}>{aiNutritionist.name}</Text>
            <Text style={styles.nutritionistBio}>{aiNutritionist.bio}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Ionicons 
            name="chatbubbles" 
            size={24} 
            color={activeTab === 'chat' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'meals' && styles.activeTab]}
          onPress={() => setActiveTab('meals')}
        >
          <Ionicons 
            name="restaurant" 
            size={24} 
            color={activeTab === 'meals' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'meals' && styles.activeTabText]}>Meals</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
          onPress={() => setActiveTab('recipes')}
        >
          <Ionicons 
            name="book" 
            size={24} 
            color={activeTab === 'recipes' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>Recipes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analysis' && styles.activeTab]}
          onPress={() => setActiveTab('analysis')}
        >
          <Ionicons 
            name="camera" 
            size={24} 
            color={activeTab === 'analysis' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'analysis' && styles.activeTabText]}>Analysis</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'meals' && renderMealsTab()}
        {activeTab === 'recipes' && renderRecipesTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
      </View>

      {renderMealPlanModal()}
      {renderRecipeModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionistAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  nutritionistInfo: {
    flex: 1,
  },
  nutritionistName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  nutritionistBio: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  emptyChatContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyChatText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  startChatButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messageContainer: {
    marginVertical: 8,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: width * 0.8,
  },
  userMessageText: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  aiMessageText: {
    backgroundColor: '#fff',
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
  mealsContainer: {
    flex: 1,
    padding: 20,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mealsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  createPlanButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createPlanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  emptyMealsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMealsText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
  emptyMealsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
  mealPlansList: {
    flex: 1,
  },
  mealPlanCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeMealPlan: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  mealPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealPlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  activeLabel: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mealPlanDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  mealPlanGoals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  goalTag: {
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  goalTagText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  mealPlanActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activateButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  activateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledText: {
    color: '#ccc',
  },
  groceryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groceryButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 5,
  },
  estimatedCost: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  recipesContainer: {
    flex: 1,
    padding: 20,
  },
  recipesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  recipesList: {
    flex: 1,
  },
  recipeCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  recipeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  recipeStatText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  difficultyBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recipeTag: {
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 5,
  },
  recipeTagText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
  },
  analysisContainer: {
    flex: 1,
    padding: 20,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  emptyAnalysisContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAnalysisText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
  emptyAnalysisSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
  analysesList: {
    flex: 1,
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  analysisContent: {
    padding: 20,
  },
  analysisDate: {
    fontSize: 14,
    color: '#666',
  },
  confidenceScore: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  identifiedFoods: {
    marginVertical: 15,
  },
  identifiedFoodsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  identifiedFood: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  nutritionSummary: {
    marginBottom: 15,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  suggestions: {
    backgroundColor: '#f0f8f0',
    padding: 15,
    borderRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginVertical: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  durationOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  durationOptionActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  durationOptionText: {
    color: '#666',
  },
  durationOptionTextActive: {
    color: '#fff',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  recipeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  recipeModalContent: {
    flex: 1,
  },
  recipeModalImage: {
    width: '100%',
    height: 250,
  },
  recipeModalInfo: {
    padding: 20,
  },
  recipeModalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  recipeModalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  recipeModalStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeModalStatText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  recipeSection: {
    marginBottom: 20,
  },
  recipeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  ingredientText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 3,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default AdvancedNutritionScreen;