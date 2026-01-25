import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { getTimeAgo } from '../utils/timeUtils';
import { styles } from '../styles/FeedPhotoCard.styles';

/**
 * Feed photo card component
 * Displays a single photo in the feed with user info and reactions
 *
 * @param {object} photo - Photo object with user data
 * @param {function} onPress - Callback when card is tapped
 */
const FeedPhotoCard = ({ photo, onPress }) => {
  const { imageURL, capturedAt, reactions = {}, reactionCount = 0, user = {} } = photo;

  const { username, displayName, profilePhotoURL } = user;

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
      {/* Profile section */}
      <View style={styles.profileSection}>
        {/* Profile photo */}
        <View style={styles.profilePicContainer}>
          {profilePhotoURL ? (
            <Image source={{ uri: profilePhotoURL }} style={styles.profilePic} />
          ) : (
            <View style={[styles.profilePic, styles.profilePicPlaceholder]}>
              <Text style={styles.profilePicText}>{displayName?.[0]?.toUpperCase() || '?'}</Text>
            </View>
          )}
        </View>

        {/* User info */}
        <View style={styles.profileInfo}>
          <Text style={styles.displayName} numberOfLines={1}>
            {displayName || 'Unknown User'}
          </Text>
          <Text style={styles.username} numberOfLines={1}>
            @{username || 'unknown'}
          </Text>
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp}>{getTimeAgo(capturedAt)}</Text>
      </View>

      {/* Photo */}
      <View style={styles.photoContainer}>
        <Image source={{ uri: imageURL }} style={styles.photo} resizeMode="cover" />
      </View>

      {/* Reaction bar */}
      {reactionCount > 0 && (
        <View style={styles.reactionBar}>
          {topReactions.map((reaction, index) => (
            <View key={index} style={styles.reactionItem}>
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text style={styles.reactionCount}>{reaction.count}</Text>
            </View>
          ))}
          {reactionCount > 3 && <Text style={styles.moreReactions}>+{reactionCount - 3} more</Text>}
        </View>
      )}

      {/* Empty reaction bar if no reactions */}
      {reactionCount === 0 && (
        <View style={styles.reactionBar}>
          <Text style={styles.noReactions}>Be the first to react</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default FeedPhotoCard;
