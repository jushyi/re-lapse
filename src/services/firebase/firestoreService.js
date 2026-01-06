import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Create a new user document in Firestore
 * @param {string} userId - User ID from Firebase Auth
 * @param {object} userData - User data (username, email, displayName, etc.)
 * @returns {Promise}
 */
export const createUserDocument = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: Timestamp.now(),
      dailyPhotoCount: 0,
      lastPhotoDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get user document by ID
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserDocument = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { success: true, data: { id: userSnap.id, ...userSnap.data() } };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update user document
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise}
 */
export const updateUserDocument = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Create a new photo document
 * @param {object} photoData - Photo metadata
 * @returns {Promise}
 */
export const createPhotoDocument = async (photoData) => {
  try {
    const photosRef = collection(db, 'photos');
    const docRef = await addDoc(photosRef, {
      ...photoData,
      capturedAt: Timestamp.now(),
      reactions: {},
      reactionCount: 0,
    });
    return { success: true, photoId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get user's photos
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of photos to fetch
 * @returns {Promise}
 */
export const getUserPhotos = async (userId, limitCount = 20) => {
  try {
    const photosRef = collection(db, 'photos');
    const q = query(
      photosRef,
      where('userId', '==', userId),
      orderBy('capturedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const photos = [];
    querySnapshot.forEach((doc) => {
      photos.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: photos };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update photo document
 * @param {string} photoId - Photo ID
 * @param {object} updates - Fields to update
 * @returns {Promise}
 */
export const updatePhotoDocument = async (photoId, updates) => {
  try {
    const photoRef = doc(db, 'photos', photoId);
    await updateDoc(photoRef, updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Delete photo document
 * @param {string} photoId - Photo ID
 * @returns {Promise}
 */
export const deletePhotoDocument = async (photoId) => {
  try {
    const photoRef = doc(db, 'photos', photoId);
    await deleteDoc(photoRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Create friendship document
 * @param {string} user1Id - First user ID
 * @param {string} user2Id - Second user ID
 * @param {string} requestedBy - User who sent the request
 * @returns {Promise}
 */
export const createFriendship = async (user1Id, user2Id, requestedBy) => {
  try {
    // Sort user IDs alphabetically for deterministic ID
    const [sortedUser1, sortedUser2] = [user1Id, user2Id].sort();
    const friendshipId = `${sortedUser1}_${sortedUser2}`;

    const friendshipRef = doc(db, 'friendships', friendshipId);
    await setDoc(friendshipRef, {
      user1Id: sortedUser1,
      user2Id: sortedUser2,
      status: 'pending',
      requestedBy,
      createdAt: Timestamp.now(),
      acceptedAt: null,
    });

    return { success: true, friendshipId };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Accept friendship request
 * @param {string} friendshipId - Friendship document ID
 * @returns {Promise}
 */
export const acceptFriendship = async (friendshipId) => {
  try {
    const friendshipRef = doc(db, 'friendships', friendshipId);
    await updateDoc(friendshipRef, {
      status: 'accepted',
      acceptedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get user's friends
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const getUserFriends = async (userId) => {
  try {
    const friendshipsRef = collection(db, 'friendships');

    // Query where user is user1Id
    const q1 = query(
      friendshipsRef,
      where('user1Id', '==', userId),
      where('status', '==', 'accepted')
    );

    // Query where user is user2Id
    const q2 = query(
      friendshipsRef,
      where('user2Id', '==', userId),
      where('status', '==', 'accepted')
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);

    const friendIds = [];
    snapshot1.forEach((doc) => {
      friendIds.push(doc.data().user2Id);
    });
    snapshot2.forEach((doc) => {
      friendIds.push(doc.data().user1Id);
    });

    return { success: true, data: friendIds };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Create notification
 * @param {object} notificationData - Notification data
 * @returns {Promise}
 */
export const createNotification = async (notificationData) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      read: false,
      createdAt: Timestamp.now(),
    });
    return { success: true, notificationId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Create photo view record
 * @param {string} userId - Viewer user ID
 * @param {string} photoId - Photo ID
 * @param {string} photoOwnerId - Photo owner ID
 * @returns {Promise}
 */
export const createPhotoView = async (userId, photoId, photoOwnerId) => {
  try {
    const viewId = `${userId}_${photoId}`;
    const viewRef = doc(db, 'photoViews', viewId);
    await setDoc(viewRef, {
      userId,
      photoId,
      photoOwnerId,
      viewedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has viewed a photo
 * @param {string} userId - Viewer user ID
 * @param {string} photoId - Photo ID
 * @returns {Promise}
 */
export const hasUserViewedPhoto = async (userId, photoId) => {
  try {
    const viewId = `${userId}_${photoId}`;
    const viewRef = doc(db, 'photoViews', viewId);
    const viewSnap = await getDoc(viewRef);
    return { success: true, viewed: viewSnap.exists() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};