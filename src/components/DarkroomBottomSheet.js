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
import * as Haptics from 'expo-haptics';
import logger from '../utils/logger';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 280; // Adjusted height for new layout

// Card dimensions for darkroom card stack (matching CameraScreen)
const CARD_WIDTH = 63;
const CARD_HEIGHT = 84;

// Base fanning values (at rest state)
const BASE_ROTATION_PER_CARD = 6;
const BASE_OFFSET_PER_CARD = 5;

// Colors
const COLORS = {
  sheetBackground: '#1A1A1A',
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  statusReady: '#22C55E',
  statusDeveloping: '#EF4444',
  cardBackground: '#2A2A2A',
  cardBorder: 'rgba(255, 255, 255, 0.3)',
  progressBackground: '#333333',
  progressFill: '#007AFF',
};

const DarkroomBottomSheet = ({ visible, revealedCount, developingCount, onClose, onComplete }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [hapticTriggered, setHapticTriggered] = useState({
    25: false,
    50: false,
    75: false,
    100: false,
  });
  const progressValue = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(null);
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

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
      // Clean up animation on unmount
      if (progressAnimation.current) {
        progressAnimation.current.stop();
        logger.debug('DarkroomBottomSheet: Component unmounted, animation stopped');
      }
    };
  }, [visible, revealedCount, developingCount, totalCount, hasRevealedPhotos, slideAnim]);

  useEffect(() => {
    // Reset progress when modal visibility changes
    if (!visible) {
      progressValue.setValue(0);
      setIsPressing(false);
      setHapticTriggered({ 25: false, 50: false, 75: false, 100: false });
    }
  }, [visible, progressValue]);

  // Haptic feedback listener
  useEffect(() => {
    const listener = progressValue.addListener(({ value }) => {
      // Trigger haptics at milestones
      if (value >= 0.25 && !hapticTriggered[25]) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setHapticTriggered(prev => ({ ...prev, 25: true }));
          logger.debug('DarkroomBottomSheet: Haptic at 25%');
        } catch (error) {
          logger.debug('DarkroomBottomSheet: Haptic failed at 25%', error);
        }
      }
      if (value >= 0.50 && !hapticTriggered[50]) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setHapticTriggered(prev => ({ ...prev, 50: true }));
          logger.debug('DarkroomBottomSheet: Haptic at 50%');
        } catch (error) {
          logger.debug('DarkroomBottomSheet: Haptic failed at 50%', error);
        }
      }
      if (value >= 0.75 && !hapticTriggered[75]) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setHapticTriggered(prev => ({ ...prev, 75: true }));
          logger.debug('DarkroomBottomSheet: Haptic at 75%');
        } catch (error) {
          logger.debug('DarkroomBottomSheet: Haptic failed at 75%', error);
        }
      }
      if (value >= 1.0 && !hapticTriggered[100]) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setHapticTriggered(prev => ({ ...prev, 100: true }));
          logger.info('DarkroomBottomSheet: Haptic at 100% (completion)');
        } catch (error) {
          logger.debug('DarkroomBottomSheet: Haptic failed at 100%', error);
        }
      }
    });

    return () => progressValue.removeListener(listener);
  }, [progressValue, hapticTriggered]);

  const handlePressIn = () => {
    if (!visible || !hasRevealedPhotos) {
      logger.debug('DarkroomBottomSheet: Press-and-hold blocked (no revealed photos)', {
        hasRevealedPhotos,
        revealedCount,
        developingCount,
      });
      return;
    }

    setIsPressing(true);
    setHapticTriggered({ 25: false, 50: false, 75: false, 100: false });
    logger.info('DarkroomBottomSheet: Press-and-hold started', { revealedCount, developingCount });

    // Animate from 0 to 1 over 2 seconds
    progressAnimation.current = Animated.timing(progressValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    });

    progressAnimation.current.start(({ finished }) => {
      if (finished) {
        logger.debug('DarkroomBottomSheet: Progress reached 100%');
        logger.info('DarkroomBottomSheet: Press-and-hold completed', { revealedCount, developingCount });

        // Small delay to let user see full bar
        setTimeout(() => {
          // Reset state
          setIsPressing(false);
          progressValue.setValue(0);

          // Trigger completion callback
          if (onComplete) {
            onComplete();
          }
        }, 200);
      }
    });
  };

  const handlePressOut = () => {
    if (!isPressing) return;

    logger.debug('DarkroomBottomSheet: Press released before completion');

    // Stop current animation
    if (progressAnimation.current) {
      progressAnimation.current.stop();
    }

    // Spring back to 0
    Animated.spring(progressValue, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();

    setIsPressing(false);
  };

  const handleBackdropPress = () => {
    logger.debug('DarkroomBottomSheet: Backdrop pressed, closing');
    if (onClose) {
      onClose();
    }
  };

  // Interpolate progress value to width percentage
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
      const baseRotation = (positionFromTop * BASE_ROTATION_PER_CARD) - rotationCompensation;
      const baseOffset = (positionFromTop * BASE_OFFSET_PER_CARD) - centerCompensation;

      cards.push(
        <View
          key={i}
          style={[
            styles.cardStackCard,
            {
              position: 'absolute',
              transform: [
                { rotate: `${baseRotation}deg` },
                { translateX: baseOffset },
              ],
              zIndex: i + 1,
            },
          ]}
        >
          {isTopCard && (
            <Text style={styles.cardStackText}>
              {totalCount > 99 ? '99+' : totalCount}
            </Text>
          )}
        </View>
      );
    }

    return cards;
  };

  // Get status dot color and text
  const getStatusInfo = () => {
    if (hasRevealedPhotos) {
      return {
        color: COLORS.statusReady,
        text: `(${revealedCount}) ready to reveal`,
      };
    }
    return {
      color: COLORS.statusDeveloping,
      text: 'Photos still developing',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleBackdropPress}
    >
      <View style={styles.container}>
        {/* Backdrop - fades in with modal */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />

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
            <View style={styles.cardStackContainer}>
              {renderCardStack()}
            </View>
          </View>

          {/* Progress Bar Container - only show if photos are ready */}
          {hasRevealedPhotos && (
            <View
              style={styles.progressContainer}
              onStartShouldSetResponder={() => true}
              onResponderGrant={handlePressIn}
              onResponderRelease={handlePressOut}
            >
              <View style={styles.progressBackground}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressWidth,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {isPressing ? 'Hold...' : 'Tap and hold'}
              </Text>
            </View>
          )}

          {/* Message for developing photos */}
          {!hasRevealedPhotos && (
            <Text style={styles.developingText}>
              Check back soon!
            </Text>
          )}
        </Animated.View>
      </View>
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
  // Progress bar
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  progressBackground: {
    width: '100%',
    height: 12,
    backgroundColor: COLORS.progressBackground,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.progressFill,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
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
