import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import logger from '../utils/logger';
import { colors } from '../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 320; // Increased height for new button design

// Card dimensions for darkroom card stack (matching CameraScreen)
const CARD_WIDTH = 63;
const CARD_HEIGHT = 84;

// Base fanning values (at rest state)
const BASE_ROTATION_PER_CARD = 6;
const BASE_OFFSET_PER_CARD = 5;

// Swipe gesture constants
const SWIPE_THRESHOLD = 200; // Pixels to swipe for completion
const ARROW_SIZE = 24;

// Crescendo haptic configuration
const HAPTIC_CONFIG = {
  // 0-25%: Light every 400ms
  phase1: { style: Haptics.ImpactFeedbackStyle.Light, interval: 400 },
  // 25-50%: Light every 300ms
  phase2: { style: Haptics.ImpactFeedbackStyle.Light, interval: 300 },
  // 50-75%: Medium every 200ms
  phase3: { style: Haptics.ImpactFeedbackStyle.Medium, interval: 200 },
  // 75-100%: Heavy every 150ms
  phase4: { style: Haptics.ImpactFeedbackStyle.Heavy, interval: 150 },
};

// Colors - using design tokens from constants/colors.js
const COLORS = {
  sheetBackground: colors.background.secondary, // '#1A1A1A'
  textPrimary: colors.text.primary, // '#FFFFFF'
  textSecondary: colors.text.secondary, // '#888888'
  statusReady: colors.status.ready, // '#22C55E'
  statusDeveloping: colors.status.developing, // '#EF4444'
  cardBackground: colors.background.tertiary, // '#2A2A2A'
  cardBorder: 'rgba(255, 255, 255, 0.3)', // Keep as-is
  // Gradient colors from design tokens
  buttonGradientStart: colors.brand.gradient.button[0], // '#4C1D95'
  buttonGradientEnd: colors.brand.gradient.button[1], // '#7C3AED'
  fillGradientStart: colors.brand.gradient.fill[0], // '#6B21A8'
  fillGradientEnd: colors.brand.gradient.fill[1], // '#A855F7'
  // Hold button: purple anticipation → pink payoff
  buttonBase: colors.brand.gradient.revealed[0], // '#A855F7' (lighter purple)
  buttonFill: colors.brand.gradient.revealed[1], // '#F472B6' (pink)
};

// Arrow icon (chevron-right) for swipe affordance
const ArrowIcon = ({ color = COLORS.textPrimary }) => {
  return (
    <View style={styles.arrowContainer}>
      {/* Chevron right using border technique */}
      <View
        style={[
          styles.arrowChevron,
          {
            borderRightColor: color,
            borderBottomColor: color,
          },
        ]}
      />
    </View>
  );
};

