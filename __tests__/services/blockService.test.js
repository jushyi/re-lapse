/**
 * Block Service Unit Tests
 *
 * Tests for block service including:
 * - Block a user (success, already blocked, self-block, error)
 * - Unblock a user (success, not blocked, error)
 * - Check if blocked (blocked, not blocked, error)
 * - Get blocked-by user IDs (who blocked this user)
 * - Get blocked user IDs (who this user blocked)
 * - Get blocked users with profiles (combines block docs + user profiles)
 */

// Mock logger to prevent console output
jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock userService for getBlockedUsersWithProfiles
const mockGetUserProfile = jest.fn();
jest.mock('../../src/services/firebase/userService', () => ({
  getUserProfile: (...args) => mockGetUserProfile(...args),
}));

// Create mock functions for Firestore at module level
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockSetDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockServerTimestamp = jest.fn(() => ({ _seconds: Date.now() / 1000, _nanoseconds: 0 }));

// Mock document and collection references
const mockDocRef = { id: 'mock-doc-id' };
const mockCollectionRef = {};

// Mock @react-native-firebase/firestore
jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: () => ({}),
  collection: jest.fn(() => mockCollectionRef),
  doc: jest.fn(() => mockDocRef),
  getDoc: (...args) => mockGetDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  setDoc: (...args) => mockSetDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  query: jest.fn(() => ({})),
  where: jest.fn(() => ({})),
  limit: jest.fn(() => ({})),
  serverTimestamp: () => mockServerTimestamp(),
}));

// Import service AFTER mocks are set up
const {
  blockUser,
  unblockUser,
  isBlocked,
  getBlockedByUserIds,
  getBlockedUserIds,
  getBlockedUsersWithProfiles,
} = require('../../src/services/firebase/blockService');

const { createTestBlock, createTestUser } = require('../setup/testFactories');

