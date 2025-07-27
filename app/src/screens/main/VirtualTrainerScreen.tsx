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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  startChat,
  sendMessage,
  startWorkoutCoaching,
  endWorkoutCoaching,
  addFormAnalysis,
  addWorkoutGuidance,
} from '../../store/slices/virtualTrainerSlice';
import { TrainerMessage, FormAnalysis } from '../../types';

const { width, height } = Dimensions.get('window');

const VirtualTrainerScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { aiTrainer, chats, currentSession, formAnalyses } = useSelector((state: RootState) => state.virtualTrainer);
  const { currentUser } = useSelector((state: RootState) => state.user);
  
  const [activeTab, setActiveTab] = useState<'chat' | 'coaching' | 'analysis'>('chat');
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const chatScrollRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedChatId && chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chats, selectedChatId]);

  const handleStartChat = () => {
    if (currentUser) {
      dispatch(startChat({ userId: currentUser.id }));
      if (chats.length === 0) {
        setSelectedChatId(`chat_${Date.now()}`);
      }
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChatId && currentUser) {
      dispatch(sendMessage({
        chatId: selectedChatId,
        senderId: currentUser.id,
        senderType: 'user',
        message: newMessage.trim(),
      }));
      setNewMessage('');
    }
  };

  const handleStartCoaching = () => {
    if (currentUser) {
      const sessionId = `workout_session_${Date.now()}`;
      dispatch(startWorkoutCoaching({
        workoutSessionId: sessionId,
        workoutName: 'Upper Body Strength',
      }));
      setActiveTab('coaching');
      Alert.alert('Coaching Started', 'AI Coach Max is now monitoring your workout!');
    }
  };

  const handleEndCoaching = () => {
    dispatch(endWorkoutCoaching());
    Alert.alert('Workout Complete', 'Great job! Your workout has been analyzed and saved.');
  };

  const simulateFormAnalysis = () => {
    const analysis: FormAnalysis = {
      exerciseId: 'bench_press',
      analysisTimestamp: new Date(),
      overallScore: Math.floor(Math.random() * 20) + 80, // 80-100
      feedback: [
        {
          aspect: 'posture',
          score: 85,
          feedback: 'Good back arch and shoulder blade retraction',
          correctionSuggestion: 'Keep your core slightly more engaged throughout the lift',
        },
        {
          aspect: 'range_of_motion',
          score: 92,
          feedback: 'Excellent full range of motion',
          correctionSuggestion: 'Maintain this consistent depth on all reps',
        },
        {
          aspect: 'timing',
          score: 88,
          feedback: 'Good control on the eccentric phase',
          correctionSuggestion: 'Try a slightly faster concentric phase for power development',
        },
      ],
      suggestions: [
        'Maintain consistent grip width throughout all sets',
        'Focus on driving through your heels',
        'Consider increasing weight by 5-10lbs next session',
      ],
      riskLevel: 'low',
    };

    dispatch(addFormAnalysis(analysis));
    setActiveTab('analysis');
  };

  const renderMessage = ({ item, index }: { item: TrainerMessage; index: number }) => {
    const isUser = item.senderType === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
        <View style={styles.messageHeader}>
          <Image 
            source={{ uri: isUser ? (currentUser?.profilePhoto || 'https://via.placeholder.com/40') : (aiTrainer?.profilePhoto || 'https://via.placeholder.com/40') }}
            style={styles.messageAvatar}
          />
          <Text style={styles.messageSender}>
            {isUser ? 'You' : aiTrainer?.name}
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
    const selectedChat = selectedChatId ? chats.find(c => c.id === selectedChatId) : null;

    return (
      <View style={styles.chatContainer}>
        {!selectedChat ? (
          <View style={styles.emptyChatContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
            <Text style={styles.emptyChatText}>Start a conversation with your AI trainer</Text>
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
                placeholder="Type your message..."
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
                  color={newMessage.trim() ? '#007AFF' : '#ccc'} 
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderCoachingTab = () => (
    <View style={styles.coachingContainer}>
      {!currentSession ? (
        <View style={styles.noSessionContainer}>
          <Ionicons name="fitness-outline" size={80} color="#ccc" />
          <Text style={styles.noSessionText}>No active workout session</Text>
          <TouchableOpacity style={styles.startCoachingButton} onPress={handleStartCoaching}>
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.startCoachingButtonText}>Start AI Coaching</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.activeSessionContainer}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>Live Coaching Session</Text>
            <TouchableOpacity style={styles.endSessionButton} onPress={handleEndCoaching}>
              <Text style={styles.endSessionButtonText}>End Session</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.coachingCard}>
            <Text style={styles.coachingCardTitle}>💪 Real-time Guidance</Text>
            {currentSession.realTimeGuidance.length > 0 ? (
              currentSession.realTimeGuidance.slice(-3).map((guidance, index) => (
                <Text key={index} style={styles.guidanceText}>
                  • {guidance.message}
                </Text>
              ))
            ) : (
              <Text style={styles.guidanceText}>Monitoring your form and providing feedback...</Text>
            )}
          </View>

          <View style={styles.coachingCard}>
            <Text style={styles.coachingCardTitle}>🎯 Form Analysis</Text>
            <TouchableOpacity style={styles.analyzeFormButton} onPress={simulateFormAnalysis}>
              <Text style={styles.analyzeFormButtonText}>Analyze Current Exercise</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.motivationCard}>
            <Text style={styles.motivationTitle}>Motivation</Text>
            <Text style={styles.motivationText}>
              {currentSession.motivationalMessages[Math.floor(Math.random() * currentSession.motivationalMessages.length)]}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderAnalysisTab = () => (
    <View style={styles.analysisContainer}>
      <Text style={styles.analysisTitle}>Form Analysis History</Text>
      {formAnalyses.length === 0 ? (
        <View style={styles.emptyAnalysisContainer}>
          <Ionicons name="analytics-outline" size={80} color="#ccc" />
          <Text style={styles.emptyAnalysisText}>No form analyses yet</Text>
          <Text style={styles.emptyAnalysisSubtext}>Start a coaching session to get real-time form feedback</Text>
        </View>
      ) : (
        <ScrollView style={styles.analysesList}>
          {formAnalyses.map((analysis, index) => (
            <View key={index} style={styles.analysisCard}>
              <View style={styles.analysisHeader}>
                <Text style={styles.analysisExercise}>Exercise: Bench Press</Text>
                <Text style={styles.analysisDate}>
                  {new Date(analysis.analysisTimestamp).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.overallScoreContainer}>
                <Text style={styles.overallScoreLabel}>Overall Score</Text>
                <Text style={[
                  styles.overallScore,
                  { color: analysis.overallScore >= 90 ? '#4CAF50' : analysis.overallScore >= 80 ? '#FF9800' : '#F44336' }
                ]}>
                  {analysis.overallScore}/100
                </Text>
              </View>

              <View style={styles.feedbackContainer}>
                {analysis.feedback.map((feedback, fbIndex) => (
                  <View key={fbIndex} style={styles.feedbackItem}>
                    <Text style={styles.feedbackAspect}>{feedback.aspect.replace('_', ' ').toUpperCase()}</Text>
                    <Text style={styles.feedbackScore}>{feedback.score}/100</Text>
                    <Text style={styles.feedbackText}>{feedback.feedback}</Text>
                  </View>
                ))}
              </View>

              {analysis.suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>💡 Suggestions</Text>
                  {analysis.suggestions.map((suggestion, sgIndex) => (
                    <Text key={sgIndex} style={styles.suggestionText}>• {suggestion}</Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (!aiTrainer) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading AI Trainer...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Image source={{ uri: aiTrainer.profilePhoto }} style={styles.trainerAvatar} />
          <View style={styles.trainerInfo}>
            <Text style={styles.trainerName}>{aiTrainer.name}</Text>
            <Text style={styles.trainerBio}>{aiTrainer.bio}</Text>
            <View style={styles.trainerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{aiTrainer.clientCount.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Clients</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{aiTrainer.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
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
            color={activeTab === 'chat' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'coaching' && styles.activeTab]}
          onPress={() => setActiveTab('coaching')}
        >
          <Ionicons 
            name="fitness" 
            size={24} 
            color={activeTab === 'coaching' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'coaching' && styles.activeTabText]}>Coaching</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analysis' && styles.activeTab]}
          onPress={() => setActiveTab('analysis')}
        >
          <Ionicons 
            name="analytics" 
            size={24} 
            color={activeTab === 'analysis' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'analysis' && styles.activeTabText]}>Analysis</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'coaching' && renderCoachingTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
      </View>
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
  trainerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#fff',
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  trainerBio: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 10,
  },
  trainerStats: {
    flexDirection: 'row',
  },
  statItem: {
    marginRight: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
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
    borderBottomColor: '#007AFF',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
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
  coachingContainer: {
    flex: 1,
    padding: 20,
  },
  noSessionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSessionText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  startCoachingButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startCoachingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeSessionContainer: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  endSessionButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  endSessionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  coachingCard: {
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
  coachingCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  guidanceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  analyzeFormButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyzeFormButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  motivationCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  motivationText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
  analysisContainer: {
    flex: 1,
    padding: 20,
  },
  analysisTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
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
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  analysisExercise: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  analysisDate: {
    fontSize: 14,
    color: '#666',
  },
  overallScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  overallScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  overallScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginBottom: 15,
  },
  feedbackItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  feedbackAspect: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  feedbackScore: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  suggestionsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 5,
  },
});

export default VirtualTrainerScreen;