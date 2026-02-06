import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

/**
 * Reusable Input Component with dark theme support
 * @param {string} label - Input label
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Input value
 * @param {function} onChangeText - Function to call on text change
 * @param {boolean} secureTextEntry - Whether to hide text (for passwords)
 * @param {string} keyboardType - Keyboard type (default, email-address, numeric, etc.)
 * @param {boolean} autoCapitalize - Auto capitalize setting
 * @param {string} error - Error message to display
 * @param {object} style - Additional styles
 * @param {boolean} showPasswordToggle - Show/hide password toggle icon
 * @param {string} rightIcon - Right icon type: 'loading', 'check', or null
 * @param {number} maxLength - Maximum characters allowed (optional)
 * @param {boolean} showCharacterCount - Whether to show character counter on focus (default false)
 */
const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  style,
  showPasswordToggle = false,
  rightIcon = null,
  maxLength,
  showCharacterCount = false,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const previousLengthRef = useRef(value?.length || 0);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Trigger shake animation when user tries to type at max length
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 4,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -4,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 4,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnimation]);

  // Handle text change with limit enforcement
  const handleChangeText = useCallback(
    text => {
      const currentLength = text?.length || 0;
      const prevLength = previousLengthRef.current;

      // Check if user tried to type past the limit
      if (maxLength && prevLength === maxLength && currentLength >= maxLength) {
        triggerShake();
      }

      previousLengthRef.current = currentLength;
      onChangeText?.(text);
    },
    [maxLength, onChangeText, triggerShake]
  );

  const handleFocus = useCallback(
    e => {
      setIsFocused(true);
      props.onFocus?.(e);
    },
    [props.onFocus]
  );

  const handleBlur = useCallback(
    e => {
      setIsFocused(false);
      props.onBlur?.(e);
    },
    [props.onBlur]
  );

  const currentLength = value?.length || 0;
  const showCounter = showCharacterCount && maxLength && isFocused;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[styles.inputContainer, { transform: [{ translateX: shakeAnimation }] }]}
      >
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          maxLength={maxLength}
          {...props}
        />
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eyeIconText}>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon === 'loading' && (
          <View style={styles.rightIcon}>
            <ActivityIndicator size="small" color={colors.text.secondary} />
          </View>
        )}
        {rightIcon === 'check' && (
          <View style={styles.rightIcon}>
            <Ionicons name="checkmark-circle" size={20} color={colors.status.ready} />
          </View>
        )}
      </Animated.View>
      {showCounter && (
        <Text style={styles.characterCounter}>
          {currentLength}/{maxLength}
        </Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
    letterSpacing: 0,
  },
  inputError: {
    borderColor: colors.status.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.status.danger,
    marginTop: 4,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 20,
  },
  rightIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  characterCounter: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default Input;