const DarkroomBottomSheet = ({ visible, revealedCount, developingCount, onClose, onComplete }) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const progressValue = useRef(new Animated.Value(0)).current;
  const arrowTranslateX = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  // Haptic interval tracking
  const hapticIntervalRef = useRef(null);
  const lastHapticTimeRef = useRef(0);

  const totalCount = (revealedCount || 0) + (developingCount || 0);
  const hasRevealedPhotos = revealedCount > 0;

  // Animate sheet slide when visibility changes
  useEffect(() => {
    if (visible) {
      // Slide up when opening
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();

      logger.debug('DarkroomBottomSheet: Component mounted', {
        revealedCount,
        developingCount,
        totalCount,
        hasRevealedPhotos,
      });
    } else {
      // Reset to off-screen position when closed
      slideAnim.setValue(SHEET_HEIGHT);
    }

    return () => {
      // Clean up animations on unmount
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
        logger.debug('DarkroomBottomSheet: Component unmounted, haptics stopped');
      }
    };
  }, [visible, revealedCount, developingCount, totalCount, hasRevealedPhotos, slideAnim]);

  useEffect(() => {
    // Reset progress when modal visibility changes
    if (!visible) {
      progressValue.setValue(0);
      arrowTranslateX.setValue(0);
      setIsSwiping(false);
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
        hapticIntervalRef.current = null;
      }
    }
  }, [visible, progressValue, arrowTranslateX]);

  // Crescendo haptic feedback - triggers based on progress value
  const triggerCrescendoHaptic = progress => {
    const now = Date.now();
    let config;

    // Determine which phase we're in
    if (progress < 0.25) {
      config = HAPTIC_CONFIG.phase1;
    } else if (progress < 0.5) {
      config = HAPTIC_CONFIG.phase2;
    } else if (progress < 0.75) {
      config = HAPTIC_CONFIG.phase3;
    } else {
      config = HAPTIC_CONFIG.phase4;
    }

    // Check if enough time has passed for this phase's interval
    if (now - lastHapticTimeRef.current >= config.interval) {
      try {
        Haptics.impactAsync(config.style);
        lastHapticTimeRef.current = now;
        logger.debug('DarkroomBottomSheet: Crescendo haptic', {
          progress: (progress * 100).toFixed(0) + '%',
          style: config.style,
        });
      } catch (error) {
        logger.debug('DarkroomBottomSheet: Haptic failed', error);
      }
    }
  };

  const stopCrescendoHaptics = () => {
    if (hapticIntervalRef.current) {
      clearInterval(hapticIntervalRef.current);
      hapticIntervalRef.current = null;
    }
    progressValue.removeAllListeners();
  };

  // Handle swipe completion
  const handleSwipeComplete = () => {
    logger.info('DarkroomBottomSheet: Swipe completed', {
      revealedCount,
      developingCount,
    });

    // Stop haptics
    stopCrescendoHaptics();

    // Final success haptic
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      logger.info('DarkroomBottomSheet: Completion haptic triggered');
    } catch (error) {
      logger.debug('DarkroomBottomSheet: Completion haptic failed', error);
    }

    // Small delay to let user see full fill
    setTimeout(() => {
      // Reset state
      setIsSwiping(false);
      progressValue.setValue(0);
      arrowTranslateX.setValue(0);

      // Trigger completion callback
      if (onComplete) {
        onComplete();
      }
    }, 200);
  };

  // Handle swipe cancel (spring back)
  const handleSwipeCancel = () => {
    logger.debug('DarkroomBottomSheet: Swipe cancelled, springing back');

    // Stop haptics
    stopCrescendoHaptics();

    // Spring back to 0
    Animated.parallel([
      Animated.spring(progressValue, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: false,
      }),
      Animated.spring(arrowTranslateX, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    setIsSwiping(false);
  };

  // Pan gesture for swipe-to-reveal
  const panGesture = Gesture.Pan()
    .enabled(hasRevealedPhotos)
    .onStart(() => {
      setIsSwiping(true);
      lastHapticTimeRef.current = Date.now();
      logger.info('DarkroomBottomSheet: Swipe started', { revealedCount, developingCount });
    })
    .onUpdate(event => {
      // Only allow positive translation (left to right)
      const translationX = Math.max(0, event.translationX);

      // Calculate progress (0 to 1)
      const progress = Math.min(translationX / SWIPE_THRESHOLD, 1);

      // Update progress value for fill animation (non-native driver)
      progressValue.setValue(progress);

      // Update arrow position (native driver)
      arrowTranslateX.setValue(translationX);

      // Trigger crescendo haptics
      triggerCrescendoHaptic(progress);
    })
    .onEnd(event => {
      const translationX = Math.max(0, event.translationX);
      const velocityX = event.velocityX;

      // Complete if threshold reached OR high velocity
      if (translationX >= SWIPE_THRESHOLD || velocityX > 500) {
        // Animate to full completion
        Animated.parallel([
          Animated.timing(progressValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
          }),
          Animated.timing(arrowTranslateX, {
            toValue: SWIPE_THRESHOLD,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start(() => {
          handleSwipeComplete();
        });
      } else {
        handleSwipeCancel();
      }
    })
    .onFinalize(() => {
      // Cleanup on gesture termination
    });

  const handleBackdropPress = () => {
    logger.debug('DarkroomBottomSheet: Backdrop pressed, closing');
    if (onClose) {
      onClose();
    }
  };

  // Interpolate progress value to width percentage for fill animation
  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Render card stack (duplicated from CameraScreen's DarkroomCardButton)
  const renderCardStack = () => {
    const cardCount = Math.min(Math.max(totalCount, 1), 4);
    const cards = [];

    // Calculate center compensation
    const centerCompensation = ((cardCount - 1) * BASE_OFFSET_PER_CARD) / 2;
    const rotationCompensation = ((cardCount - 1) * BASE_ROTATION_PER_CARD) / 2;

    for (let i = 0; i < cardCount; i++) {
      const isTopCard = i === cardCount - 1;
      const positionFromTop = cardCount - 1 - i;

      // Base rotation and offset
      const baseRotation = positionFromTop * BASE_ROTATION_PER_CARD - rotationCompensation;
      const baseOffset = positionFromTop * BASE_OFFSET_PER_CARD - centerCompensation;

      cards.push(
        <View
          key={i}
          style={[
            styles.cardStackCard,
            {
              position: 'absolute',
              transform: [{ rotate: `${baseRotation}deg` }, { translateX: baseOffset }],
              zIndex: i + 1,
            },
          ]}
        >
          {isTopCard && (
            <Text style={styles.cardStackText}>{totalCount > 99 ? '99+' : totalCount}</Text>
          )}
        </View>
      );
    }

    return cards;
  };

  // Get status dot color and text
  const getStatusInfo = () => {
    if (hasRevealedPhotos) {
      const photoWord = revealedCount === 1 ? 'photo' : 'photos';
      return {
        color: COLORS.statusReady,
        text: `${revealedCount} ${photoWord} ready to reveal`,
      };
    }
    return {
      color: COLORS.statusDeveloping,
      text: 'Photos still developing',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleBackdropPress}>
      <GestureHandlerRootView style={styles.container}>
        {/* Backdrop - fades in with modal */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleBackdropPress} />

        {/* Bottom Sheet - slides up separately */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header Row - Title/Status on left, Card Stack on right */}
          <View style={styles.headerRow}>
            {/* Left side: Title and Status */}
            <View style={styles.headerLeft}>
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>Darkroom</Text>
                <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
              </View>
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>

            {/* Right side: Card Stack */}
            <View style={styles.cardStackContainer}>{renderCardStack()}</View>
          </View>

          {/* Swipe Button - only show if photos are ready */}
          {hasRevealedPhotos && (
            <GestureDetector gesture={panGesture}>
              <View style={styles.swipeButtonContainer}>
                {/* Base purple button */}
                <View style={styles.swipeButtonBase}>
                  {/* Fill overlay that animates left-to-right */}
                  <Animated.View
                    style={[
                      styles.fillOverlay,
                      { width: progressWidth, backgroundColor: COLORS.buttonFill },
                    ]}
                  />

                  {/* Button content */}
                  <View style={styles.swipeButtonContent}>
                    {/* Arrow icon that moves with swipe */}
                    <Animated.View
                      style={[
                        styles.arrowWrapper,
                        { transform: [{ translateX: arrowTranslateX }] },
                      ]}
                    >
                      <ArrowIcon />
                    </Animated.View>
                    <Text style={styles.swipeButtonText}>
                      {isSwiping ? 'Revealing...' : 'Swipe to reveal photos'}
                    </Text>
                  </View>
                </View>
              </View>
            </GestureDetector>
          )}

          {/* Message for developing photos */}
          {!hasRevealedPhotos && <Text style={styles.developingText}>Check back soon!</Text>}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sheet: {
    backgroundColor: COLORS.sheetBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
  },
  // Header row - flex row with title/status left, cards right
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginRight: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  // Card stack container
  cardStackContainer: {
    width: CARD_WIDTH + 20,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStackCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  cardStackText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Swipe button
  swipeButtonContainer: {
    width: '100%',
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  swipeButtonBase: {
    width: '100%',
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: COLORS.buttonBase, // Purple anticipation (#A855F7)
  },
  fillOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  swipeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  swipeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  // Arrow icon for swipe affordance
  arrowWrapper: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainer: {
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowChevron: {
    width: 10,
    height: 10,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  developingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
  },
});

export default DarkroomBottomSheet;
