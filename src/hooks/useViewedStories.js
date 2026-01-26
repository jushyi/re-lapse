import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';

const STORAGE_KEY = '@viewed_stories';
const PHOTOS_STORAGE_KEY = '@viewed_story_photos';
const EXPIRY_HOURS = 24; // Reset viewed state after 24 hours

/**
 * Hook for managing viewed stories state with AsyncStorage persistence
 *
 * Features:
 * - Persists viewed state to AsyncStorage (both friend and photo level)
 * - 24-hour expiry for viewed state
 * - Loading state for initial hydration
 * - Get first unviewed photo index for starting position
 * - Uses ref for immediate sync access (avoids React state async issues)
 *
 * @returns {Object} { isViewed, markAsViewed, markPhotosAsViewed, getFirstUnviewedIndex, loading }
 */
export const useViewedStories = () => {
  const [viewedFriends, setViewedFriends] = useState(new Set());
  const [viewedPhotos, setViewedPhotos] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Ref for immediate sync access to viewed photos (bypasses React state async)
  const viewedPhotosRef = useRef(new Set());

  /**
   * Load viewed state from AsyncStorage on mount
   */
  const loadViewedState = async () => {
    try {
      const now = Date.now();
      const expiryMs = EXPIRY_HOURS * 60 * 60 * 1000;

      // Load viewed friends
      const storedFriends = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedFriends) {
        const data = JSON.parse(storedFriends);
        const valid = Object.entries(data)
          .filter(([, timestamp]) => now - timestamp < expiryMs)
          .map(([friendId]) => friendId);
        setViewedFriends(new Set(valid));
        logger.debug('useViewedStories: Loaded viewed friends', { count: valid.length });
      }

      // Load viewed photos
      const storedPhotos = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
      if (storedPhotos) {
        const data = JSON.parse(storedPhotos);
        const valid = Object.entries(data)
          .filter(([, timestamp]) => now - timestamp < expiryMs)
          .map(([photoId]) => photoId);
        const validSet = new Set(valid);
        setViewedPhotos(validSet);
        viewedPhotosRef.current = validSet; // Sync ref
        logger.debug('useViewedStories: Loaded viewed photos', { count: valid.length });
      }
    } catch (error) {
      logger.error('useViewedStories: Failed to load', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Load viewed state on mount
  useEffect(() => {
    loadViewedState();
  }, []);

  /**
   * Mark a friend's stories as viewed
   * Updates local state immediately, then persists to AsyncStorage
   *
   * @param {string} friendId - Friend's user ID to mark as viewed
   */
  const markAsViewed = useCallback(async friendId => {
    try {
      // Update local state immediately
      setViewedFriends(prev => new Set([...prev, friendId]));

      // Persist to AsyncStorage
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      data[friendId] = Date.now();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      logger.info('useViewedStories: Marked as viewed', { friendId });
    } catch (error) {
      logger.error('useViewedStories: Failed to mark as viewed', { error: error.message });
    }
  }, []);

  /**
   * Mark photos as viewed when navigating through stories
   * Call this after viewing photos in the stories modal
   *
   * @param {Array<string>} photoIds - Array of photo IDs to mark as viewed
   */
  const markPhotosAsViewed = useCallback(async photoIds => {
    if (!photoIds || photoIds.length === 0) return;

    try {
      // Update ref immediately (sync) for instant access in getFirstUnviewedIndex
      const newSet = new Set([...viewedPhotosRef.current, ...photoIds]);
      viewedPhotosRef.current = newSet;

      // Update local state (async, triggers re-renders)
      setViewedPhotos(newSet);

      // Persist to AsyncStorage
      const stored = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      const now = Date.now();
      photoIds.forEach(photoId => {
        data[photoId] = now;
      });
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(data));

      logger.debug('useViewedStories: Marked photos as viewed', { count: photoIds.length });
    } catch (error) {
      logger.error('useViewedStories: Failed to mark photos as viewed', { error: error.message });
    }
  }, []);

  /**
   * Get the index of the first unviewed photo in an array
   * Returns 0 if all photos are viewed (start from beginning)
   * Uses ref for immediate sync access (avoids React state async issues)
   *
   * @param {Array<object>} photos - Array of photo objects with id property
   * @returns {number} Index of first unviewed photo, or 0 if all viewed
   */
  const getFirstUnviewedIndex = useCallback(photos => {
    if (!photos || photos.length === 0) return 0;

    // Use ref for immediate access (sync) instead of state (async)
    const viewed = viewedPhotosRef.current;
    const firstUnviewedIdx = photos.findIndex(photo => !viewed.has(photo.id));

    // If all are viewed, start from beginning
    if (firstUnviewedIdx === -1) {
      logger.debug('useViewedStories: All photos viewed, starting from 0');
      return 0;
    }

    logger.debug('useViewedStories: First unviewed photo', {
      index: firstUnviewedIdx,
      total: photos.length,
      viewedCount: viewed.size,
    });
    return firstUnviewedIdx;
  }, []);

  /**
   * Check if a friend's stories have been viewed
   *
   * @param {string} friendId - Friend's user ID to check
   * @returns {boolean} Whether the friend's stories have been viewed
   */
  const isViewed = useCallback(
    friendId => {
      return viewedFriends.has(friendId);
    },
    [viewedFriends]
  );

  /**
   * Check if all photos in an array have been viewed
   * Uses ref for immediate sync access (avoids React state async issues)
   * @param {Array<object>} photos - Array of photo objects with id property
   * @returns {boolean} True if ALL photos have been viewed
   */
  const hasViewedAllPhotos = useCallback(photos => {
    if (!photos || photos.length === 0) return false;
    // Use ref for immediate access (sync) instead of state (async)
    const viewed = viewedPhotosRef.current;
    return photos.every(photo => viewed.has(photo.id));
  }, []);

  return {
    isViewed,
    markAsViewed,
    markPhotosAsViewed,
    getFirstUnviewedIndex,
    hasViewedAllPhotos,
    loading,
  };
};
