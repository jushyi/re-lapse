/**
 * PixelDissolveOverlay - Retro pixel shatter effect for delete animation
 *
 * Renders a grid of colored pixel blocks that scatter and fall when triggered,
 * creating a retro game "enemy death" dissolve effect.
 *
 * The overlay reads a shared `dissolveProgress` value (0→1) and each block
 * computes its own stagger, drift, fall, and fade from that single driver.
 *
 * @param {SharedValue} dissolveProgress - Reanimated shared value driving the animation (0→1)
 */

import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLS = 6;
const ROWS = 8;

// White glow palette — bright whites with subtle cool tints
const PIXEL_COLORS = [
  '#FFFFFF', // pure white
  '#F0F0FF', // cool white
  '#E8E8FF', // light blue-white
  '#FFFFFF', // pure white (weighted)
  '#F5F5FF', // near-white
  '#FFFFFF', // pure white (weighted)
  '#E0E0F0', // phosphor white
  '#D0D0FF', // soft blue-white glow
];

// Deterministic pseudo-random from seed
const pseudoRandom = seed => {
  const x = Math.sin(seed * 9.1 + 7.3) * 43758.5453;
  return x - Math.floor(x);
};

// Pre-compute block configs at module level (stable across renders)
const BLOCK_CONFIGS = [];
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const seed = row * COLS + col;
    const rand1 = pseudoRandom(seed);
    const rand2 = pseudoRandom(seed + 100);
    const rand3 = pseudoRandom(seed + 200);
    const rand4 = pseudoRandom(seed + 300);

    BLOCK_CONFIGS.push({
      row,
      col,
      // Position as percentage of card
      leftPct: (col / COLS) * 100,
      topPct: (row / ROWS) * 100,
      widthPct: 100 / COLS,
      heightPct: 100 / ROWS,
      // Scatter params — fast confetti drop (mostly downward, light drift)
      driftX: (rand1 - 0.5) * 60,
      // Top rows fall further (and thus faster) so all pixels collect at the bottom
      // Row 0 (top) gets 1.8x distance, row 7 (bottom) gets 1.0x
      fallDistance:
        (SCREEN_HEIGHT * 0.5 + rand2 * SCREEN_HEIGHT * 0.3) * (1 + (1 - row / (ROWS - 1)) * 0.8),
      rotation: (rand4 - 0.5) * 20,
      // Stagger: tight spread so all blocks burst together like confetti
      staggerNorm: (row * 20 + rand3 * 30) / (ROWS * 20 + 30),
      color: PIXEL_COLORS[seed % PIXEL_COLORS.length],
    });
  }
}

/**
 * Individual pixel block that reads dissolveProgress and computes its animation.
 * Memoized to avoid re-renders — animation is driven entirely by shared value on UI thread.
 */
const PixelBlock = memo(({ config, dissolveProgress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const p = dissolveProgress.value;

    if (p <= 0) return { opacity: 0 };

    // Tight stagger — all blocks burst out nearly together
    const blockStart = config.staggerNorm * 0.15;
    const blockProgress = Math.max(0, Math.min(1, (p - blockStart) / (1 - blockStart)));

    if (blockProgress <= 0) return { opacity: 0 };

    // Appear instantly (first 5% of block's animation)
    const appear = Math.min(blockProgress / 0.05, 1);
    // Fade very late (last 15%) so blocks stay bright as they fall and settle
    const fade = blockProgress > 0.85 ? (blockProgress - 0.85) / 0.15 : 0;
    // Fall uses quadratic easing for gravity feel (confetti to floor)
    const fall = blockProgress * blockProgress;

    return {
      opacity: appear * (1 - fade),
      transform: [
        { translateX: config.driftX * blockProgress },
        { translateY: config.fallDistance * fall },
        { rotate: `${config.rotation * blockProgress}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${config.leftPct}%`,
          top: `${config.topPct}%`,
          width: `${config.widthPct}%`,
          height: `${config.heightPct}%`,
          backgroundColor: config.color,
          // White glow effect
          shadowColor: '#FFFFFF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
          elevation: 4,
        },
        animatedStyle,
      ]}
    />
  );
});

PixelBlock.displayName = 'PixelBlock';

const PixelDissolveOverlay = ({ dissolveProgress }) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {BLOCK_CONFIGS.map((config, index) => (
        <PixelBlock key={index} config={config} dissolveProgress={dissolveProgress} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
  },
});

export default memo(PixelDissolveOverlay);
