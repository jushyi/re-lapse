/**
 * CommentPreview Component
 *
 * Displays 1-2 preview comments for a photo with "View all X comments" link.
 * Used in both PhotoDetailModal (full mode) and FeedPhotoCard (compact mode).
 *
 * Features:
 * - Owner comment prioritized as caption
 * - Bold username inline with comment text
 * - Truncation for long comments
 * - "View all X comments" link when more exist
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

/**
 * CommentPreview Component
 *
 * @param {Array} comments - Array of preview comments (1-2 items)
 * @param {number} totalCount - Total comment count
 * @param {function} onPress - Callback when pressed (opens full comments)
 * @param {boolean} compact - Compact mode for feed cards (1 line per comment)
 */
const CommentPreview = ({ comments = [], totalCount = 0, onPress, compact = false }) => {
  // Don't render if no comments
  if (!comments || comments.length === 0) {
    return null;
  }

  const hasMoreComments = totalCount > comments.length;

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.containerCompact]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Preview comments */}
      {comments.map((comment, index) => (
        <View key={comment.id || index} style={styles.commentRow}>
          <Text style={styles.commentText} numberOfLines={compact ? 1 : 2}>
            <Text style={styles.username}>{comment.user?.displayName || 'User'} </Text>
            <Text>{comment.text}</Text>
          </Text>
        </View>
      ))}

      {/* View all comments link */}
      {hasMoreComments && <Text style={styles.viewAllText}>View all {totalCount} comments</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  containerCompact: {
    paddingVertical: 2,
  },
  commentRow: {
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 18,
  },
  username: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
  },
});

export default CommentPreview;
