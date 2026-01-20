import firestore from '@react-native-firebase/firestore';
import logger from '../../utils/logger';

/**
 * Get feed photos (journaled photos from friends + current user)
 * Week 9: Filters by friendUserIds (friends-only + current user's own photos)
 *
 * @param {number} limitCount - Number of photos to fetch (default: 20)
 * @param {object} lastDoc - Last document for pagination (optional)
 * @param {Array<string>} friendUserIds - Array of friend user IDs (optional)
 * @param {string} currentUserId - Current user ID (to include own photos)
 * @returns {Promise} - Feed photos array and last document
 */
export const getFeedPhotos = async (limitCount = 20, lastDoc = null, friendUserIds = null, currentUserId = null) => {
  try {
    // Simplified query: Only filter by photoState = 'journal'
    // Status will be implicitly 'triaged' since only triaged photos have photoState
    // We'll sort in JavaScript to avoid composite index requirement
    const snapshot = await firestore()
      .collection('photos')
      .where('photoState', '==', 'journal')
      .get();

    // Fetch all photos with user data
    const allPhotos = await Promise.all(
      snapshot.docs.map(async (photoDoc) => {
        const photoData = photoDoc.data();

        // Fetch user data for each photo
        const userDoc = await firestore().collection('users').doc(photoData.userId).get();
        const userExists = typeof userDoc.exists === 'function' ? userDoc.exists() : userDoc.exists;
        const userData = userExists ? userDoc.data() : {};

        return {
          id: photoDoc.id,
          ...photoData,
          user: {
            uid: photoData.userId,
            username: userData.username || 'unknown',
            displayName: userData.displayName || 'Unknown User',
            profilePhotoURL: userData.profilePhotoURL || null,
          },
        };
      })
    );

    // Filter by friends + current user if friendUserIds provided
    let filteredPhotos = allPhotos;
    if (friendUserIds !== null && currentUserId) {
      const allowedUserIds = [...friendUserIds, currentUserId];
      filteredPhotos = allPhotos.filter(photo => allowedUserIds.includes(photo.userId));
    }

    // Sort by capturedAt in descending order (newest first) - client-side
    const sortedPhotos = filteredPhotos.sort((a, b) => {
      const aTime = a.capturedAt?.seconds || 0;
      const bTime = b.capturedAt?.seconds || 0;
      return bTime - aTime;
    });

    // Handle pagination manually
    const startIndex = lastDoc ? lastDoc.paginationIndex + 1 : 0;
    const endIndex = startIndex + limitCount;
    const paginatedPhotos = sortedPhotos.slice(startIndex, endIndex);

    // Create pagination marker
    const lastVisible = paginatedPhotos.length > 0
      ? { paginationIndex: endIndex - 1 }
      : null;

    return {
      success: true,
      photos: paginatedPhotos,
      lastDoc: lastVisible,
      hasMore: endIndex < sortedPhotos.length,
    };
  } catch (error) {
    logger.error('Error fetching feed photos', error);
    return { success: false, error: error.message, photos: [] };
  }
};

/**
 * Subscribe to real-time feed updates
 * Listens for new journaled photos (filtered by friends)
 *
 * @param {function} callback - Callback function to handle updates
 * @param {number} limitCount - Number of photos to watch (default: 20)
 * @param {Array<string>} friendUserIds - Array of friend user IDs (optional)
 * @param {string} currentUserId - Current user ID (to include own photos)
 * @returns {function} - Unsubscribe function
 */
