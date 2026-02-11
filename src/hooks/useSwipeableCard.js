/**
 * useSwipeableCard hook
 *
 * Extracted from SwipeablePhotoCard.js as part of three-way separation refactoring.
 * Contains all stateful logic, animated values, gesture handling, and imperative methods.
 *
 * Features:
 * - Arc motion: Card curves downward as it moves horizontally (like flicking from wrist)
 * - Rotation: Card tilts in direction of swipe
 * - On-card overlays: Color overlays with icons fade in during swipe
 * - Three-stage haptic feedback: threshold, release, completion
 * - Spring-back animation when threshold not met
 * - Imperative methods for button-triggered animations
 */

import { useState, useCallback, useEffect, useImperativeHandle } from 'react';
import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import logger from '../utils/logger';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Thresholds for action triggers
const HORIZONTAL_THRESHOLD = 100;
// Delete overlay threshold (used for button-triggered animation overlay only)
const DELETE_OVERLAY_THRESHOLD = 150;

// Exit animation duration
const EXIT_DURATION = 800;

// Button-triggered animations use slower duration for satisfying pace
// Swipe gestures have natural lead-in time from drag, but button taps are instant
const BUTTON_EXIT_DURATION = 800;

// Delay for front card transition gives exiting card time to clear
const CASCADE_DELAY_MS = 0;

// Clearance delay - time before cascade animation triggers
// 100ms gives instant feel while allowing exit animation to start
const SWIPE_CLEARANCE_DELAY = 100;
const BUTTON_CLEARANCE_DELAY = 100;

// Fade-in duration for new cards entering the visible stack
const STACK_ENTRY_FADE_DURATION = 300;

// Entry animation duration for undo
const ENTRY_DURATION = 400;

/**
 * Get scale factor for card at given stack position.
 * @param {number} idx - Stack index (0=front, 1=behind, 2=furthest back)
 * @returns {number} Scale factor (1, 0.96, or 0.92)
 */
const getStackScale = idx => (idx === 0 ? 1 : idx === 1 ? 0.96 : 0.92);

/**
 * Get Y offset for card at given stack position.
 * Negative values mean cards peek from top (above front card).
 * @param {number} idx - Stack index (0=front, 1=behind, 2=furthest back)
 * @returns {number} Y offset in pixels (0, -20, or -40)
 */
const getStackOffset = idx => (idx === 0 ? 0 : idx === 1 ? -20 : -40);

/**
 * Get opacity for card at given stack position.
 * @param {number} idx - Stack index (0=front, 1=behind, 2=furthest back)
 * @returns {number} Opacity value (1, 0.85, or 0.7)
 */
const getStackOpacity = idx => (idx === 0 ? 1 : idx === 1 ? 0.85 : 0.7);

/**
 * Custom hook for swipeable photo card logic
 *
 * @param {object} params - Hook parameters
 * @param {object} params.photo - Photo object to display
 * @param {function} params.onSwipeLeft - Callback when Archive action triggered (left swipe or button)
 * @param {function} params.onSwipeRight - Callback when Journal action triggered (right swipe or button)
 * @param {function} params.onSwipeDown - Callback when Delete action triggered (button only)
 * @param {function} params.onDeleteComplete - Callback when delete animation completes
 * @param {function} params.onExitClearance - Callback when card has cleared enough for cascade
 * @param {number} params.stackIndex - Position in the stack (0=front, 1=behind, 2=furthest back)
 * @param {boolean} params.isActive - Whether this card is swipeable (only front card)
 * @param {string} params.enterFrom - Direction for entry animation ('left', 'right', 'down', or null)
 * @param {boolean} params.isNewlyVisible - Whether card is newly entering visible stack
 * @param {React.Ref} params.ref - Ref for imperative methods
 *
 * @returns {object} - Animated styles, gesture handler, and state
 */
