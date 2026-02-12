/**
 * User Service Unit Tests
 *
 * Tests for user profile management, username availability, daily photo limits,
 * and profile setup cancellation.
 */

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock performanceService - withTrace just executes the callback in dev
jest.mock('../../src/services/firebase/performanceService', () => ({
  withTrace: jest.fn((name, fn) => fn({ putMetric: jest.fn(), putAttribute: jest.fn() })),
}));

// Create Firestore mocks
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockTimestampNow = jest.fn(() => ({
  _seconds: Date.now() / 1000,
  _nanoseconds: 0,
  toDate: () => new Date(),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: () => ({}),
  collection: (...args) => mockCollection(...args),
  doc: (...args) => mockDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  limit: (...args) => mockLimit(...args),
  Timestamp: {
    now: mockTimestampNow,
  },
}));

// Import service after mocks
const {
  getUserProfile,
  updateUserProfile,
  checkUsernameAvailability,
  canChangeUsername,
  getDailyPhotoCount,
  incrementDailyPhotoCount,
  checkDailyLimit,
  cancelProfileSetup,
} = require('../../src/services/firebase/userService');

const { createTestUser } = require('../setup/testFactories');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReturnValue({ _query: true });
    mockCollection.mockReturnValue({ _collection: true });
    mockDoc.mockReturnValue({ _doc: true, id: 'test-doc-id' });
  });

  // ===========================================================================
  // getUserProfile tests
  // ===========================================================================
  describe('getUserProfile', () => {
    it('should return public profile data for existing user', async () => {
      const userData = createTestUser({
        displayName: 'John Doe',
        username: 'johndoe',
        bio: 'Hello world',
        photoURL: 'https://example.com/photo.jpg',
        profilePhotoURL: 'https://example.com/profile.jpg',
        selects: ['music', 'art'],
        profileSong: { title: 'Song' },
        lastUsernameChange: null,
      });
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        id: 'user-123',
        data: () => userData,
      });

      const result = await getUserProfile('user-123');

      expect(result.success).toBe(true);
      expect(result.profile).toBeDefined();
      expect(result.profile.userId).toBe('user-123');
      expect(result.profile.displayName).toBe('John Doe');
      expect(result.profile.username).toBe('johndoe');
      expect(result.profile.bio).toBe('Hello world');
      expect(result.profile.selects).toEqual(['music', 'art']);
    });

    it('should return error when user does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await getUserProfile('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should return error when userId is empty', async () => {
      const result = await getUserProfile('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
    });

    it('should return error when userId is null', async () => {
      const result = await getUserProfile(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
    });

    it('should return null for missing optional fields', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        id: 'user-123',
        data: () => ({}),
      });

      const result = await getUserProfile('user-123');

      expect(result.success).toBe(true);
      expect(result.profile.displayName).toBeNull();
      expect(result.profile.username).toBeNull();
      expect(result.profile.bio).toBeNull();
      expect(result.profile.photoURL).toBeNull();
      expect(result.profile.profilePhotoURL).toBeNull();
      expect(result.profile.selects).toEqual([]);
      expect(result.profile.profileSong).toBeNull();
      expect(result.profile.lastUsernameChange).toBeNull();
    });

    it('should return error when Firestore getDoc fails', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Network error'));

      const result = await getUserProfile('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  // ===========================================================================
  // updateUserProfile tests
  // ===========================================================================
  describe('updateUserProfile', () => {
    it('should update profile fields without username change', async () => {
      mockUpdateDoc.mockResolvedValueOnce();

      const result = await updateUserProfile('user-123', { displayName: 'New Name' }, 'johndoe');

      expect(result.success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          displayName: 'New Name',
        })
      );
    });

    it('should check username availability when username changes', async () => {
      // Mock checkUsernameAvailability query response (username is available)
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(),
      });
      mockUpdateDoc.mockResolvedValueOnce();

      const result = await updateUserProfile(
        'user-123',
        { username: 'newusername' },
        'oldusername'
      );

      expect(result.success).toBe(true);
      expect(mockWhere).toHaveBeenCalledWith('username', '==', 'newusername');
    });

    it('should return error when new username is taken', async () => {
      // Mock checkUsernameAvailability query response (username is taken)
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(callback => {
          callback({ id: 'other-user-456' });
        }),
      });

      const result = await updateUserProfile('user-123', { username: 'takenname' }, 'oldusername');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is already taken');
    });

    it('should not check availability when username is unchanged', async () => {
      mockUpdateDoc.mockResolvedValueOnce();

      const result = await updateUserProfile(
        'user-123',
        { username: 'sameusername', bio: 'New bio' },
        'sameusername'
      );

      expect(result.success).toBe(true);
      // checkUsernameAvailability should not be called
      expect(mockGetDocs).not.toHaveBeenCalled();
    });

    it('should return error when userId is empty', async () => {
      const result = await updateUserProfile('', { displayName: 'Name' }, 'user');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
    });

    it('should return error when userId is null', async () => {
      const result = await updateUserProfile(null, { displayName: 'Name' }, 'user');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
    });

    it('should return error when Firestore updateDoc fails', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Update failed'));

      const result = await updateUserProfile('user-123', { bio: 'New bio' }, 'username');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });

    it('should set lastUsernameChange when username changes', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(),
      });
      mockUpdateDoc.mockResolvedValueOnce();

      await updateUserProfile('user-123', { username: 'newname' }, 'oldname');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          username: 'newname',
          lastUsernameChange: expect.anything(),
        })
      );
      expect(mockTimestampNow).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // checkUsernameAvailability tests
  // ===========================================================================
  describe('checkUsernameAvailability', () => {
    it('should return available when username is not taken', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(),
      });

      const result = await checkUsernameAvailability('newuser');

      expect(result.success).toBe(true);
      expect(result.available).toBe(true);
      expect(mockWhere).toHaveBeenCalledWith('username', '==', 'newuser');
    });

    it('should normalize username to lowercase', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(),
      });

      await checkUsernameAvailability('MyUserName');

      expect(mockWhere).toHaveBeenCalledWith('username', '==', 'myusername');
    });

    it('should return unavailable when username is taken by another user', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(callback => {
          callback({ id: 'other-user-456' });
        }),
      });

      const result = await checkUsernameAvailability('takenname');

      expect(result.success).toBe(true);
      expect(result.available).toBe(false);
    });

    it('should return available when username belongs to current user', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(callback => {
          callback({ id: 'current-user-123' });
        }),
      });

      const result = await checkUsernameAvailability('myname', 'current-user-123');

      expect(result.success).toBe(true);
      expect(result.available).toBe(true);
    });

    it('should return unavailable when username belongs to different user with currentUserId provided', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(callback => {
          callback({ id: 'other-user-456' });
        }),
      });

      const result = await checkUsernameAvailability('takenname', 'current-user-123');

      expect(result.success).toBe(true);
      expect(result.available).toBe(false);
    });

    it('should return error when Firestore query fails', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Query failed'));

      const result = await checkUsernameAvailability('testuser');

      expect(result.success).toBe(false);
      expect(result.available).toBe(false);
      expect(result.error).toBe('Query failed');
    });

    it('should use limit(1) for efficiency', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: jest.fn(),
      });

      await checkUsernameAvailability('testuser');

      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });

  // ===========================================================================
  // canChangeUsername tests
  // ===========================================================================
  describe('canChangeUsername', () => {
    it('should allow change when lastUsernameChange is null', () => {
      const result = canChangeUsername(null);

      expect(result.canChange).toBe(true);
      expect(result.daysRemaining).toBeUndefined();
    });

    it('should allow change when lastUsernameChange is undefined', () => {
      const result = canChangeUsername(undefined);

      expect(result.canChange).toBe(true);
    });

    it('should allow change when 14 days have passed (Date object)', () => {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      const result = canChangeUsername(fifteenDaysAgo);

      expect(result.canChange).toBe(true);
    });

    it('should not allow change when less than 14 days have passed', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const result = canChangeUsername(fiveDaysAgo);

      expect(result.canChange).toBe(false);
      expect(result.daysRemaining).toBe(9);
    });

    it('should not allow change when changed today', () => {
      const today = new Date();
      const result = canChangeUsername(today);

      expect(result.canChange).toBe(false);
      expect(result.daysRemaining).toBe(14);
    });

    it('should allow change on exactly 14 days', () => {
      const exactlyFourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const result = canChangeUsername(exactlyFourteenDaysAgo);

      expect(result.canChange).toBe(true);
    });

    it('should handle Firestore timestamp with toDate()', () => {
      const thirteenDaysAgo = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000);
      const firestoreTimestamp = {
        toDate: () => thirteenDaysAgo,
      };

      const result = canChangeUsername(firestoreTimestamp);

      expect(result.canChange).toBe(false);
      expect(result.daysRemaining).toBe(1);
    });

    it('should handle string date input', () => {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      const result = canChangeUsername(fifteenDaysAgo.toISOString());

      expect(result.canChange).toBe(true);
    });
  });

  // ===========================================================================
  // getDailyPhotoCount tests
  // ===========================================================================
  describe('getDailyPhotoCount', () => {
    it('should return current daily count when date matches', async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          dailyPhotoCount: 5,
          lastPhotoDate: todayStr,
        }),
      });

      const result = await getDailyPhotoCount('user-123');

      expect(result.success).toBe(true);
      expect(result.count).toBe(5);
    });

    it('should reset count to 0 when date does not match (new day)', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          dailyPhotoCount: 10,
          lastPhotoDate: '2020-01-01',
        }),
      });
      mockUpdateDoc.mockResolvedValueOnce();

      const result = await getDailyPhotoCount('user-123');

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          dailyPhotoCount: 0,
        })
      );
    });

    it('should return error when user does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await getDailyPhotoCount('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should return 0 when dailyPhotoCount is undefined', async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          lastPhotoDate: todayStr,
        }),
      });

      const result = await getDailyPhotoCount('user-123');

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    it('should return error when Firestore getDoc fails', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Network error'));

      const result = await getDailyPhotoCount('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  // ===========================================================================
  // incrementDailyPhotoCount tests
  // ===========================================================================
  describe('incrementDailyPhotoCount', () => {
    it('should increment existing count on same day', async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          dailyPhotoCount: 3,
          lastPhotoDate: todayStr,
        }),
      });
      mockUpdateDoc.mockResolvedValueOnce();

      const result = await incrementDailyPhotoCount('user-123');

      expect(result.success).toBe(true);
      expect(result.count).toBe(4);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          dailyPhotoCount: 4,
          lastPhotoDate: todayStr,
        })
      );
    });

    it('should reset to 1 on new day', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          dailyPhotoCount: 20,
          lastPhotoDate: '2020-01-01',
        }),
      });
      mockUpdateDoc.mockResolvedValueOnce();

      const result = await incrementDailyPhotoCount('user-123');

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should return error when user does not exist', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await incrementDailyPhotoCount('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should handle undefined dailyPhotoCount gracefully', async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          lastPhotoDate: todayStr,
        }),
      });
      mockUpdateDoc.mockResolvedValueOnce();

      const result = await incrementDailyPhotoCount('user-123');

      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should return error when Firestore fails', async () => {
      mockGetDoc.mockRejectedValueOnce(new Error('Write error'));

      const result = await incrementDailyPhotoCount('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Write error');
    });
  });

  // ===========================================================================
  // checkDailyLimit tests
  // ===========================================================================
  describe('checkDailyLimit', () => {
    it('should return canTakePhoto true when under limit', async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          dailyPhotoCount: 10,
          lastPhotoDate: todayStr,
        }),
      });

      const result = await checkDailyLimit('user-123');

      expect(result.success).toBe(true);
      expect(result.canTakePhoto).toBe(true);
      expect(result.currentCount).toBe(10);
      expect(result.remainingShots).toBe(26);
    });

    it('should return canTakePhoto false when at limit (36)', async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          dailyPhotoCount: 36,
          lastPhotoDate: todayStr,
        }),
      });

      const result = await checkDailyLimit('user-123');

      expect(result.success).toBe(true);
      expect(result.canTakePhoto).toBe(false);
      expect(result.remainingShots).toBe(0);
    });

    it('should return canTakePhoto true when count is 35 (one remaining)', async () => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          dailyPhotoCount: 35,
          lastPhotoDate: todayStr,
        }),
      });

      const result = await checkDailyLimit('user-123');

      expect(result.success).toBe(true);
      expect(result.canTakePhoto).toBe(true);
      expect(result.remainingShots).toBe(1);
    });

    it('should return error when getDailyPhotoCount fails', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await checkDailyLimit('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should return 36 remaining when new day (count resets to 0)', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          dailyPhotoCount: 30,
          lastPhotoDate: '2020-01-01',
        }),
      });
      mockUpdateDoc.mockResolvedValueOnce();

      const result = await checkDailyLimit('user-123');

      expect(result.success).toBe(true);
      expect(result.canTakePhoto).toBe(true);
      expect(result.currentCount).toBe(0);
      expect(result.remainingShots).toBe(36);
    });
  });

  // ===========================================================================
  // cancelProfileSetup tests
  // ===========================================================================
  describe('cancelProfileSetup', () => {
    it('should delete user document successfully', async () => {
      mockDeleteDoc.mockResolvedValueOnce();

      const result = await cancelProfileSetup('user-123');

      expect(result.success).toBe(true);
      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('should return error when userId is empty', async () => {
      const result = await cancelProfileSetup('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
      expect(mockDeleteDoc).not.toHaveBeenCalled();
    });

    it('should return error when userId is null', async () => {
      const result = await cancelProfileSetup(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
    });

    it('should return error when Firestore deleteDoc fails', async () => {
      mockDeleteDoc.mockRejectedValueOnce(new Error('Delete failed'));

      const result = await cancelProfileSetup('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });
});
