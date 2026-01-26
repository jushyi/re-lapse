/**
 * CommentInput styles
 *
 * Styles for the comment input component with text input,
 * image picker button, send button, and reply banner.
 */
import { StyleSheet, Platform } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    backgroundColor: colors.background.secondary,
  },
  // Reply banner shown when replying to a comment
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background.tertiary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  replyBannerText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  replyBannerUsername: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  replyBannerCancel: {
    padding: 4,
  },
  // Input row container
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
  },
  // Text input wrapper
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background.tertiary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    minHeight: 40,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    paddingTop: 0,
    paddingBottom: 0,
    maxHeight: 80,
  },
  // Image picker button
  imageButton: {
    paddingLeft: 8,
    paddingVertical: 2,
  },
  // Send button
  sendButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.tertiary,
  },
});
