/**
 * TabScreenWrapper
 *
 * Wraps tab screens with horizontal swipe gesture detection.
 * Enables navigation between tabs via swipe gestures while preserving
 * vertical scrolling functionality in Feed and Profile screens.
 */

import React from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

import useTabSwipeGesture from '../hooks/useTabSwipeGesture';

/**
 * TabScreenWrapper Component
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Tab screen content to wrap
 * @param {string} props.currentTab - Current tab name ('Feed', 'Camera', or 'Profile')
 *
 * @returns {React.ReactElement} - Wrapped tab screen with gesture detection
 */
const TabScreenWrapper = ({ children, currentTab }) => {
  const navigation = useNavigation();

  // Get pan gesture and animated style from hook
  const { panGesture, animatedStyle } = useTabSwipeGesture({
    currentTab,
    navigation,
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
};

export default TabScreenWrapper;
