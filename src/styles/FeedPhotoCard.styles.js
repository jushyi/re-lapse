/**
 * FeedPhotoCard styles
 *
 * Styles for the feed photo card component that displays
 * a single photo in the feed with user info and reactions.
 */
import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const PHOTO_SIZE = SCREEN_WIDTH - CARD_PADDING * 2;

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  profilePicContainer: {
    marginRight: 12,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profilePicPlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  username: {
    fontSize: 12,
    color: '#666666',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 8,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F0F0F0',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  moreReactions: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  noReactions: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
});
