import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  Dimensions,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  updateSearchFilters,
  clearSearchFilters,
  bookTrainerSession,
  addTrainerReview,
} from '../../store/slices/trainerMarketplaceSlice';
import { HumanTrainer, TrainerBooking, TrainerSpecialty } from '../../types';

const { width } = Dimensions.get('window');

const TrainerMarketplaceScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { trainers, bookings, reviews, searchFilters } = useSelector((state: RootState) => state.trainerMarketplace);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [selectedTrainer, setSelectedTrainer] = useState<HumanTrainer | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    duration: 60,
    sessionType: 'consultation' as const,
  });
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const specialtyOptions: TrainerSpecialty[] = [
    'weight_loss', 'muscle_building', 'strength', 'endurance', 
    'flexibility', 'rehabilitation', 'senior_fitness', 'youth_fitness'
  ];

  const filteredTrainers = trainers.filter(trainer => {
    if (searchFilters.specialties.length > 0) {
      const hasSpecialty = searchFilters.specialties.some(specialty => 
        trainer.specialties.includes(specialty)
      );
      if (!hasSpecialty) return false;
    }
    
    if (searchFilters.maxRate && trainer.hourlyRate > searchFilters.maxRate) {
      return false;
    }
    
    if (searchFilters.location && trainer.location) {
      const locationMatch = trainer.location.city.toLowerCase().includes(searchFilters.location.toLowerCase()) ||
                           trainer.location.state.toLowerCase().includes(searchFilters.location.toLowerCase());
      if (!locationMatch && !trainer.location.isOnlineOnly) return false;
    }
    
    return true;
  });

  const handleBookSession = () => {
    if (!selectedTrainer || !currentUser || !bookingDetails.date || !bookingDetails.time) {
      Alert.alert('Error', 'Please fill in all booking details');
      return;
    }

    const sessionDate = new Date(`${bookingDetails.date}T${bookingDetails.time}`);
    
    dispatch(bookTrainerSession({
      clientId: currentUser.id,
      trainerId: selectedTrainer.id,
      sessionDate,
      startTime: bookingDetails.time,
      duration: bookingDetails.duration,
      sessionType: bookingDetails.sessionType,
    }));

    setShowBookingModal(false);
    setSelectedTrainer(null);
    Alert.alert('Success', 'Your session has been booked successfully!');
  };

  const handleSubmitReview = (trainer: HumanTrainer) => {
    if (!currentUser || !reviewText.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    const booking = bookings.find(b => 
      b.trainerId === trainer.id && 
      b.clientId === currentUser.id && 
      b.status === 'completed'
    );

    if (!booking) {
      Alert.alert('Error', 'You can only review trainers you have worked with');
      return;
    }

    dispatch(addTrainerReview({
      clientId: currentUser.id,
      trainerId: trainer.id,
      bookingId: booking.id,
      rating: reviewRating,
      review: reviewText.trim(),
    }));

    setReviewText('');
    setReviewRating(5);
    Alert.alert('Thank you!', 'Your review has been submitted');
  };

  const toggleSpecialtyFilter = (specialty: TrainerSpecialty) => {
    const currentSpecialties = searchFilters.specialties;
    const newSpecialties = currentSpecialties.includes(specialty)
      ? currentSpecialties.filter(s => s !== specialty)
      : [...currentSpecialties, specialty];
    
    dispatch(updateSearchFilters({ specialties: newSpecialties }));
  };

  const formatSpecialty = (specialty: string) => {
    return specialty.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderTrainerCard = (trainer: HumanTrainer) => {
    const trainerReviews = reviews.filter(r => r.trainerId === trainer.id);
    
    return (
      <View key={trainer.id} style={styles.trainerCard}>
        <View style={styles.trainerHeader}>
          <Image source={{ uri: trainer.profilePhoto }} style={styles.trainerAvatar} />
          <View style={styles.trainerBasicInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.trainerName}>{trainer.name}</Text>
              {trainer.isVerified && (
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={styles.verifiedIcon} />
              )}
            </View>
            <Text style={styles.trainerLocation}>
              {trainer.location?.isOnlineOnly ? 'Online Only' : `${trainer.location?.city}, ${trainer.location?.state}`}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{trainer.rating} ({trainer.reviewCount} reviews)</Text>
            </View>
            <Text style={styles.hourlyRate}>${trainer.hourlyRate}/hr</Text>
          </View>
        </View>

        <Text style={styles.trainerBio} numberOfLines={2}>
          {trainer.bio}
        </Text>

        <View style={styles.specialtiesContainer}>
          {trainer.specialties.slice(0, 3).map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{formatSpecialty(specialty)}</Text>
            </View>
          ))}
          {trainer.specialties.length > 3 && (
            <Text style={styles.moreSpecialties}>+{trainer.specialties.length - 3} more</Text>
          )}
        </View>

        <View style={styles.certificationsContainer}>
          <Text style={styles.certificationsTitle}>Certifications:</Text>
          <Text style={styles.certificationsList}>
            {trainer.certifications.map(cert => cert.name).join(', ')}
          </Text>
        </View>

        <View style={styles.trainerActions}>
          <TouchableOpacity 
            style={styles.viewProfileButton}
            onPress={() => setSelectedTrainer(trainer)}
          >
            <Text style={styles.viewProfileButtonText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bookSessionButton}
            onPress={() => {
              setSelectedTrainer(trainer);
              setShowBookingModal(true);
            }}
          >
            <Text style={styles.bookSessionButtonText}>Book Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Trainer Marketplace</Text>
        <Text style={styles.headerSubtitle}>Find your perfect fitness coach</Text>
      </LinearGradient>

      <View style={styles.searchBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search trainers...</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Ionicons name="filter" size={20} color="#007AFF" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{filteredTrainers.length} trainers found</Text>
      </View>

      <FlatList
        data={filteredTrainers}
        renderItem={({ item }) => renderTrainerCard(item)}
        keyExtractor={(item) => item.id}
        style={styles.trainersList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.trainersListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: '#666',
    fontSize: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 20,
  },
  filterButtonText: {
    marginLeft: 5,
    color: '#007AFF',
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsCount: {
    fontSize: 16,
    color: '#666',
  },
  trainersList: {
    flex: 1,
  },
  trainersListContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  trainerCard: {
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
  trainerHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  trainerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  trainerBasicInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  trainerLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  hourlyRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  trainerBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 15,
  },
  specialtyTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
  },
  specialtyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  moreSpecialties: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  certificationsContainer: {
    marginBottom: 15,
  },
  certificationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  certificationsList: {
    fontSize: 14,
    color: '#666',
  },
  trainerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewProfileButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  viewProfileButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  bookSessionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookSessionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default TrainerMarketplaceScreen;