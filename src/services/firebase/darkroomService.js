import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from '@react-native-firebase/firestore';
import logger from '../../utils/logger';

// Initialize Firestore once at module level
const db = getFirestore();

/**
 * Get or create darkroom document for user
 * @param {string} userId - User ID
 * @returns {Promise} - Darkroom data
 */
export const getDarkroom = async (userId) => {
  try {
    const darkroomRef = doc(db, 'darkrooms', userId);
    const darkroomDoc = await getDoc(darkroomRef);

    // In modular API, exists() is a method
    if (!darkroomDoc.exists()) {
      // Create new darkroom with initial reveal time
      const nextRevealAt = calculateNextRevealTime();
      const createdAt = Timestamp.now();
      await setDoc(darkroomRef, {
        userId,
        nextRevealAt,
        lastRevealedAt: null,
        createdAt,
      });

      return {
        success: true,
        darkroom: {
          userId,
          nextRevealAt,
          lastRevealedAt: null,
          createdAt,
        },
      };
    }

    return {
      success: true,
      darkroom: darkroomDoc.data(),
    };
  } catch (error) {
    logger.error('Error getting darkroom', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if darkroom is ready to reveal photos
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if ready to reveal
 */
export const isDarkroomReadyToReveal = async (userId) => {
  try {
    const result = await getDarkroom(userId);
    if (!result.success) return false;

    const { nextRevealAt } = result.darkroom;
    const now = Timestamp.now();

    return nextRevealAt && nextRevealAt.seconds <= now.seconds;
  } catch (error) {
    logger.error('Error checking darkroom reveal status', error);
    return false;
  }
};

/**
 * Set next reveal time after revealing photos
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const scheduleNextReveal = async (userId) => {
  try {
    const darkroomRef = doc(db, 'darkrooms', userId);
    const nextRevealAt = calculateNextRevealTime();

    await updateDoc(darkroomRef, {
      nextRevealAt,
      lastRevealedAt: serverTimestamp(),
    });

    return { success: true, nextRevealAt };
  } catch (error) {
    logger.error('Error scheduling next reveal', error);
    return { success: false, error: error.message };
  }
};

/**
 * Ensure darkroom exists and has valid nextRevealAt for new photo capture
 * Called when user takes a photo to ensure timing is accurate
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const ensureDarkroomInitialized = async (userId) => {
  try {
    const darkroomRef = doc(db, 'darkrooms', userId);
    const darkroomDoc = await getDoc(darkroomRef);

    if (!darkroomDoc.exists()) {
      // Create new darkroom with initial reveal time
      const nextRevealAt = calculateNextRevealTime();
      await setDoc(darkroomRef, {
        userId,
        nextRevealAt,
        lastRevealedAt: null,
        createdAt: Timestamp.now(),
      });
      logger.info('DarkroomService: Created new darkroom for user', { userId });
      return { success: true, created: true };
    }

    // Darkroom exists - check if nextRevealAt is in the past (stale)
    const { nextRevealAt } = darkroomDoc.data();
    const now = Timestamp.now();

    if (!nextRevealAt || nextRevealAt.seconds < now.seconds) {
      // nextRevealAt is stale or missing - set a new one
      const newNextRevealAt = calculateNextRevealTime();
      await updateDoc(darkroomRef, {
        nextRevealAt: newNextRevealAt,
      });
      logger.info('DarkroomService: Refreshed stale nextRevealAt', { userId });
      return { success: true, refreshed: true };
    }

    // nextRevealAt is still in the future - no change needed
    return { success: true };
  } catch (error) {
    logger.error('DarkroomService: Failed to ensure darkroom initialized', { userId, error: error.message });
    return { success: false, error: error.message };
  }
};

/**
 * Calculate random reveal time (0-15 minutes from now)
 * @returns {Timestamp} - Next reveal timestamp
 */
const calculateNextRevealTime = () => {
  const now = new Date();
  const randomMinutes = Math.random() * 15; // Random between 0-15 minutes
  const revealTime = new Date(now.getTime() + randomMinutes * 60 * 1000);
  return Timestamp.fromDate(revealTime);
};