export const subscribeFeedPhotos = (callback, limitCount = 20, friendUserIds = null, currentUserId = null) => {
  try {
    // Set up real-time listener
    const unsubscribe = firestore()
      .collection('photos')
      .where('photoState', '==', 'journal')
      .onSnapshot(
        async (snapshot) => {
          const allPhotos = await Promise.all(
            snapshot.docs.map(async (photoDoc) => {
              const photoData = photoDoc.data();

              // Fetch user data for each photo
              const userDoc = await firestore().collection('users').doc(photoData.userId).get();
              const userExists = typeof userDoc.exists === 'function' ? userDoc.exists() : userDoc.exists;
              const userData = userExists ? userDoc.data() : {};

              return {
                id: photoDoc.id,
                ...photoData,
                user: {
                  uid: photoData.userId,
                  username: userData.username || 'unknown',
                  displayName: userData.displayName || 'Unknown User',
                  profilePhotoURL: userData.profilePhotoURL || null,
                },
              };
            })
          );

          // Filter by friends + current user if friendUserIds provided
          let filteredPhotos = allPhotos;
          if (friendUserIds !== null && currentUserId) {
            const allowedUserIds = [...friendUserIds, currentUserId];
            filteredPhotos = allPhotos.filter(photo => allowedUserIds.includes(photo.userId));
          }

          // Sort by capturedAt in descending order (newest first)
          const sortedPhotos = filteredPhotos.sort((a, b) => {
            const aTime = a.capturedAt?.seconds || 0;
            const bTime = b.capturedAt?.seconds || 0;
            return bTime - aTime;
          });

          // Limit to requested count
          const limitedPhotos = sortedPhotos.slice(0, limitCount);

          callback({ success: true, photos: limitedPhotos });
        },
        (error) => {
          logger.error('Error in feed subscription', error);
          callback({ success: false, error: error.message, photos: [] });
        }
      );

    return unsubscribe;
  } catch (error) {
    logger.error('Error subscribing to feed photos', error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Get a single photo by ID with user data
 * Used for photo detail modal
 *
 * @param {string} photoId - Photo document ID
 * @returns {Promise} - Photo data with user info
 */
export const getPhotoById = async (photoId) => {
  try {
    const photoDoc = await firestore().collection('photos').doc(photoId).get();

    const photoExists = typeof photoDoc.exists === 'function' ? photoDoc.exists() : photoDoc.exists;
    if (!photoExists) {
      return { success: false, error: 'Photo not found' };
    }

    const photoData = photoDoc.data();

    // Fetch user data
    const userDoc = await firestore().collection('users').doc(photoData.userId).get();
    const userExists = typeof userDoc.exists === 'function' ? userDoc.exists() : userDoc.exists;
    const userData = userExists ? userDoc.data() : {};

    return {
      success: true,
      photo: {
        id: photoDoc.id,
        ...photoData,
        user: {
          uid: photoData.userId,
          username: userData.username || 'unknown',
          displayName: userData.displayName || 'Unknown User',
          profilePhotoURL: userData.profilePhotoURL || null,
        },
      },
    };
  } catch (error) {
    logger.error('Error fetching photo by ID', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all photos from a specific user (for Friend Photo Viewer)
 * Includes both journaled AND archived photos
 *
 * @param {string} userId - User ID
 * @returns {Promise} - Array of user's photos
 */
export const getUserFeedPhotos = async (userId) => {
  try {
    // Query for all triaged photos (journaled + archived)
    const snapshot = await firestore()
      .collection('photos')
      .where('userId', '==', userId)
      .where('status', '==', 'triaged')
      .orderBy('capturedAt', 'desc')
      .get();

    // Fetch user data once
    const userDoc = await firestore().collection('users').doc(userId).get();
    const userExists = typeof userDoc.exists === 'function' ? userDoc.exists() : userDoc.exists;
    const userData = userExists ? userDoc.data() : {};

    const photos = snapshot.docs.map((photoDoc) => ({
      id: photoDoc.id,
      ...photoDoc.data(),
      user: {
        uid: userId,
        username: userData.username || 'unknown',
        displayName: userData.displayName || 'Unknown User',
        profilePhotoURL: userData.profilePhotoURL || null,
      },
    }));

    return { success: true, photos };
  } catch (error) {
    logger.error('Error fetching user feed photos', error);
    return { success: false, error: error.message, photos: [] };
  }
};

/**
 * Get feed statistics for debugging/testing
 *
 * @returns {Promise} - Feed stats object
 */
export const getFeedStats = async () => {
  try {
    const [journaledSnapshot, archivedSnapshot, developingSnapshot] = await Promise.all([
      firestore()
        .collection('photos')
        .where('status', '==', 'triaged')
        .where('photoState', '==', 'journaled')
        .get(),
      firestore()
        .collection('photos')
        .where('status', '==', 'triaged')
        .where('photoState', '==', 'archived')
        .get(),
      firestore()
        .collection('photos')
        .where('status', '==', 'developing')
        .get(),
    ]);

    return {
      success: true,
      stats: {
        journaledCount: journaledSnapshot.size,
        archivedCount: archivedSnapshot.size,
        developingCount: developingSnapshot.size,
        totalPhotos: journaledSnapshot.size + archivedSnapshot.size + developingSnapshot.size,
      },
    };
  } catch (error) {
    logger.error('Error fetching feed stats', error);
    return { success: false, error: error.message };
  }
};

/**
 * Toggle a reaction on a photo (increment count)
 * New data structure: reactions[userId][emoji] = count
 * Users can react multiple times with the same emoji
 *
 * @param {string} photoId - Photo document ID
 * @param {string} userId - User ID who is reacting
 * @param {string} emoji - Emoji reaction
 * @param {number} currentCount - Current count for this emoji (to increment)
 * @returns {Promise} - Success/error result
 */
export const toggleReaction = async (photoId, userId, emoji, currentCount) => {
  try {
    const photoRef = firestore().collection('photos').doc(photoId);
    const photoDoc = await photoRef.get();

    const photoExists = typeof photoDoc.exists === 'function' ? photoDoc.exists() : photoDoc.exists;
    if (!photoExists) {
      return { success: false, error: 'Photo not found' };
    }

    const photoData = photoDoc.data();
    const reactions = photoData.reactions || {};

    // Initialize user's reactions if not exists
    if (!reactions[userId]) {
      reactions[userId] = {};
    }

    // Increment reaction count
    const newCount = currentCount + 1;
    reactions[userId][emoji] = newCount;

    // Calculate total reaction count
    let totalCount = 0;
    Object.values(reactions).forEach((userReactions) => {
      if (typeof userReactions === 'object') {
        Object.values(userReactions).forEach((count) => {
          totalCount += count;
        });
      }
    });

    // Update photo document
    await photoRef.update({
      reactions,
      reactionCount: totalCount,
    });

    return { success: true, reactions, reactionCount: totalCount };
  } catch (error) {
    logger.error('Error toggling reaction', error);
    return { success: false, error: error.message };
  }
};
