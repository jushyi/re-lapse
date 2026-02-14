/**
 * useTabSwipeGesture hook
 *
 * Provides horizontal swipe gesture handling for tab navigation.
 * Enables users to swipe left/right to navigate between Feed, Camera, and Profile tabs.
 *
 * Features:
 * - Horizontal pan gesture detection with axis-locking
 * - Prevents conflicts with vertical scrolling in Feed/Profile
 * - Velocity and distance thresholds for reliable navigation
 * - Subtle visual feedback during gesture
 * - Edge detection (prevents navigation beyond first/last tab)
 */

import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

import logger from '../utils/logger';

// Thresholds for gesture detection
const HORIZONTAL_THRESHOLD = 80; // Minimum swipe distance (px)
const VELOCITY_THRESHOLD = 500; // Fast flick trigger (px/s)
const DIRECTION_LOCK_THRESHOLD = 10; // Axis lock sensitivity (px)

// Tab navigation order
const TAB_ORDER = ['Feed', 'Camera', 'Profile'];

/**
 * Custom hook for tab swipe gesture handling
 *
 * @param {object} params - Hook parameters
 * @param {string} params.currentTab - Current active tab name ('Feed', 'Camera', or 'Profile')
 * @param {object} params.navigation - React Navigation navigation object
 *
 * @returns {object} - Pan gesture and animated style
 */
const useTabSwipeGesture = ({ currentTab, navigation }) => {
  // Shared values for animation
  const translateX = useSharedValue(0);
  const gestureLock = useSharedValue(null);

  // Navigation handler (called from gesture worklet via runOnJS)
  const navigateToTab = useCallback(
    tabName => {
      logger.debug('Tab swipe navigation triggered', {
        from: currentTab,
        to: tabName,
      });
      navigation.navigate('MainTabs', { screen: tabName });
    },
    [currentTab, navigation]
  );

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      // Reset gesture lock at start of new gesture
      gestureLock.value = null;
    })
    .onUpdate(event => {
      'worklet';
      const { translationX: dx, translationY: dy } = event;

      // Axis locking - determine gesture direction on first significant movement
      if (!gestureLock.value) {
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > DIRECTION_LOCK_THRESHOLD) {
          // Lock to horizontal swipe
          gestureLock.value = 'horizontal';
          logger.debug('Gesture locked to horizontal', { dx, dy });
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > DIRECTION_LOCK_THRESHOLD / 2) {
          // Lock to vertical scroll (allow smaller threshold for vertical)
          gestureLock.value = 'vertical';
        }
      }

      // Only track horizontal swipes for visual feedback
      if (gestureLock.value === 'horizontal') {
        // Apply 30% of drag distance for subtle visual feedback
        translateX.value = dx * 0.3;
      }
    })
    .onEnd(event => {
      'worklet';
      const { translationX: dx, velocityX: vx } = event;

      // Spring back to original position
      translateX.value = withTiming(0, { duration: 200 });

      // Only process horizontal swipes
      if (gestureLock.value !== 'horizontal') {
        return;
      }

      const currentIndex = TAB_ORDER.indexOf(currentTab);

      // Swipe LEFT (negative dx) → navigate to next tab (right)
      if (
        (dx < -HORIZONTAL_THRESHOLD || vx < -VELOCITY_THRESHOLD) &&
        currentIndex < TAB_ORDER.length - 1
      ) {
        const nextTab = TAB_ORDER[currentIndex + 1];
        runOnJS(navigateToTab)(nextTab);
      }
      // Swipe RIGHT (positive dx) → navigate to previous tab (left)
      else if ((dx > HORIZONTAL_THRESHOLD || vx > VELOCITY_THRESHOLD) && currentIndex > 0) {
        const prevTab = TAB_ORDER[currentIndex - 1];
        runOnJS(navigateToTab)(prevTab);
      }
    });

  // Animated style for subtle horizontal slide during gesture
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { panGesture, animatedStyle };
};

export default useTabSwipeGesture;
