import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  limit,
  startAfter,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Get feed photos (all journaled photos from all users)
 * For MVP: Shows ALL users' journaled photos
 * Week 9: Will be filtered to friends-only
 *
 * @param {number} limitCount - Number of photos to fetch (default: 20)
 * @param {object} lastDoc - Last document for pagination (optional)
 * @returns {Promise} - Feed photos array and last document
 */
export const getFeedPhotos = async (limitCount = 20, lastDoc = null) => {
  try {
    // Query for triaged photos with photoState = 'journaled'
    // Note: We don't use composite index, so we filter in client
    let feedQuery = query(
      collection(db, 'photos'),
      where('status', '==', 'triaged'),
      where('photoState', '==', 'journaled'),
      orderBy('capturedAt', 'desc'),
      limit(limitCount)
    );

    // If we have a lastDoc, start after it for pagination
    if (lastDoc) {
      feedQuery = query(
        collection(db, 'photos'),
        where('status', '==', 'triaged'),
        where('photoState', '==', 'journaled'),
        orderBy('capturedAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(feedQuery);

    const photos = await Promise.all(
      snapshot.docs.map(async (photoDoc) => {
        const photoData = photoDoc.data();

        // Fetch user data for each photo
        const userDoc = await getDoc(doc(db, 'users', photoData.userId));
        const userData = userDoc.exists() ? userDoc.data() : {};

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

    // Get the last document for pagination
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      success: true,
      photos,
      lastDoc: lastVisible,
      hasMore: snapshot.docs.length === limitCount,
    };
  } catch (error) {
    console.error('Error fetching feed photos:', error);
    return { success: false, error: error.message, photos: [] };
  }
};

/**
 * Subscribe to real-time feed updates
 * Listens for new journaled photos
 *
 * @param {function} callback - Callback function to handle updates
 * @param {number} limitCount - Number of photos to watch (default: 20)
 * @returns {function} - Unsubscribe function
 */
export const subscribeFeedPhotos = (callback, limitCount = 20) => {
  try {
    const feedQuery = query(
      collection(db, 'photos'),
      where('status', '==', 'triaged'),
      where('photoState', '==', 'journaled'),
      orderBy('capturedAt', 'desc'),
      limit(limitCount)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      feedQuery,
      async (snapshot) => {
        const photos = await Promise.all(
          snapshot.docs.map(async (photoDoc) => {
            const photoData = photoDoc.data();

            // Fetch user data for each photo
            const userDoc = await getDoc(doc(db, 'users', photoData.userId));
            const userData = userDoc.exists() ? userDoc.data() : {};

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

        callback({ success: true, photos });
      },
      (error) => {
        console.error('Error in feed subscription:', error);
        callback({ success: false, error: error.message, photos: [] });
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to feed photos:', error);
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
    const photoDoc = await getDoc(doc(db, 'photos', photoId));

    if (!photoDoc.exists()) {
      return { success: false, error: 'Photo not found' };
    }

    const photoData = photoDoc.data();

    // Fetch user data
    const userDoc = await getDoc(doc(db, 'users', photoData.userId));
    const userData = userDoc.exists() ? userDoc.data() : {};

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
    console.error('Error fetching photo by ID:', error);
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
    const photosQuery = query(
      collection(db, 'photos'),
      where('userId', '==', userId),
      where('status', '==', 'triaged'),
      orderBy('capturedAt', 'desc')
    );

    const snapshot = await getDocs(photosQuery);

    // Fetch user data once
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() : {};

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
    console.error('Error fetching user feed photos:', error);
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
    const journaledQuery = query(
      collection(db, 'photos'),
      where('status', '==', 'triaged'),
      where('photoState', '==', 'journaled')
    );

    const archivedQuery = query(
      collection(db, 'photos'),
      where('status', '==', 'triaged'),
      where('photoState', '==', 'archived')
    );

    const developingQuery = query(
      collection(db, 'photos'),
      where('status', '==', 'developing')
    );

    const [journaledSnapshot, archivedSnapshot, developingSnapshot] = await Promise.all([
      getDocs(journaledQuery),
      getDocs(archivedQuery),
      getDocs(developingQuery),
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
    console.error('Error fetching feed stats:', error);
    return { success: false, error: error.message };
  }
};