const useSwipeableCard = ({
  photo,
  onSwipeLeft,
  onSwipeRight,
  onSwipeDown,
  onDeleteComplete,
  onExitClearance,
  stackIndex = 0,
  isActive = true,
  enterFrom = null,
  isNewlyVisible = false,
  ref,
}) => {
  const [thresholdTriggered, setThresholdTriggered] = useState(false);

  // Animated values for gesture/front card
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  // Scale for delete suction animation (card shrinks as it gets sucked into delete button)
  const cardScale = useSharedValue(1);

  // Track if this card has completed its entry animation
  // Used to detect when a card is newly entering the visible stack
  const hasAnimatedEntry = useSharedValue(false);

  // Animated values for smooth stack cascade animation
  // These animate when stackIndex changes (card moves forward in stack)
  // Start newly visible cards at opacity 0 for fade-in effect
  const initialOpacity =
    isNewlyVisible && !hasAnimatedEntry.value ? 0 : getStackOpacity(stackIndex);
  const stackScaleAnim = useSharedValue(getStackScale(stackIndex));
  const stackOffsetAnim = useSharedValue(getStackOffset(stackIndex));
  const stackOpacityAnim = useSharedValue(initialOpacity);

  // Consolidated animation - stackIndex useEffect is the SINGLE source of truth
  // Removed dual-animation approach that caused race condition (cascade interrupted by stackIndex useEffect)
  const prevStackIndex = useSharedValue(stackIndex);

  // Track whether card is transitioning to front position
  // When a card becomes isActive=true, the cardStyle switches from using stackOffsetAnim to translateX/Y
  // We need to continue using stackOffsetAnim during the transition animation, not switch immediately
  // This shared value is 1 during transition, 0 when complete
  const isTransitioningToFront = useSharedValue(0);

  // Track if action is in progress to prevent multiple triggers
  const actionInProgress = useSharedValue(false);

  // Track when delete is button-triggered (vs gesture swipe)
  // Delete overlay should only show during button-triggered delete animation
  const isButtonDelete = useSharedValue(false);

  // Context for gesture start position
  const startX = useSharedValue(0);

  // Stack index animation effect
  useEffect(() => {
    // Only animate if stackIndex actually changed
    if (prevStackIndex.value === stackIndex) {
      return;
    }

    const movingToFront = stackIndex === 0 && prevStackIndex.value > 0;

    // Use timing animation for predictable, smooth motion
    const config = {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    };

    if (movingToFront) {
      // Mark as transitioning so cardStyle continues using stackOffsetAnim
      isTransitioningToFront.value = 1;

      // Card becoming front - add delay to let exiting card clear
      stackScaleAnim.value = withDelay(
        CASCADE_DELAY_MS,
        withTiming(getStackScale(stackIndex), config)
      );
      stackOffsetAnim.value = withDelay(
        CASCADE_DELAY_MS,
        withTiming(getStackOffset(stackIndex), config)
      );
      stackOpacityAnim.value = withDelay(
        CASCADE_DELAY_MS,
        withTiming(getStackOpacity(stackIndex), config, () => {
          'worklet';
          // Animation complete - clear transition flag
          isTransitioningToFront.value = 0;
        })
      );
    } else {
      // Other transitions - animate immediately
      stackScaleAnim.value = withTiming(getStackScale(stackIndex), config);
      stackOffsetAnim.value = withTiming(getStackOffset(stackIndex), config);
      stackOpacityAnim.value = withTiming(getStackOpacity(stackIndex), config);
    }

    prevStackIndex.value = stackIndex;
  }, [stackIndex]);

  // Fade-in animation for newly visible cards entering the stack
  useEffect(() => {
    if (isNewlyVisible && !hasAnimatedEntry.value && stackIndex === 2) {
      logger.debug('useSwipeableCard: New card entering visible stack, starting fade-in', {
        photoId: photo?.id,
        stackIndex,
      });

      // Start at 0 opacity and animate to target
      stackOpacityAnim.value = 0;
      stackOpacityAnim.value = withTiming(getStackOpacity(stackIndex), {
        duration: STACK_ENTRY_FADE_DURATION,
        easing: Easing.out(Easing.cubic),
      });

      // Mark as animated so we don't re-trigger
      hasAnimatedEntry.value = true;
    }
  }, [isNewlyVisible, stackIndex]);

  // Entry animation for undo (reverse of exit animation)
  useEffect(() => {
    if (enterFrom && isActive) {
      // Start card off-screen in the direction it exited
      if (enterFrom === 'left') {
        translateX.value = -SCREEN_WIDTH * 1.5;
        translateY.value = SCREEN_HEIGHT * 0.5;
      } else if (enterFrom === 'right') {
        translateX.value = SCREEN_WIDTH * 1.5;
        translateY.value = SCREEN_HEIGHT * 0.5;
      } else if (enterFrom === 'down') {
        translateX.value = 0;
        translateY.value = SCREEN_HEIGHT;
      }

      // Animate to center position
      translateX.value = withTiming(0, {
        duration: ENTRY_DURATION,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: ENTRY_DURATION,
        easing: Easing.out(Easing.cubic),
      });

      logger.debug('useSwipeableCard: Entry animation started', {
        photoId: photo?.id,
        enterFrom,
      });
    }
  }, [enterFrom, isActive]);

  // Haptic feedback helpers
  const triggerLightHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const triggerMediumHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const triggerHeavyHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  }, []);

  const triggerWarningHaptic = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }, []);

  // Reset threshold state
  const resetThreshold = useCallback(() => {
    setThresholdTriggered(false);
  }, []);

  // Schedule clearance callback with delay (called via runOnJS from worklet)
  const scheduleClearanceCallback = useCallback(
    delay => {
      if (onExitClearance) {
        setTimeout(() => {
          onExitClearance();
        }, delay);
      }
    },
    [onExitClearance]
  );

  // Mark threshold as triggered
  const markThresholdTriggered = useCallback(() => {
    if (!thresholdTriggered) {
      setThresholdTriggered(true);
      triggerLightHaptic();
      logger.debug('useSwipeableCard: Threshold reached', { photoId: photo?.id });
    }
  }, [thresholdTriggered, triggerLightHaptic, photo?.id]);

  // Action handlers
  const handleArchive = useCallback(async () => {
    logger.info('useSwipeableCard: Archive action triggered', { photoId: photo?.id });
    triggerMediumHaptic();
    if (onSwipeLeft) {
      await onSwipeLeft();
    }
    triggerHeavyHaptic();
  }, [photo?.id, onSwipeLeft, triggerMediumHaptic, triggerHeavyHaptic]);

  const handleJournal = useCallback(async () => {
    logger.info('useSwipeableCard: Journal action triggered', { photoId: photo?.id });
    triggerMediumHaptic();
    if (onSwipeRight) {
      await onSwipeRight();
    }
    triggerHeavyHaptic();
  }, [photo?.id, onSwipeRight, triggerMediumHaptic, triggerHeavyHaptic]);

  const handleDelete = useCallback(async () => {
    logger.info('useSwipeableCard: Delete action triggered', { photoId: photo?.id });
    triggerWarningHaptic();
    if (onSwipeDown) {
      await onSwipeDown();
    }
    triggerHeavyHaptic();
  }, [photo?.id, onSwipeDown, triggerWarningHaptic, triggerHeavyHaptic]);

  // Imperative methods for button-triggered animations
  useImperativeHandle(
    ref,
    () => ({
      /**
       * Trigger archive animation (left exit with arc).
       * Called when user taps the archive button.
       * @returns {void}
       */
      triggerArchive: () => {
        if (actionInProgress.value) return;
        logger.info('useSwipeableCard: triggerArchive called', { photoId: photo?.id });
        actionInProgress.value = true;
        // Fire clearance callback early to trigger cascade while card still visible
        if (onExitClearance) {
          setTimeout(() => {
            onExitClearance();
          }, BUTTON_CLEARANCE_DELAY);
        }
        // Animate to archive position (arc to bottom-left)
        translateX.value = withTiming(
          -SCREEN_WIDTH * 1.5,
          {
            duration: BUTTON_EXIT_DURATION,
            easing: Easing.out(Easing.cubic),
          },
          () => {
            'worklet';
            runOnJS(handleArchive)();
          }
        );
        translateY.value = withTiming(SCREEN_HEIGHT * 0.5, {
          duration: BUTTON_EXIT_DURATION,
          easing: Easing.out(Easing.cubic),
        });
      },
      /**
       * Trigger journal animation (right exit with arc).
       * Called when user taps the journal button.
       * @returns {void}
       */
      triggerJournal: () => {
        if (actionInProgress.value) return;
        logger.info('useSwipeableCard: triggerJournal called', { photoId: photo?.id });
        actionInProgress.value = true;
        // Fire clearance callback early to trigger cascade while card still visible
        if (onExitClearance) {
          setTimeout(() => {
            onExitClearance();
          }, BUTTON_CLEARANCE_DELAY);
        }
        // Animate to journal position (arc to bottom-right)
        translateX.value = withTiming(
          SCREEN_WIDTH * 1.5,
          {
            duration: BUTTON_EXIT_DURATION,
            easing: Easing.out(Easing.cubic),
          },
          () => {
            'worklet';
            runOnJS(handleJournal)();
          }
        );
        translateY.value = withTiming(SCREEN_HEIGHT * 0.5, {
          duration: BUTTON_EXIT_DURATION,
          easing: Easing.out(Easing.cubic),
        });
      },
      /**
       * Trigger delete animation (suction effect toward delete button).
       * Card shrinks while moving toward button position.
       * @returns {void}
       */
      triggerDelete: () => {
        if (actionInProgress.value) return;
        logger.info('useSwipeableCard: triggerDelete called', { photoId: photo?.id });
        actionInProgress.value = true;
        isButtonDelete.value = true;

        const SUCTION_DURATION = 450;

        cardScale.value = withTiming(
          0.1,
          {
            duration: SUCTION_DURATION,
            easing: Easing.in(Easing.cubic),
          },
          () => {
            'worklet';
            if (onDeleteComplete) {
              runOnJS(onDeleteComplete)();
            }
            runOnJS(handleDelete)();
          }
        );

        translateY.value = withTiming(SCREEN_HEIGHT * 0.35, {
          duration: SUCTION_DURATION,
          easing: Easing.in(Easing.cubic),
        });

        translateX.value = withTiming(0, {
          duration: SUCTION_DURATION,
          easing: Easing.in(Easing.cubic),
        });
      },
    }),
    [
      photo?.id,
      actionInProgress,
      isButtonDelete,
      translateX,
      translateY,
      cardScale,
      handleArchive,
      handleJournal,
      handleDelete,
      onDeleteComplete,
      onExitClearance,
    ]
  );

  // Pan gesture using new Gesture API
  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startX.value = translateX.value;
      runOnJS(resetThreshold)();
    })
    .onUpdate(event => {
      'worklet';
      translateX.value = startX.value + event.translationX;

      const absX = Math.abs(translateX.value);

      if (absX > HORIZONTAL_THRESHOLD) {
        runOnJS(markThresholdTriggered)();
      }
    })
    .onEnd(event => {
      'worklet';
      if (actionInProgress.value) return;

      const velocityX = event.velocityX;

      const isLeftSwipe = translateX.value < -HORIZONTAL_THRESHOLD || velocityX < -500;
      const isRightSwipe = translateX.value > HORIZONTAL_THRESHOLD || velocityX > 500;

      if (isLeftSwipe) {
        actionInProgress.value = true;
        runOnJS(scheduleClearanceCallback)(SWIPE_CLEARANCE_DELAY);
        translateX.value = withTiming(
          -SCREEN_WIDTH * 1.5,
          {
            duration: EXIT_DURATION,
            easing: Easing.out(Easing.cubic),
          },
          () => {
            'worklet';
            runOnJS(handleArchive)();
          }
        );
        translateY.value = withTiming(SCREEN_HEIGHT * 0.5, {
          duration: EXIT_DURATION,
          easing: Easing.out(Easing.cubic),
        });
      } else if (isRightSwipe) {
        actionInProgress.value = true;
        runOnJS(scheduleClearanceCallback)(SWIPE_CLEARANCE_DELAY);
        translateX.value = withTiming(
          SCREEN_WIDTH * 1.5,
          {
            duration: EXIT_DURATION,
            easing: Easing.out(Easing.cubic),
          },
          () => {
            'worklet';
            runOnJS(handleJournal)();
          }
        );
        translateY.value = withTiming(SCREEN_HEIGHT * 0.5, {
          duration: EXIT_DURATION,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        runOnJS(resetThreshold)();
      }
    });

  // Animated card style with arc motion, rotation, and stack transforms
  const cardStyle = useAnimatedStyle(() => {
    const normalizedX = Math.abs(translateX.value) / (SCREEN_WIDTH * 1.5);
    const curveProgress = Math.pow(normalizedX, 2.5);
    const arcY = SCREEN_HEIGHT * 0.5 * curveProgress;

    const rotation = isActive ? translateX.value / 15 : 0;

    const actionActive = actionInProgress.value;

    const useStackAnimation = !actionActive && (isTransitioningToFront.value === 1 || !isActive);

    if (useStackAnimation) {
      return {
        transform: [
          { translateX: 0 },
          { translateY: stackOffsetAnim.value },
          { rotate: '0deg' },
          { scale: stackScaleAnim.value },
        ],
        opacity: stackOpacityAnim.value,
      };
    } else {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value + arcY },
          { rotate: `${rotation}deg` },
          { scale: cardScale.value },
        ],
        opacity: cardOpacity.value,
      };
    }
  });

  // Archive overlay (left swipe) - gray with box icon
  const archiveOverlayStyle = useAnimatedStyle(() => {
    const opacity =
      translateX.value < 0
        ? interpolate(Math.abs(translateX.value), [0, HORIZONTAL_THRESHOLD], [0, 0.7], 'clamp')
        : 0;

    return {
      opacity,
    };
  });

  // Journal overlay (right swipe) - green with checkmark icon
  const journalOverlayStyle = useAnimatedStyle(() => {
    const opacity =
      translateX.value > 0
        ? interpolate(translateX.value, [0, HORIZONTAL_THRESHOLD], [0, 0.7], 'clamp')
        : 0;

    return {
      opacity,
    };
  });

  // Delete overlay (button-triggered animation) - red with X icon
  const deleteOverlayStyle = useAnimatedStyle(() => {
    if (!isButtonDelete.value) return { opacity: 0 };

    const opacity =
      translateY.value > 0
        ? interpolate(translateY.value, [0, DELETE_OVERLAY_THRESHOLD], [0, 0.7], 'clamp')
        : 0;

    return {
      opacity,
    };
  });

  return {
    // Animated styles
    cardStyle,
    archiveOverlayStyle,
    journalOverlayStyle,
    deleteOverlayStyle,
    // Gesture handler
    panGesture,
    // State
    isActive,
    stackIndex,
  };
};

export default useSwipeableCard;
