import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import logger from '../utils/logger';

/**
 * FriendStoryCard component - Polaroid mini-card design
 *
 * Displays a friend's story as a mini Polaroid with blurred photo thumbnail
 * and gradient glow border for unviewed stories.
 *
 * @param {object} friend - Friend data object
 * @param {string} friend.userId - Friend's user ID
 * @param {string} friend.displayName - Friend's display name
 * @param {string} friend.profilePhotoURL - Friend's profile photo URL (optional)
 * @param {Array} friend.topPhotos - Friend's top photos by engagement
 * @param {boolean} friend.hasPhotos - Whether friend has any photos
 * @param {function} onPress - Callback when card is tapped
 * @param {boolean} isFirst - Whether this is the first card (for left margin)
 * @param {boolean} isViewed - Whether the story has been viewed (default false)
 */
const FriendStoryCard = ({ friend, onPress, isFirst = false, isViewed = false }) => {
  const { userId, displayName, topPhotos, hasPhotos } = friend;

  // Get first photo URL for thumbnail
  const thumbnailUrl = topPhotos?.[0]?.imageURL || null;

  /**
   * Handle card press
   */
  const handlePress = () => {
    logger.debug('FriendStoryCard: Card pressed', { userId, displayName });
    if (onPress) {
      onPress();
    }
  };

  /**
   * Get first letter of display name for fallback
   */
  const getInitial = () => {
    return displayName?.[0]?.toUpperCase() || '?';
  };

  /**
   * Render the Polaroid frame with photo thumbnail
   */
  const renderPolaroidFrame = () => (
    <View style={styles.polaroidFrame}>
      <View style={styles.photoContainer}>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.photoThumbnail}
            blurRadius={20}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.placeholderInitial}>{getInitial()}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      style={[styles.container, isFirst && styles.firstContainer]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Gradient glow border for unviewed stories, gray border for viewed */}
      {hasPhotos && !isViewed ? (
        <LinearGradient
          colors={colors.brand.gradient.developing}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          {renderPolaroidFrame()}
        </LinearGradient>
      ) : (
        <View style={[styles.viewedBorder, !hasPhotos && styles.noBorder]}>
          {renderPolaroidFrame()}
        </View>
      )}

      {/* Display name below card */}
      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {displayName || 'Unknown'}
      </Text>
    </TouchableOpacity>
  );
};

// Card dimensions (Polaroid proportions scaled down)
const CARD_WIDTH = 100;
const CARD_HEIGHT = 120;
const BORDER_WIDTH = 3;
const FRAME_PADDING_TOP = 6;
const FRAME_PADDING_SIDES = 6;
const FRAME_PADDING_BOTTOM = 20;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH + 8, // Extra width for padding
    alignItems: 'center',
    marginRight: 8,
  },
  firstContainer: {
    marginLeft: 0,
  },
  gradientBorder: {
    width: CARD_WIDTH + BORDER_WIDTH * 2,
    height: CARD_HEIGHT + BORDER_WIDTH * 2,
    borderRadius: 6,
    padding: BORDER_WIDTH,
    marginBottom: 6,
  },
  viewedBorder: {
    width: CARD_WIDTH + BORDER_WIDTH * 2,
    height: CARD_HEIGHT + BORDER_WIDTH * 2,
    borderRadius: 6,
    padding: BORDER_WIDTH,
    borderWidth: 2,
    borderColor: colors.storyCard.glowViewed,
    marginBottom: 6,
  },
  noBorder: {
    borderColor: 'transparent',
  },
  polaroidFrame: {
    flex: 1,
    backgroundColor: colors.storyCard.frame,
    borderRadius: 4,
    paddingTop: FRAME_PADDING_TOP,
    paddingHorizontal: FRAME_PADDING_SIDES,
    paddingBottom: FRAME_PADDING_BOTTOM,
  },
  photoContainer: {
    flex: 1,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: colors.background.tertiary,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
  },
  placeholderInitial: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  name: {
    fontSize: 11,
    color: colors.storyCard.textName,
    textAlign: 'center',
    maxWidth: CARD_WIDTH,
  },
});

export default FriendStoryCard;
