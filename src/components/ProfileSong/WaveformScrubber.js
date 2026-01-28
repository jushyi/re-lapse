/**
 * WaveformScrubber Component
 *
 * Displays audio waveform with dual-handle range selection.
 * Uses @simform_solutions/react-native-audio-waveform for visualization
 * and custom range overlay for start/end selection.
 *
 * Features:
 * - Waveform visualization (native module)
 * - Draggable start and end handles
 * - Visual feedback for selected range
 * - Time display for handles
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Waveform } from '@simform_solutions/react-native-audio-waveform';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';

const MIN_CLIP_GAP = 5; // Minimum 5 seconds between start and end
const HANDLE_WIDTH = 4;
const HANDLE_TOUCH_SIZE = 40;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_WIDTH = SCREEN_WIDTH - 64; // Account for padding

/**
 * Format seconds to MM:SS display
 */
const formatTime = seconds => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const WaveformScrubber = ({
  audioPath,
  initialStart = 0,
  initialEnd = 30,
  duration = 30,
  onRangeChange,
  containerWidth = DEFAULT_WIDTH,
}) => {
  // Range state
  const [startSec, setStartSec] = useState(initialStart);
  const [endSec, setEndSec] = useState(initialEnd);

  // Track waveform ready state
  const [waveformReady, setWaveformReady] = useState(false);

  // Animated values for handle positions (in pixels)
  const startX = useSharedValue((initialStart / duration) * containerWidth);
  const endX = useSharedValue((initialEnd / duration) * containerWidth);

  // Context for gesture tracking
  const startContext = useSharedValue(0);
  const endContext = useSharedValue(0);

  // Waveform ref
  const waveformRef = useRef(null);

  // Convert pixels to seconds
  const pixelsToSeconds = useCallback(
    px => {
      return (px / containerWidth) * duration;
    },
    [containerWidth, duration]
  );

  // Convert seconds to pixels
  const secondsToPixels = useCallback(
    sec => {
      return (sec / duration) * containerWidth;
    },
    [containerWidth, duration]
  );

  // Update state from animated values (run on JS thread)
  const updateStartState = useCallback(
    px => {
      const sec = pixelsToSeconds(px);
      setStartSec(Math.max(0, Math.min(sec, duration)));
    },
    [pixelsToSeconds, duration]
  );

  const updateEndState = useCallback(
    px => {
      const sec = pixelsToSeconds(px);
      setEndSec(Math.max(0, Math.min(sec, duration)));
    },
    [pixelsToSeconds, duration]
  );

  // Notify parent of range change
  const notifyRangeChange = useCallback(() => {
    if (onRangeChange) {
      onRangeChange(startSec, endSec);
    }
  }, [onRangeChange, startSec, endSec]);

  // Notify when either value changes
  useEffect(() => {
    notifyRangeChange();
  }, [startSec, endSec, notifyRangeChange]);

  // Start handle gesture
  const startPanGesture = Gesture.Pan()
    .onBegin(() => {
      startContext.value = startX.value;
    })
    .onUpdate(e => {
      const newX = startContext.value + e.translationX;
      const maxX = endX.value - secondsToPixels(MIN_CLIP_GAP);
      const clampedX = Math.min(Math.max(0, newX), maxX);
      startX.value = clampedX;
      runOnJS(updateStartState)(clampedX);
    })
    .onEnd(() => {
      // Snap to nearest position
      startX.value = withSpring(startX.value, { damping: 15 });
    });

  // End handle gesture
  const endPanGesture = Gesture.Pan()
    .onBegin(() => {
      endContext.value = endX.value;
    })
    .onUpdate(e => {
      const newX = endContext.value + e.translationX;
      const minX = startX.value + secondsToPixels(MIN_CLIP_GAP);
      const clampedX = Math.max(minX, Math.min(newX, containerWidth));
      endX.value = clampedX;
      runOnJS(updateEndState)(clampedX);
    })
    .onEnd(() => {
      // Snap to nearest position
      endX.value = withSpring(endX.value, { damping: 15 });
    });

  // Animated styles for handles
  const startHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: startX.value - HANDLE_WIDTH / 2 }],
  }));

  const endHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: endX.value - HANDLE_WIDTH / 2 }],
  }));

  // Animated style for left dimmed region
  const leftDimStyle = useAnimatedStyle(() => ({
    width: startX.value,
  }));

  // Animated style for right dimmed region
  const rightDimStyle = useAnimatedStyle(() => ({
    width: containerWidth - endX.value,
    right: 0,
  }));

  // Handle waveform ready
  const handleWaveformReady = useCallback(() => {
    setWaveformReady(true);
  }, []);

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      {/* Waveform visualization */}
      <View style={styles.waveformContainer}>
        <Waveform
          ref={waveformRef}
          mode="static"
          path={audioPath}
          candleSpace={2}
          candleWidth={3}
          candleHeightScale={4}
          containerStyle={styles.waveform}
          waveColor={colors.text.tertiary}
          scrubColor={colors.text.primary}
          onPanStateChange={handleWaveformReady}
        />

        {/* Range selection overlay */}
        <View style={styles.overlayContainer}>
          {/* Left dimmed region */}
          <Animated.View style={[styles.dimRegion, styles.dimRegionLeft, leftDimStyle]} />

          {/* Right dimmed region */}
          <Animated.View style={[styles.dimRegion, styles.dimRegionRight, rightDimStyle]} />

          {/* Start handle */}
          <GestureDetector gesture={startPanGesture}>
            <Animated.View style={[styles.handleContainer, startHandleStyle]}>
              <View style={styles.handle} />
              <View style={styles.handleKnob} />
            </Animated.View>
          </GestureDetector>

          {/* End handle */}
          <GestureDetector gesture={endPanGesture}>
            <Animated.View style={[styles.handleContainer, endHandleStyle]}>
              <View style={styles.handle} />
              <View style={styles.handleKnob} />
            </Animated.View>
          </GestureDetector>
        </View>
      </View>

      {/* Time labels */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>{formatTime(startSec)}</Text>
        <Text style={styles.timeLabelDuration}>{formatTime(endSec - startSec)} selected</Text>
        <Text style={styles.timeLabel}>{formatTime(endSec)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  waveformContainer: {
    height: 80,
    position: 'relative',
  },
  waveform: {
    height: 80,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dimRegion: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.background.primary,
    opacity: 0.7,
  },
  dimRegionLeft: {
    left: 0,
  },
  dimRegionRight: {
    // width set by animated style
  },
  handleContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: HANDLE_TOUCH_SIZE,
    marginLeft: -HANDLE_TOUCH_SIZE / 2 + HANDLE_WIDTH / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handle: {
    width: HANDLE_WIDTH,
    height: '100%',
    backgroundColor: colors.brand.purple,
    borderRadius: HANDLE_WIDTH / 2,
  },
  handleKnob: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand.purple,
    borderWidth: 2,
    borderColor: colors.text.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  timeLabelDuration: {
    fontSize: 12,
    color: colors.brand.purple,
    fontWeight: '600',
  },
});

export default WaveformScrubber;
