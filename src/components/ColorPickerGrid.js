import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ColorPicker, { HueCircular, Panel3 } from 'reanimated-color-picker';

import PixelIcon from './PixelIcon';

import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

/**
 * ColorPickerGrid
 *
 * Row of 4 preset color swatches + a "+" button to open a full color wheel.
 * Tapping a preset selects it immediately. Tapping "+" expands the wheel picker.
 * Used in ContributionsScreen and EditProfileScreen.
 */

const PRESET_COLORS = [
  '#00D4FF', // Electric Cyan
  '#FF2D78', // Hot Magenta
  '#39FF14', // Neon Green
  '#FFD700', // Coin Gold
];

const ColorPickerGrid = ({ selectedColor, onColorSelect }) => {
  const [showWheel, setShowWheel] = useState(false);
  const [wheelColor, setWheelColor] = useState(selectedColor || '#00D4FF');
  const isCustomColor = selectedColor && !PRESET_COLORS.includes(selectedColor);

  const handlePresetPress = color => {
    setShowWheel(false);
    onColorSelect(color);
  };

  const handlePlusPress = () => {
    setShowWheel(prev => !prev);
  };

  const handleWheelComplete = ({ hex }) => {
    setWheelColor(hex);
  };

  const handleSaveCustomColor = () => {
    onColorSelect(wheelColor);
    setShowWheel(false);
  };

  const handleResetPress = () => {
    setShowWheel(false);
    onColorSelect(null);
  };

  return (
    <View style={styles.container}>
      {/* Row: 4 presets + custom button */}
      <View style={styles.row}>
        {PRESET_COLORS.map(color => (
          <TouchableOpacity
            key={color}
            style={[
              styles.swatch,
              { backgroundColor: color },
              selectedColor === color && styles.swatchSelected,
            ]}
            onPress={() => handlePresetPress(color)}
            activeOpacity={0.7}
          >
            {selectedColor === color && (
              <PixelIcon name="checkmark" size={18} color={colors.background.primary} />
            )}
          </TouchableOpacity>
        ))}

        {/* Plus / custom color button */}
        <TouchableOpacity
          style={[
            styles.swatch,
            styles.plusSwatch,
            isCustomColor && { backgroundColor: selectedColor },
            showWheel && styles.swatchSelected,
          ]}
          onPress={handlePlusPress}
          activeOpacity={0.7}
        >
          {isCustomColor && !showWheel ? (
            <PixelIcon name="checkmark" size={18} color={colors.background.primary} />
          ) : (
            <PixelIcon
              name={showWheel ? 'close' : 'add'}
              size={24}
              color={isCustomColor ? colors.background.primary : colors.text.secondary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Expanded color wheel */}
      {showWheel && (
        <View style={styles.wheelSection}>
          <View style={styles.wheelContainer}>
            <ColorPicker value={wheelColor} onComplete={handleWheelComplete} style={styles.picker}>
              <HueCircular containerStyle={styles.hueCircular} thumbShape="circle" thumbSize={28}>
                <Panel3 style={styles.panel} />
              </HueCircular>
            </ColorPicker>
          </View>

          {/* Preview + save */}
          <View style={styles.wheelFooter}>
            <View style={styles.previewRow}>
              <View style={[styles.previewSwatch, { backgroundColor: wheelColor }]} />
              <Text style={[styles.previewName, { color: wheelColor }]}>Your Name</Text>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveCustomColor}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reset to default */}
      <TouchableOpacity
        style={[styles.resetButton, selectedColor === null && styles.resetButtonSelected]}
        onPress={handleResetPress}
        activeOpacity={0.7}
      >
        <Text style={styles.resetButtonText}>Reset to default (white)</Text>
        {selectedColor === null && (
          <PixelIcon name="checkmark" size={20} color={colors.brand.purple} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchSelected: {
    borderColor: colors.text.primary,
    borderWidth: 3,
  },
  plusSwatch: {
    backgroundColor: colors.background.secondary,
  },
  wheelSection: {
    marginBottom: spacing.lg,
  },
  wheelContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  picker: {
    width: 240,
    alignItems: 'center',
  },
  hueCircular: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    width: 110,
    height: 110,
    borderRadius: 8,
  },
  wheelFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  previewSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border.default,
  },
  previewName: {
    fontSize: typography.size.lg,
    fontFamily: typography.fontFamily.displayBold,
  },
  saveButton: {
    backgroundColor: colors.brand.purple,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: typography.size.md,
    fontFamily: typography.fontFamily.bodyBold,
    color: colors.text.primary,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.default,
  },
  resetButtonSelected: {
    borderColor: colors.brand.purple,
  },
  resetButtonText: {
    fontSize: typography.size.lg,
    fontFamily: typography.fontFamily.body,
    color: colors.text.primary,
  },
});

export default ColorPickerGrid;
