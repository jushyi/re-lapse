import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';
import * as ImageManipulator from 'expo-image-manipulator';
import logger from '../../utils/logger';

/**
 * Compress image before upload
 * @param {string} uri - Local image URI
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<string>} - Compressed image URI
 */
const compressImage = async (uri, quality = 0.7) => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }], // Resize to max 1080px width
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    logger.error('Image compression error', error);
    return uri; // Return original if compression fails
  }
};

/**
 * Upload profile photo to Firebase Storage
 * @param {string} userId - User ID
 * @param {string} localUri - Local image URI
 * @returns {Promise}
 */
export const uploadProfilePhoto = async (userId, localUri) => {
  try {
    // Compress image first
    const compressedUri = await compressImage(localUri, 0.7);

    // Convert to blob
    const response = await fetch(compressedUri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, `profile_photos/${userId}.jpg`);

    // Upload file
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Upload photo to Firebase Storage
 * @param {string} photoId - Photo document ID
 * @param {string} localUri - Local image URI
 * @returns {Promise}
 */
export const uploadPhoto = async (photoId, localUri) => {
  try {
    // Compress image first
    const compressedUri = await compressImage(localUri, 0.8);

    // Convert to blob
    const response = await fetch(compressedUri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, `photos/${photoId}.jpg`);

    // Upload file
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Delete profile photo from Firebase Storage
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const deleteProfilePhoto = async (userId) => {
  try {
    const storageRef = ref(storage, `profile_photos/${userId}.jpg`);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Delete photo from Firebase Storage
 * @param {string} photoId - Photo ID
 * @returns {Promise}
 */
export const deletePhoto = async (photoId) => {
  try {
    const storageRef = ref(storage, `photos/${photoId}.jpg`);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get download URL for a photo
 * @param {string} photoId - Photo ID
 * @returns {Promise}
 */
export const getPhotoURL = async (photoId) => {
  try {
    const storageRef = ref(storage, `photos/${photoId}.jpg`);
    const downloadURL = await getDownloadURL(storageRef);
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};