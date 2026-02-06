import React, { useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../constants/colors';

const CODE_LENGTH = 6;

/**
 * AuthCodeInput - 6-digit verification code input with individual boxes
 * @param {string} value - Current code value (max 6 chars)
 * @param {function} onChange - Called when code changes (code: string) => void
 * @param {function} onComplete - Called when 6 digits entered (code: string) => void
 * @param {boolean} error - Show error styling on all boxes
 * @param {boolean} disabled - Disable input
 * @param {boolean} autoFocus - Auto-focus on mount
 */
const AuthCodeInput = ({
  value = '',
  onChange,
  onComplete,
  error = false,
  disabled = false,
  autoFocus = false,
}) => {
  const inputRef = useRef(null);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (value.length === CODE_LENGTH && onComplete) {
      onComplete(value);
    }
  }, [value, onComplete]);

  const handleChangeText = text => {
    // Only allow numeric input, max 6 characters
    const numericText = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    onChange(numericText);
  };

  const handlePress = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  const renderBoxes = () => {
    const boxes = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      const digit = value[i] || '';
      const isActive = i === value.length && value.length < CODE_LENGTH;
      const isFilled = digit !== '';

      boxes.push(
        <View
          key={i}
          style={[
            styles.box,
            isActive && styles.boxActive,
            error && styles.boxError,
            isFilled && styles.boxFilled,
          ]}
        >
          <Text style={styles.digit}>{digit}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.boxesContainer}>{renderBoxes()}</View>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus={autoFocus}
        editable={!disabled}
        maxLength={CODE_LENGTH}
        caretHidden
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  boxesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: colors.text.primary,
  },
  boxFilled: {
    borderColor: colors.border.subtle,
  },
  boxError: {
    borderColor: colors.status.danger,
  },
  digit: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default AuthCodeInput;
