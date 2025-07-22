import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrainerMarketplaceState, HumanTrainer, TrainerBooking, TrainerReview, TrainerSpecialty } from '../../types';

// Sample trainer data
const sampleTrainers: HumanTrainer[] = [
  {
    id: 'trainer_sarah_johnson',
    name: 'Sarah Johnson',
    profilePhoto: 'https://via.placeholder.com/150',
    bio: 'Certified personal trainer specializing in strength training and functional fitness. 8+ years helping clients achieve their goals through evidence-based training methods.',
    specialties: ['strength', 'muscle_building', 'weight_loss'],
    certifications: [
      {
        name: 'NASM-CPT',
        organization: 'National Academy of Sports Medicine',
        certificationDate: new Date('2016-03-15'),
        credentialId: 'NASM-CPT-12345',
        isVerified: true,
      },
      {
        name: 'CSCS',
        organization: 'NSCA',
        certificationDate: new Date('2017-06-20'),
        credentialId: 'CSCS-67890',
        isVerified: true,
      }
    ],
    experience: 8,
    rating: 4.8,
    reviewCount: 127,
    hourlyRate: 85,
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      isOnlineOnly: false,
    },
    availability: [
      {
        dayOfWeek: 1,
        timeSlots: [
          { startTime: '06:00', endTime: '08:00' },
          { startTime: '18:00', endTime: '20:00' }
        ],
        timezone: 'PST',
      },
      {
        dayOfWeek: 3,
        timeSlots: [
          { startTime: '06:00', endTime: '08:00' },
          { startTime: '18:00', endTime: '20:00' }
        ],
        timezone: 'PST',
      },
      {
        dayOfWeek: 5,
        timeSlots: [
          { startTime: '06:00', endTime: '08:00' },
          { startTime: '18:00', endTime: '20:00' }
        ],
        timezone: 'PST',
      }
    ],
    languages: ['English', 'Spanish'],
    isVerified: true,
    joinDate: new Date('2020-01-15'),
  },
  {
    id: 'trainer_mike_chen',
    name: 'Mike Chen',
    profilePhoto: 'https://via.placeholder.com/150',
    bio: 'Former Olympic weightlifting coach now helping everyday athletes build strength and confidence. Specializing in powerlifting and Olympic lifting techniques.',
    specialties: ['strength', 'endurance', 'muscle_building'],
    certifications: [
      {
        name: 'USAW Level 2',
        organization: 'USA Weightlifting',
        certificationDate: new Date('2015-08-10'),
        credentialId: 'USAW-L2-54321',
        isVerified: true,
      }
    ],
    experience: 12,
    rating: 4.9,
    reviewCount: 89,
    hourlyRate: 100,
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
      isOnlineOnly: false,
    },
    availability: [
      {
        dayOfWeek: 2,
        timeSlots: [
          { startTime: '07:00', endTime: '09:00' },
          { startTime: '17:00', endTime: '19:00' }
        ],
        timezone: 'EST',
      },
      {
        dayOfWeek: 4,
        timeSlots: [
          { startTime: '07:00', endTime: '09:00' },
          { startTime: '17:00', endTime: '19:00' }
        ],
        timezone: 'EST',
      }
    ],
    languages: ['English', 'Mandarin'],
    isVerified: true,
    joinDate: new Date('2019-05-20'),
  },
  {
    id: 'trainer_emma_wilson',
    name: 'Emma Wilson',
    profilePhoto: 'https://via.placeholder.com/150',
    bio: 'Yoga instructor and flexibility specialist with a focus on rehabilitation and injury prevention. Online sessions available worldwide.',
    specialties: ['flexibility', 'rehabilitation', 'weight_loss'],
    certifications: [
      {
        name: 'RYT 500',
        organization: 'Yoga Alliance',
        certificationDate: new Date('2018-04-12'),
        credentialId: 'RYT500-98765',
        isVerified: true,
      }
    ],
    experience: 6,
    rating: 4.7,
    reviewCount: 156,
    hourlyRate: 65,
    location: {
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      isOnlineOnly: true,
    },
    availability: [
      {
        dayOfWeek: 1,
        timeSlots: [
          { startTime: '08:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '18:00' }
        ],
        timezone: 'CST',
      },
      {
        dayOfWeek: 3,
        timeSlots: [
          { startTime: '08:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '18:00' }
        ],
        timezone: 'CST',
      },
      {
        dayOfWeek: 6,
        timeSlots: [
          { startTime: '09:00', endTime: '13:00' }
        ],
        timezone: 'CST',
      }
    ],
    languages: ['English'],
    isVerified: true,
    joinDate: new Date('2021-02-28'),
  }
];

// Sample reviews
const sampleReviews: TrainerReview[] = [
  {
    id: 'review_1',
    clientId: 'user_123',
    trainerId: 'trainer_sarah_johnson',
    bookingId: 'booking_1',
    rating: 5,
    review: 'Sarah is an amazing trainer! She really knows how to push you while keeping the workouts safe and effective. Highly recommend!',
    reviewDate: new Date('2024-01-15'),
    trainerResponse: 'Thank you so much! It was great working with you and seeing your progress.',
    isVerified: true,
  },
  {
    id: 'review_2',
    clientId: 'user_456',
    trainerId: 'trainer_mike_chen',
    bookingId: 'booking_2',
    rating: 5,
    review: 'Mike helped me perfect my deadlift form and increased my max by 50lbs in 3 months. Incredible knowledge and coaching!',
    reviewDate: new Date('2024-01-10'),
    isVerified: true,
  }
];

const initialState: TrainerMarketplaceState = {
  trainers: sampleTrainers,
  bookings: [],
  reviews: sampleReviews,
  searchFilters: {
    specialties: [],
    maxRate: 150,
    location: undefined,
    availability: undefined,
  },
  isLoading: false,
  error: undefined,
};

const trainerMarketplaceSlice = createSlice({
  name: 'trainerMarketplace',
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
    updateSearchFilters: (state, action: PayloadAction<{
      specialties?: TrainerSpecialty[];
      maxRate?: number;
      location?: string;
      availability?: string;
    }>) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    clearSearchFilters: (state) => {
      state.searchFilters = {
        specialties: [],
        maxRate: 150,
        location: undefined,
        availability: undefined,
      };
    },
    bookTrainerSession: (state, action: PayloadAction<{
      clientId: string;
      trainerId: string;
      sessionDate: Date;
      startTime: string;
      duration: number;
      sessionType: 'consultation' | 'workout' | 'nutrition' | 'assessment';
    }>) => {
      const trainer = state.trainers.find(t => t.id === action.payload.trainerId);
      if (trainer) {
        const newBooking: TrainerBooking = {
          id: `booking_${Date.now()}`,
          clientId: action.payload.clientId,
          trainerId: action.payload.trainerId,
          sessionDate: action.payload.sessionDate,
          startTime: action.payload.startTime,
          duration: action.payload.duration,
          sessionType: action.payload.sessionType,
          status: 'scheduled',
          totalCost: trainer.hourlyRate * (action.payload.duration / 60),
          paymentStatus: 'pending',
          createdAt: new Date(),
        };
        state.bookings.push(newBooking);
      }
    },
    cancelBooking: (state, action: PayloadAction<{ bookingId: string; reason?: string }>) => {
      const booking = state.bookings.find(b => b.id === action.payload.bookingId);
      if (booking) {
        booking.status = 'cancelled';
        booking.notes = action.payload.reason || 'Cancelled by user';
      }
    },
    completeBooking: (state, action: PayloadAction<{ bookingId: string; notes?: string }>) => {
      const booking = state.bookings.find(b => b.id === action.payload.bookingId);
      if (booking) {
        booking.status = 'completed';
        booking.paymentStatus = 'paid';
        if (action.payload.notes) {
          booking.notes = action.payload.notes;
        }
      }
    },
    addTrainerReview: (state, action: PayloadAction<{
      clientId: string;
      trainerId: string;
      bookingId: string;
      rating: number;
      review: string;
    }>) => {
      const newReview: TrainerReview = {
        id: `review_${Date.now()}`,
        clientId: action.payload.clientId,
        trainerId: action.payload.trainerId,
        bookingId: action.payload.bookingId,
        rating: action.payload.rating,
        review: action.payload.review,
        reviewDate: new Date(),
        isVerified: true,
      };
      state.reviews.push(newReview);

      // Update trainer's rating and review count
      const trainer = state.trainers.find(t => t.id === action.payload.trainerId);
      if (trainer) {
        const trainerReviews = state.reviews.filter(r => r.trainerId === action.payload.trainerId);
        const totalRating = trainerReviews.reduce((sum, r) => sum + r.rating, 0);
        trainer.rating = Math.round((totalRating / trainerReviews.length) * 10) / 10;
        trainer.reviewCount = trainerReviews.length;
      }
    },
    addTrainerResponse: (state, action: PayloadAction<{
      reviewId: string;
      response: string;
    }>) => {
      const review = state.reviews.find(r => r.id === action.payload.reviewId);
      if (review) {
        review.trainerResponse = action.payload.response;
      }
    },
    addTrainer: (state, action: PayloadAction<HumanTrainer>) => {
      state.trainers.push(action.payload);
    },
    updateTrainer: (state, action: PayloadAction<{ trainerId: string; updates: Partial<HumanTrainer> }>) => {
      const trainer = state.trainers.find(t => t.id === action.payload.trainerId);
      if (trainer) {
        Object.assign(trainer, action.payload.updates);
      }
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  updateSearchFilters,
  clearSearchFilters,
  bookTrainerSession,
  cancelBooking,
  completeBooking,
  addTrainerReview,
  addTrainerResponse,
  addTrainer,
  updateTrainer,
} = trainerMarketplaceSlice.actions;

export default trainerMarketplaceSlice.reducer;