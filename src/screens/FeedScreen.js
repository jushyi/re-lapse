import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import useFeedPhotos from '../hooks/useFeedPhotos';
import FeedPhotoCard from '../components/FeedPhotoCard';
import FeedLoadingSkeleton from '../components/FeedLoadingSkeleton';
import PhotoDetailModal from '../components/PhotoDetailModal';
import { toggleReaction } from '../services/firebase/feedService';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';

const FeedScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const {
    photos,
    loading,
    refreshing,
    loadingMore,
    error,
    loadMorePhotos,
    refreshFeed,
    updatePhotoInState,
  } = useFeedPhotos(true); // Enable real-time updates

  // Modal state
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  /**
   * Refresh feed when screen comes into focus
   * This ensures feed reflects current friendship state after adding/removing friends
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      logger.debug('Feed screen focused - refreshing feed');
      refreshFeed();
    });

    return unsubscribe;
  }, [navigation, refreshFeed]);

  /**
   * Handle photo card press - Open detail modal
   */
  const handlePhotoPress = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  /**
   * Close photo modal
   */
  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  /**
   * Handle reaction toggle with optimistic UI update
   * Increments the count for the selected emoji
   */
  const handleReactionToggle = async (emoji, currentCount) => {
    if (!user || !selectedPhoto) return;

    const photoId = selectedPhoto.id;
    const userId = user.uid;

    // Optimistic update - increment count immediately
    const updatedReactions = { ...selectedPhoto.reactions };
    if (!updatedReactions[userId]) {
      updatedReactions[userId] = {};
    }
    updatedReactions[userId] = { ...updatedReactions[userId], [emoji]: currentCount + 1 };

    // Calculate new total count
    let newTotalCount = 0;
    Object.values(updatedReactions).forEach((userReactions) => {
      if (typeof userReactions === 'object') {
        Object.values(userReactions).forEach((count) => {
          newTotalCount += count;
        });
      }
    });

    const updatedPhoto = {
      ...selectedPhoto,
      reactions: updatedReactions,
      reactionCount: newTotalCount,
    };

    setSelectedPhoto(updatedPhoto);
    updatePhotoInState(photoId, updatedPhoto);

    // Persist to Firebase
    try {
      const result = await toggleReaction(photoId, userId, emoji, currentCount);
      if (!result.success) {
        logger.error('Failed to toggle reaction', { error: result.error });
        // Revert optimistic update on error
        setSelectedPhoto(selectedPhoto);
        updatePhotoInState(photoId, selectedPhoto);
      }
    } catch (error) {
      logger.error('Error toggling reaction', error);
      // Revert optimistic update on error
      setSelectedPhoto(selectedPhoto);
      updatePhotoInState(photoId, selectedPhoto);
    }
  };

  /**
   * Render single feed item
   */
  const renderFeedItem = ({ item }) => (
    <FeedPhotoCard photo={item} onPress={() => handlePhotoPress(item)} />
  );

  /**
   * Render footer (loading more indicator)
   */
  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#000000" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📸</Text>
        <Text style={styles.emptyTitle}>No photos yet</Text>
        <Text style={styles.emptyText}>
          Start taking photos or add friends to see their photos here
        </Text>
        <TouchableOpacity style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>Take a Photo</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Render error state
   */
  const renderErrorState = () => {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshFeed}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lapse</Text>
      </View>

      {/* Content */}
      {loading ? (
        <FeedLoadingSkeleton count={3} />
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={photos}
          renderItem={renderFeedItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshFeed}
              tintColor="#000000"
            />
          }
          onEndReached={loadMorePhotos}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Photo Detail Modal with Inline Reactions */}
      {selectedPhoto && (
        <PhotoDetailModal
          visible={showPhotoModal}
          photo={selectedPhoto}
          onClose={handleClosePhotoModal}
          onReactionToggle={handleReactionToggle}
          currentUserId={user?.uid}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  feedList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FeedScreen;
