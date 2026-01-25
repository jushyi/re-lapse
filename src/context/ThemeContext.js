import React, { createContext, useState, useContext } from 'react';
import { colors } from '../constants/colors';
import logger from '../utils/logger';

/**
 * Preset color palettes for user personalization
 * Each palette provides accent and accentSecondary colors
 * that override the brand colors in the theme
 */
export const PALETTES = {
  purple: {
    accent: '#8B5CF6', // Current Rewind brand (Tailwind violet-500)
    accentSecondary: '#EC4899', // Tailwind pink-500
  },
  blue: {
    accent: '#3B82F6', // Tailwind blue-500
    accentSecondary: '#06B6D4', // Tailwind cyan-500
  },
  green: {
    accent: '#22C55E', // Tailwind green-500
    accentSecondary: '#84CC16', // Tailwind lime-500
  },
  orange: {
    accent: '#F97316', // Tailwind orange-500
    accentSecondary: '#FBBF24', // Tailwind amber-400
  },
};

const ThemeContext = createContext({});

/**
 * Hook to access theme context
 * Must be used within a ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context || Object.keys(context).length === 0) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * ThemeProvider component
 * Provides theme colors to the entire app via context
 * Supports switching between preset palettes
 */
export const ThemeProvider = ({ children }) => {
  const [currentPalette, setCurrentPalette] = useState('purple');
  const [initializing, setInitializing] = useState(false);

  /**
   * Update the current palette
   * @param {string} paletteName - Name of palette from PALETTES
   */
  const setPalette = paletteName => {
    if (!PALETTES[paletteName]) {
      logger.warn('ThemeContext: Invalid palette name', { paletteName });
      return;
    }
    logger.info('ThemeContext: Palette changed', {
      from: currentPalette,
      to: paletteName,
    });
    setCurrentPalette(paletteName);
  };

  // Derive theme object from current palette merged with static colors
  const palette = PALETTES[currentPalette];
  const theme = {
    // Accent colors from selected palette
    accent: palette.accent,
    accentSecondary: palette.accentSecondary,
    // Spread all static colors from constants
    ...colors,
    // Override brand colors with palette (for components using brand.purple directly)
    brand: {
      ...colors.brand,
      purple: palette.accent,
      pink: palette.accentSecondary,
      gradient: {
        ...colors.brand.gradient,
        // Update gradients to use palette colors
        developing: [palette.accent, palette.accentSecondary],
        revealed: [palette.accent, palette.accentSecondary],
      },
    },
  };

  const value = {
    theme,
    currentPalette,
    setPalette,
    palettes: Object.keys(PALETTES),
    initializing,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
