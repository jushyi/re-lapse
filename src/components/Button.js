import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../constants/colors';

/**
 * Reusable Button Component with dark theme support
 * @param {string} title - Button text
 * @param {function} onPress - Function to call on press
 * @param {string} variant - 'primary', 'secondary', 'outline', 'danger'
 * @param {boolean} disabled - Whether button is disabled
 * @param {boolean} loading - Whether to show loading spinner
 * @param {object} style - Additional styles
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.button, styles.primaryButton, disabled && styles.disabledButton];
      case 'secondary':
        return [styles.button, styles.secondaryButton, disabled && styles.disabledButton];
      case 'outline':
        return [styles.button, styles.outlineButton, disabled && styles.disabledButton];
      case 'danger':
        return [styles.button, styles.dangerButton, disabled && styles.disabledButton];
      default:
        return [styles.button, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.buttonText, styles.primaryButtonText];
      case 'secondary':
        return [styles.buttonText, styles.secondaryButtonText];
      case 'outline':
        return [styles.buttonText, styles.outlineButtonText];
      case 'danger':
        return [styles.buttonText, styles.dangerButtonText];
      default:
        return [styles.buttonText, styles.primaryButtonText];
    }
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.primary} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Primary button - dark theme CTA (inverted: light on dark background)
  primaryButton: {
    backgroundColor: colors.background.secondary,
  },
  primaryButtonText: {
    color: colors.text.primary,
  },
  // Secondary button - subtle dark variant
  secondaryButton: {
    backgroundColor: colors.background.tertiary,
  },
  secondaryButtonText: {
    color: colors.text.primary,
  },
  // Outline button - transparent with subtle border
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  outlineButtonText: {
    color: colors.text.primary,
  },
  // Danger button - red with white text
  dangerButton: {
    backgroundColor: colors.status.danger,
  },
  dangerButtonText: {
    color: colors.text.primary,
  },
  // Disabled state
  disabledButton: {
    opacity: 0.5,
  },
});

export default Button;
