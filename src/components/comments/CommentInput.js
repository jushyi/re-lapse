/**
 * CommentInput Component
 *
 * Text input for adding comments with:
 * - TextInput with multiline support
 * - Image picker button for media comments
 * - Send button (disabled when empty)
 * - Reply banner showing "Replying to @name" with cancel
 * - forwardRef for external focus control
 */
import React, { useState, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import logger from '../../utils/logger';
import { styles } from '../../styles/CommentInput.styles';

/**
 * CommentInput Component
 *
 * @param {function} onSubmit - Callback with (text, mediaUrl, mediaType) when sent
 * @param {function} onImagePick - Callback to open image picker (Plan 06)
 * @param {object} replyingTo - Comment object if replying (shows "Replying to @name")
 * @param {function} onCancelReply - Callback to cancel reply mode
 * @param {string} placeholder - Custom placeholder text
 * @param {boolean} autoFocus - Whether to auto-focus input
 * @param {ref} ref - Ref forwarded to TextInput for external focus control
 */
const CommentInput = forwardRef(
  (
    {
      onSubmit,
      onImagePick,
      replyingTo = null,
      onCancelReply,
      placeholder = 'Add a comment...',
      autoFocus = false,
    },
    ref
  ) => {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    // Expose focus method to parent via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        logger.debug('CommentInput: Focus called via ref');
        inputRef.current?.focus();
      },
      blur: () => {
        logger.debug('CommentInput: Blur called via ref');
        inputRef.current?.blur();
      },
      clear: () => {
        logger.debug('CommentInput: Clear called via ref');
        setText('');
      },
    }));

    /**
     * Handle text change
     */
    const handleChangeText = useCallback(newText => {
      setText(newText);
    }, []);

    /**
     * Handle send button press
     */
    const handleSend = useCallback(() => {
      const trimmedText = text.trim();
      if (!trimmedText) {
        logger.debug('CommentInput: Send blocked - empty text');
        return;
      }

      logger.info('CommentInput: Sending comment', {
        textLength: trimmedText.length,
        isReply: !!replyingTo,
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (onSubmit) {
        onSubmit(trimmedText, null, null);
      }

      // Clear text after submit
      setText('');
    }, [text, replyingTo, onSubmit]);

    /**
     * Handle image picker button press
     */
    const handleImagePick = useCallback(() => {
      logger.info('CommentInput: Image picker pressed');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (onImagePick) {
        onImagePick();
      }
    }, [onImagePick]);

    /**
     * Handle cancel reply
     */
    const handleCancelReply = useCallback(() => {
      logger.info('CommentInput: Cancel reply pressed');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (onCancelReply) {
        onCancelReply();
      }
    }, [onCancelReply]);

    /**
     * Handle submit on keyboard return
     */
    const handleSubmitEditing = useCallback(() => {
      if (text.trim()) {
        handleSend();
      }
    }, [text, handleSend]);

    const isDisabled = !text.trim();
    const replyUsername = replyingTo?.user?.username || replyingTo?.user?.displayName || 'user';

    return (
      <View style={styles.container}>
        {/* Reply Banner - shown when replying to a comment */}
        {replyingTo && (
          <View style={styles.replyBanner}>
            <Text style={styles.replyBannerText}>
              Replying to <Text style={styles.replyBannerUsername}>@{replyUsername}</Text>
            </Text>
            <TouchableOpacity style={styles.replyBannerCancel} onPress={handleCancelReply}>
              <Ionicons name="close" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Row */}
        <View style={styles.inputRow}>
          {/* Input Wrapper with rounded background */}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={placeholder}
              placeholderTextColor={colors.text.tertiary}
              value={text}
              onChangeText={handleChangeText}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              multiline
              maxLength={1000}
              returnKeyType="send"
              blurOnSubmit={true}
              onSubmitEditing={handleSubmitEditing}
              autoFocus={autoFocus}
              keyboardAppearance="dark"
            />

            {/* Image Picker Button */}
            <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
              <Ionicons name="image-outline" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isDisabled}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={isDisabled ? colors.text.tertiary : colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

CommentInput.displayName = 'CommentInput';

export default CommentInput;
