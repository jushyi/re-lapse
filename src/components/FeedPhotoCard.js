import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { getTimeAgo } from '../utils/timeUtils';
import { styles } from '../styles/FeedPhotoCard.styles';

/**
 * Feed photo card component - Polaroid Design
 *
 * Displays a single photo in the feed styled like a Polaroid photograph
 * with iconic white frame, thick bottom edge, and user info like handwriting.
 *
 * @param {object} photo - Photo object with user data
 * @param {function} onPress - Callback when card is tapped
 */
const FeedPhotoCard = ({ photo, onPress }) => {
  const { imageURL, capturedAt, reactions = {}, reactionCount = 0, user = {} } = photo;

  const { displayName } = user;

  /**
   * Get top 3 reactions with counts
   * New data structure: reactions[userId][emoji] = count
   */
  const getTopReactions = () => {
    if (!reactions || Object.keys(reactions).length === 0) return [];

    // Aggregate emoji counts across all users
    const emojiCounts = {};
    Object.values(reactions).forEach(userReactions => {
      // userReactions is now an object: { '😂': 2, '❤️': 1 }
      if (typeof userReactions === 'object') {
        Object.entries(userReactions).forEach(([emoji, count]) => {
          if (!emojiCounts[emoji]) {
            emojiCounts[emoji] = 0;
          }
          emojiCounts[emoji] += count;
        });
      }
    });

    // Sort by count and take top 3
    return Object.entries(emojiCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emoji, count]) => ({ emoji, count }));
  };

  const topReactions = getTopReactions();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      {/* Inner frame with Polaroid proportions */}
      <View style={styles.frameInner}>
        {/* Photo - square with crisp edges */}
        <View style={styles.photoContainer}>
          <Image source={{ uri: imageURL }} style={styles.photo} resizeMode="cover" />
        </View>
      </View>

      {/* Bottom info section - like handwriting on Polaroid */}
      <View style={styles.polaroidBottom}>
        <View style={styles.userInfo}>
          <Text style={styles.displayName} numberOfLines={1}>
            {displayName || 'Unknown'}
          </Text>
          <Text style={styles.timestamp}>{getTimeAgo(capturedAt)}</Text>
        </View>

        {/* Reactions (if present) */}
        {reactionCount > 0 && (
          <View style={styles.reactions}>
            {topReactions.map((reaction, index) => (
              <View key={index} style={styles.reactionItem}>
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                <Text style={styles.reactionCount}>{reaction.count}</Text>
              </View>
            ))}
            {reactionCount > 3 && <Text style={styles.moreReactions}>+{reactionCount - 3}</Text>}
          </View>
        )}

        {/* Prompt if no reactions */}
        {reactionCount === 0 && <Text style={styles.noReactions}>Tap to react</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default FeedPhotoCard;