describe('blockService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // blockUser tests
  // ===========================================================================
  describe('blockUser', () => {
    it('should create block document on success', async () => {
      // Block does not exist yet
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });
      mockSetDoc.mockResolvedValueOnce();
      // For removeBlockedUserContent - no photos found
      mockGetDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const result = await blockUser('blocker-123', 'blocked-456');

      expect(result.success).toBe(true);
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          blockerId: 'blocker-123',
          blockedId: 'blocked-456',
        })
      );
    });

    it('should return error when user is already blocked', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => createTestBlock(),
      });

      const result = await blockUser('blocker-123', 'blocked-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User already blocked');
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('should return error when trying to block yourself', async () => {
      const result = await blockUser('user-123', 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot block yourself');
    });

    it('should return error when blockerId is empty', async () => {
      const result = await blockUser('', 'blocked-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user IDs');
    });

    it('should return error when blockedId is empty', async () => {
      const result = await blockUser('blocker-123', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user IDs');
    });

    it('should return error when blockerId is null', async () => {
      const result = await blockUser(null, 'blocked-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user IDs');
    });

    it('should handle Firestore errors gracefully', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await blockUser('blocker-123', 'blocked-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection failed');
    });

    it('should cascade remove blocked user content from photos', async () => {
      // Block does not exist yet
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });
      mockSetDoc.mockResolvedValueOnce();
      // Photos query returns 1 photo with blocked user's content
      mockGetDocs
        .mockResolvedValueOnce({
          empty: false,
          docs: [
            {
              id: 'photo-1',
              data: () => ({
                userId: 'blocker-123',
                reactions: { 'blocked-456': { heart: 1 } },
                reactionCount: 1,
              }),
            },
          ],
        })
        // Comments query for photo-1
        .mockResolvedValueOnce({
          docs: [{ id: 'comment-by-blocked', ref: {} }],
        });
      mockDeleteDoc.mockResolvedValue();
      mockUpdateDoc.mockResolvedValue();

      const result = await blockUser('blocker-123', 'blocked-456');

      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // unblockUser tests
  // ===========================================================================
  describe('unblockUser', () => {
    it('should delete block document on success', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => createTestBlock(),
      });
      mockDeleteDoc.mockResolvedValueOnce();

      const result = await unblockUser('blocker-123', 'blocked-456');

      expect(result.success).toBe(true);
      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('should return error when block does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await unblockUser('blocker-123', 'blocked-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Block not found');
      expect(mockDeleteDoc).not.toHaveBeenCalled();
    });

    it('should return error when blockerId is empty', async () => {
      const result = await unblockUser('', 'blocked-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user IDs');
    });

    it('should return error when blockedId is empty', async () => {
      const result = await unblockUser('blocker-123', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user IDs');
    });

    it('should handle Firestore errors gracefully', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Delete failed'));

      const result = await unblockUser('blocker-123', 'blocked-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });

  // ===========================================================================
  // isBlocked tests
  // ===========================================================================
  describe('isBlocked', () => {
    it('should return true when user is blocked', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
      });

      const result = await isBlocked('blocker-123', 'blocked-456');

      expect(result.success).toBe(true);
      expect(result.isBlocked).toBe(true);
    });

    it('should return false when user is not blocked', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await isBlocked('blocker-123', 'blocked-456');

      expect(result.success).toBe(true);
      expect(result.isBlocked).toBe(false);
    });

    it('should return error when blockerId is empty', async () => {
      const result = await isBlocked('', 'blocked-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user IDs');
    });

    it('should return error when blockedId is empty', async () => {
      const result = await isBlocked('blocker-123', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user IDs');
    });

    it('should handle Firestore errors gracefully', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Read failed'));

      const result = await isBlocked('blocker-123', 'blocked-456');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Read failed');
    });
  });

  // ===========================================================================
  // getBlockedByUserIds tests
  // ===========================================================================
  describe('getBlockedByUserIds', () => {
    it('should return array of user IDs who blocked this user', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: callback => {
          callback({
            id: 'block-1',
            data: () => ({ blockerId: 'user-a', blockedId: 'target-user' }),
          });
          callback({
            id: 'block-2',
            data: () => ({ blockerId: 'user-b', blockedId: 'target-user' }),
          });
        },
      });

      const result = await getBlockedByUserIds('target-user');

      expect(result.success).toBe(true);
      expect(result.blockedByUserIds).toEqual(['user-a', 'user-b']);
    });

    it('should return empty array when no one has blocked this user', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(),
      });

      const result = await getBlockedByUserIds('target-user');

      expect(result.success).toBe(true);
      expect(result.blockedByUserIds).toEqual([]);
    });

    it('should return error when userId is empty', async () => {
      const result = await getBlockedByUserIds('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
    });

    it('should return error when userId is null', async () => {
      const result = await getBlockedByUserIds(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
    });

    it('should handle Firestore errors gracefully', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Query failed'));

      const result = await getBlockedByUserIds('target-user');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query failed');
    });
  });

  // ===========================================================================
  // getBlockedUserIds tests
  // ===========================================================================
  describe('getBlockedUserIds', () => {
    it('should return array of user IDs this user has blocked', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: callback => {
          callback({
            id: 'block-1',
            data: () => ({ blockerId: 'blocker-user', blockedId: 'user-x' }),
          });
          callback({
            id: 'block-2',
            data: () => ({ blockerId: 'blocker-user', blockedId: 'user-y' }),
          });
        },
      });

      const result = await getBlockedUserIds('blocker-user');

      expect(result.success).toBe(true);
      expect(result.blockedUserIds).toEqual(['user-x', 'user-y']);
    });

    it('should return empty array when user has not blocked anyone', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(),
      });

      const result = await getBlockedUserIds('blocker-user');

      expect(result.success).toBe(true);
      expect(result.blockedUserIds).toEqual([]);
    });

    it('should return error when userId is empty', async () => {
      const result = await getBlockedUserIds('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
    });

    it('should return error when userId is null', async () => {
      const result = await getBlockedUserIds(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
    });

    it('should handle Firestore errors gracefully', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Query failed'));

      const result = await getBlockedUserIds('blocker-user');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query failed');
    });
  });

  // ===========================================================================
  // getBlockedUsersWithProfiles tests
  // ===========================================================================
  describe('getBlockedUsersWithProfiles', () => {
    it('should return blocked users with profile data', async () => {
      // getBlockedUserIds query
      mockGetDocs.mockResolvedValueOnce({
        forEach: callback => {
          callback({
            id: 'block-1',
            data: () => ({ blockerId: 'user-123', blockedId: 'blocked-a' }),
          });
          callback({
            id: 'block-2',
            data: () => ({ blockerId: 'user-123', blockedId: 'blocked-b' }),
          });
        },
      });

      // getUserProfile calls for each blocked user
      mockGetUserProfile
        .mockResolvedValueOnce({
          success: true,
          profile: createTestUser({ uid: 'blocked-a', username: 'alice' }),
        })
        .mockResolvedValueOnce({
          success: true,
          profile: createTestUser({ uid: 'blocked-b', username: 'bob' }),
        });

      const result = await getBlockedUsersWithProfiles('user-123');

      expect(result.success).toBe(true);
      expect(result.blockedUsers).toHaveLength(2);
      expect(result.blockedUsers[0].username).toBe('alice');
      expect(result.blockedUsers[1].username).toBe('bob');
    });

    it('should return empty array when no users are blocked', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(),
      });

      const result = await getBlockedUsersWithProfiles('user-123');

      expect(result.success).toBe(true);
      expect(result.blockedUsers).toEqual([]);
    });

    it('should skip deleted user profiles gracefully', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: callback => {
          callback({
            id: 'block-1',
            data: () => ({ blockerId: 'user-123', blockedId: 'deleted-user' }),
          });
          callback({
            id: 'block-2',
            data: () => ({ blockerId: 'user-123', blockedId: 'active-user' }),
          });
        },
      });

      // First profile fetch fails (deleted user)
      mockGetUserProfile
        .mockResolvedValueOnce({
          success: false,
          error: 'User not found',
        })
        .mockResolvedValueOnce({
          success: true,
          profile: createTestUser({ uid: 'active-user', username: 'active' }),
        });

      const result = await getBlockedUsersWithProfiles('user-123');

      expect(result.success).toBe(true);
      // Only the active user should be included
      expect(result.blockedUsers).toHaveLength(1);
      expect(result.blockedUsers[0].username).toBe('active');
    });

    it('should return error when userId is empty', async () => {
      const result = await getBlockedUsersWithProfiles('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
    });

    it('should return error when userId is null', async () => {
      const result = await getBlockedUsersWithProfiles(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
    });

    it('should handle errors from getBlockedUserIds gracefully', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Query failed'));

      const result = await getBlockedUsersWithProfiles('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query failed');
    });
  });
});
