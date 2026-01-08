import { useState, useEffect, useCallback } from 'react';
import { getFeedPhotos, subscribeFeedPhotos } from '../services/firebase/feedService';
import { getFriendUserIds } from '../services/firebase/friendshipService';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for managing feed photos
 * Handles initial load, pagination, real-time updates, and refresh
 * Week 9: Fetches friendships and filters feed to friends-only
 *
 * @param {boolean} enableRealtime - Enable real-time listener (default: true)
 * @returns {object} - Feed state and control functions
 */
const useFeedPhotos = (enableRealtime = true) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [friendUserIds, setFriendUserIds] = useState([]);

  /**
   * Fetch friend user IDs
   */
  const fetchFriendships = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const result = await getFriendUserIds(user.uid);
      if (result.success) {
        setFriendUserIds(result.friendUserIds);
      }
    } catch (err) {
      console.error('Error fetching friendships:', err);
    }
  }, [user]);

  /**
   * Initial load of feed photos
   */
  const loadFeedPhotos = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch friendships first
      await fetchFriendships();

      // Then fetch feed photos with friend filter
      const result = await getFeedPhotos(20, null, friendUserIds, user.uid);

      if (result.success) {
        setPhotos(result.photos);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading feed photos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFriendships, friendUserIds, user]);

  /**
   * Load more photos (pagination)
   */
  const loadMorePhotos = useCallback(async () => {
    // Don't load if already loading or no more photos
    if (loadingMore || !hasMore || !lastDoc) return;

    try {
      setLoadingMore(true);

      const result = await getFeedPhotos(10, lastDoc, friendUserIds, user?.uid);

      if (result.success) {
        setPhotos((prev) => [...prev, ...result.photos]);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading more photos:', err);
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, lastDoc, friendUserIds, user]);

  /**
   * Refresh feed (pull-to-refresh)
   */
  const refreshFeed = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Refresh friendships too
      await fetchFriendships();

      const result = await getFeedPhotos(20, null, friendUserIds, user?.uid);

      if (result.success) {
        setPhotos(result.photos);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error refreshing feed:', err);
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFriendships, friendUserIds, user]);

  /**
   * Update a single photo in state (for optimistic UI updates)
   * Used for reactions without refetching entire feed
   */
  const updatePhotoInState = useCallback((photoId, updatedPhoto) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((photo) => (photo.id === photoId ? updatedPhoto : photo))
    );
  }, []);

  /**
   * Fetch friendships once on mount
   */
  useEffect(() => {
    if (user?.uid) {
      fetchFriendships();
    }
  }, [user?.uid]);

  /**
   * Load feed photos when friendships are fetched
   */
  useEffect(() => {
    if (!user?.uid) return;

    // Initial load
    loadFeedPhotos();
  }, [user?.uid, friendUserIds.length]);

  /**
   * Set up real-time listener
   */
  useEffect(() => {
    // Don't set up listener until we have the user
    if (!user?.uid) return;

    // Set up real-time listener if enabled
    let unsubscribe = () => {};

    if (enableRealtime) {
      unsubscribe = subscribeFeedPhotos((result) => {
        if (result.success) {
          // Update photos with latest data
          // Only update if not currently loading more
          if (!loadingMore) {
            setPhotos(result.photos);
          }
        } else {
          console.error('Feed subscription error:', result.error);
        }
      }, 20, friendUserIds, user.uid);
    }

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [enableRealtime, loadingMore, friendUserIds, user?.uid]);

  return {
    photos,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    loadMorePhotos,
    refreshFeed,
    updatePhotoInState,
  };
};

export default useFeedPhotos;
