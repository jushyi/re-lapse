/**
 * Report Service Unit Tests
 *
 * Tests for report service including:
 * - REPORT_REASONS constant validation
 * - submitReport (success, validation errors, profileSnapshot handling)
 */

// Mock logger to prevent console output
jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Create mock functions for Firestore at module level
const mockAddDoc = jest.fn();
const mockServerTimestamp = jest.fn(() => ({ _seconds: Date.now() / 1000, _nanoseconds: 0 }));

// Mock document and collection references
const mockCollectionRef = {};

// Mock @react-native-firebase/firestore
jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: () => ({}),
  collection: jest.fn(() => mockCollectionRef),
  addDoc: (...args) => mockAddDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

// Import service AFTER mocks are set up
const { submitReport, REPORT_REASONS } = require('../../src/services/firebase/reportService');

const { createTestUser } = require('../setup/testFactories');

describe('reportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // REPORT_REASONS constant tests
  // ===========================================================================
  describe('REPORT_REASONS', () => {
    it('should contain all expected report reason values', () => {
      expect(REPORT_REASONS).toEqual([
        'spam',
        'harassment',
        'inappropriate',
        'impersonation',
        'other',
      ]);
    });

    it('should have exactly 5 reasons', () => {
      expect(REPORT_REASONS).toHaveLength(5);
    });

    it('should include spam', () => {
      expect(REPORT_REASONS).toContain('spam');
    });

    it('should include harassment', () => {
      expect(REPORT_REASONS).toContain('harassment');
    });

    it('should include inappropriate', () => {
      expect(REPORT_REASONS).toContain('inappropriate');
    });

    it('should include impersonation', () => {
      expect(REPORT_REASONS).toContain('impersonation');
    });

    it('should include other', () => {
      expect(REPORT_REASONS).toContain('other');
    });
  });

  // ===========================================================================
  // submitReport tests
  // ===========================================================================
  describe('submitReport', () => {
    const validProfileSnapshot = {
      displayName: 'Bad Actor',
      username: 'badactor',
      bio: 'Some bio',
      profilePhotoURL: 'https://example.com/photo.jpg',
    };

    it('should create report document on success', async () => {
      mockAddDoc.mockResolvedValueOnce({ id: 'report-abc-123' });

      const result = await submitReport(
        'reporter-id',
        'reported-user-id',
        'spam',
        'Sending spam messages',
        validProfileSnapshot
      );

      expect(result.success).toBe(true);
      expect(result.reportId).toBe('report-abc-123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reporterId: 'reporter-id',
          reportedUserId: 'reported-user-id',
          reason: 'spam',
          details: 'Sending spam messages',
          status: 'pending',
        })
      );
    });

    it('should include profileSnapshot in report data', async () => {
      mockAddDoc.mockResolvedValueOnce({ id: 'report-123' });

      await submitReport(
        'reporter-id',
        'reported-user-id',
        'harassment',
        null,
        validProfileSnapshot
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          profileSnapshot: {
            displayName: 'Bad Actor',
            username: 'badactor',
            bio: 'Some bio',
            profilePhotoURL: 'https://example.com/photo.jpg',
          },
        })
      );
    });

    it('should handle null profileSnapshot fields gracefully', async () => {
      mockAddDoc.mockResolvedValueOnce({ id: 'report-123' });

      await submitReport('reporter-id', 'reported-user-id', 'inappropriate', null, {});

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          profileSnapshot: {
            displayName: null,
            username: null,
            bio: null,
            profilePhotoURL: null,
          },
        })
      );
    });

    it('should handle undefined profileSnapshot gracefully', async () => {
      mockAddDoc.mockResolvedValueOnce({ id: 'report-123' });

      await submitReport('reporter-id', 'reported-user-id', 'spam', null, undefined);

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          profileSnapshot: {
            displayName: null,
            username: null,
            bio: null,
            profilePhotoURL: null,
          },
        })
      );
    });

    it('should set details to null when not provided', async () => {
      mockAddDoc.mockResolvedValueOnce({ id: 'report-123' });

      await submitReport(
        'reporter-id',
        'reported-user-id',
        'impersonation',
        null,
        validProfileSnapshot
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          details: null,
        })
      );
    });

    it('should always set status to pending', async () => {
      mockAddDoc.mockResolvedValueOnce({ id: 'report-123' });

      await submitReport(
        'reporter-id',
        'reported-user-id',
        'other',
        'Details',
        validProfileSnapshot
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'pending',
        })
      );
    });

    it('should return error when reporterId is empty', async () => {
      const result = await submitReport('', 'reported-user-id', 'spam', null, validProfileSnapshot);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user IDs');
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('should return error when reportedUserId is empty', async () => {
      const result = await submitReport('reporter-id', '', 'spam', null, validProfileSnapshot);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user IDs');
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('should return error when reporterId is null', async () => {
      const result = await submitReport(
        null,
        'reported-user-id',
        'spam',
        null,
        validProfileSnapshot
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user IDs');
    });

    it('should return error when trying to report yourself', async () => {
      const result = await submitReport(
        'same-user',
        'same-user',
        'spam',
        null,
        validProfileSnapshot
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot report yourself');
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('should return error for invalid reason', async () => {
      const result = await submitReport(
        'reporter-id',
        'reported-user-id',
        'invalid-reason',
        null,
        validProfileSnapshot
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid reason');
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('should return error for empty reason', async () => {
      const result = await submitReport(
        'reporter-id',
        'reported-user-id',
        '',
        null,
        validProfileSnapshot
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid reason');
    });

    it('should return error for null reason', async () => {
      const result = await submitReport(
        'reporter-id',
        'reported-user-id',
        null,
        null,
        validProfileSnapshot
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid reason');
    });

    it('should handle Firestore errors gracefully', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('Write failed'));

      const result = await submitReport(
        'reporter-id',
        'reported-user-id',
        'spam',
        null,
        validProfileSnapshot
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Write failed');
    });

    it('should accept all valid report reasons', async () => {
      for (const reason of REPORT_REASONS) {
        jest.clearAllMocks();
        mockAddDoc.mockResolvedValueOnce({ id: `report-${reason}` });

        const result = await submitReport(
          'reporter-id',
          'reported-user-id',
          reason,
          null,
          validProfileSnapshot
        );

        expect(result.success).toBe(true);
        expect(result.reportId).toBe(`report-${reason}`);
      }
    });
  });
});
