import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VirtualTrainerState, AITrainer, TrainerChat, TrainerMessage, FormAnalysis, WorkoutCoaching } from '../../types';

const initialState: VirtualTrainerState = {
  aiTrainer: {
    id: 'ai_trainer_max',
    name: 'Coach Max',
    personality: 'motivational',
    specialties: ['strength', 'muscle_building', 'weight_loss'],
    certifications: ['AI Fitness Coach Level 5', 'Advanced Movement Analysis', 'Personalized Training Systems'],
    profilePhoto: 'https://via.placeholder.com/150',
    bio: 'Your AI-powered personal trainer with advanced movement analysis and personalized coaching. I adapt to your fitness level, goals, and preferences to provide the most effective workouts.',
    experience: 5,
    rating: 4.9,
    clientCount: 10000,
  },
  chats: [],
  currentSession: undefined,
  formAnalyses: [],
  isLoading: false,
  error: undefined,
};

const virtualTrainerSlice = createSlice({
  name: 'virtualTrainer',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
    startChat: (state, action: PayloadAction<{ userId: string }>) => {
      const newChat: TrainerChat = {
        id: `chat_${Date.now()}`,
        userId: action.payload.userId,
        trainerId: state.aiTrainer!.id,
        messages: [
          {
            id: `msg_${Date.now()}`,
            senderId: state.aiTrainer!.id,
            senderType: 'ai_trainer',
            message: `Hi! I'm ${state.aiTrainer!.name}, your AI personal trainer. I'm here to help you achieve your fitness goals with personalized workouts, form analysis, and constant motivation. What would you like to work on today?`,
            messageType: 'text',
            timestamp: new Date(),
          }
        ],
        status: 'active',
        createdAt: new Date(),
        lastMessageAt: new Date(),
      };
      state.chats.unshift(newChat);
    },
    sendMessage: (state, action: PayloadAction<{
      chatId: string;
      senderId: string;
      senderType: 'user' | 'ai_trainer';
      message: string;
      messageType?: 'text' | 'workout_plan' | 'form_feedback' | 'progress_analysis';
    }>) => {
      const chat = state.chats.find(c => c.id === action.payload.chatId);
      if (chat) {
        const newMessage: TrainerMessage = {
          id: `msg_${Date.now()}`,
          senderId: action.payload.senderId,
          senderType: action.payload.senderType,
          message: action.payload.message,
          messageType: action.payload.messageType || 'text',
          timestamp: new Date(),
        };
        chat.messages.push(newMessage);
        chat.lastMessageAt = new Date();

        // Auto-reply from AI trainer for demo purposes
        if (action.payload.senderType === 'user') {
          setTimeout(() => {
            const aiReply = generateAIResponse(action.payload.message);
            const aiMessage: TrainerMessage = {
              id: `msg_${Date.now() + 1}`,
              senderId: state.aiTrainer!.id,
              senderType: 'ai_trainer',
              message: aiReply,
              messageType: 'text',
              timestamp: new Date(),
            };
            chat.messages.push(aiMessage);
            chat.lastMessageAt = new Date();
          }, 1000);
        }
      }
    },
    startWorkoutCoaching: (state, action: PayloadAction<{ 
      workoutSessionId: string; 
      workoutName: string; 
    }>) => {
      state.currentSession = {
        workoutSessionId: action.payload.workoutSessionId,
        trainerId: state.aiTrainer!.id,
        realTimeGuidance: [],
        adaptations: [],
        motivationalMessages: [
          "You've got this! Let's make this workout count!",
          "Perfect form is more important than heavy weight!",
          "Stay focused on your breathing and movement quality!",
          "Great job! I can see your improvement from last session!",
        ],
        progressNotes: `Starting ${action.payload.workoutName} with AI coaching`,
      };
    },
    endWorkoutCoaching: (state) => {
      if (state.currentSession) {
        // Save session notes
        state.currentSession.progressNotes += ` - Session completed with ${state.currentSession.realTimeGuidance.length} guidance points`;
      }
      state.currentSession = undefined;
    },
    addFormAnalysis: (state, action: PayloadAction<FormAnalysis>) => {
      state.formAnalyses.unshift(action.payload);
      // Keep only the latest 20 analyses
      if (state.formAnalyses.length > 20) {
        state.formAnalyses = state.formAnalyses.slice(0, 20);
      }
    },
    addWorkoutGuidance: (state, action: PayloadAction<{
      exerciseId: string;
      setNumber: number;
      guidanceType: 'form_tip' | 'motivation' | 'rest_adjustment' | 'weight_adjustment';
      message: string;
      priority?: 'low' | 'medium' | 'high';
    }>) => {
      if (state.currentSession) {
        state.currentSession.realTimeGuidance.push({
          exerciseId: action.payload.exerciseId,
          setNumber: action.payload.setNumber,
          guidanceType: action.payload.guidanceType,
          message: action.payload.message,
          priority: action.payload.priority || 'medium',
        });
      }
    },
    updateAITrainer: (state, action: PayloadAction<Partial<AITrainer>>) => {
      if (state.aiTrainer) {
        state.aiTrainer = { ...state.aiTrainer, ...action.payload };
      }
    },
  },
});

// Helper function to generate AI responses (simplified for demo)
function generateAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('workout') || message.includes('exercise')) {
    return "Great! I can help you create a personalized workout plan. What are your main fitness goals right now? Are you looking to build muscle, lose weight, improve endurance, or something else?";
  }
  
  if (message.includes('form') || message.includes('technique')) {
    return "Form is crucial for both effectiveness and safety! I can analyze your movement patterns during workouts and provide real-time feedback. Would you like me to focus on any specific exercises?";
  }
  
  if (message.includes('motivation') || message.includes('help')) {
    return "I'm here to support you every step of the way! Remember, consistency is key. Every workout, no matter how small, is progress toward your goals. What's challenging you most right now?";
  }
  
  if (message.includes('goal') || message.includes('target')) {
    return "Setting clear goals is the foundation of success! Let's break down your main objective into smaller, achievable milestones. What's your primary fitness goal for the next 3 months?";
  }
  
  return "I'm here to help you achieve your fitness goals! Whether you need workout plans, form analysis, motivation, or progress tracking, I've got you covered. What would you like to focus on today?";
}

export const {
  setLoading,
  setError,
  clearError,
  startChat,
  sendMessage,
  startWorkoutCoaching,
  endWorkoutCoaching,
  addFormAnalysis,
  addWorkoutGuidance,
  updateAITrainer,
} = virtualTrainerSlice.actions;

export default virtualTrainerSlice.reducer;