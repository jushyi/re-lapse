/**
 * Cloud Functions Test Setup
 *
 * Comprehensive mocks for firebase-admin, firebase-functions, expo-server-sdk,
 * and zod. Loaded via Jest setupFiles before each test suite.
 */

// Mock firebase-functions (needed by logger.js)
jest.mock('firebase-functions', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  runWith: jest.fn(() => ({
    firestore: {
      document: jest.fn(() => ({
        onCreate: jest.fn(),
        onUpdate: jest.fn(),
        onWrite: jest.fn(),
        onDelete: jest.fn(),
      })),
    },
    pubsub: {
      schedule: jest.fn(() => ({
        timeZone: jest.fn(() => ({
          onRun: jest.fn(),
        })),
      })),
    },
  })),
}));

// Mock firebase-functions/v2/https (needed by index.js for onCall)
jest.mock('firebase-functions/v2/https', () => ({
  onCall: jest.fn((options, handler) => handler),
  HttpsError: class HttpsError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  },
}));

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  const mockFirestore = jest.fn();
  // Define FieldValue and Timestamp as properties of the function
  mockFirestore.FieldValue = {
    serverTimestamp: jest.fn(() => 'mock-timestamp'),
    increment: jest.fn(n => n),
    arrayUnion: jest.fn((...args) => args),
    arrayRemove: jest.fn((...args) => args),
    delete: jest.fn(),
  };
  mockFirestore.Timestamp = {
    now: jest.fn(() => ({ toDate: () => new Date() })),
  };

  return {
    initializeApp: jest.fn(),
    firestore: mockFirestore,
    auth: jest.fn(() => ({
      getUser: jest.fn(),
      deleteUser: jest.fn(),
    })),
    storage: jest.fn(() => ({
      bucket: jest.fn(() => ({
        file: jest.fn(() => ({
          delete: jest.fn().mockResolvedValue(),
          getSignedUrl: jest.fn().mockResolvedValue(['https://mock-signed-url.com']),
        })),
      })),
    })),
  };
});

// Mock firebase-admin/app (needed by index.js)
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => ['mock-app']),
  getApp: jest.fn(() => 'mock-app'),
}));

// Mock firebase-admin/firestore (needed by index.js)
jest.mock('firebase-admin/firestore', () => ({
  initializeFirestore: jest.fn(() => {
    // Return a mock db object
    const mockDocRef = {
      get: jest.fn().mockResolvedValue({ exists: false, data: () => null }),
      set: jest.fn().mockResolvedValue(),
      update: jest.fn().mockResolvedValue(),
      delete: jest.fn().mockResolvedValue(),
    };
    const mockCollectionRef = {
      doc: jest.fn(() => mockDocRef),
      add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
      get: jest.fn().mockResolvedValue({ docs: [], empty: true }),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
    const mockDb = {
      collection: jest.fn(() => mockCollectionRef),
      doc: jest.fn(() => mockDocRef),
      batch: jest.fn(() => ({
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(),
      })),
      runTransaction: jest.fn(fn => fn({ get: jest.fn(), set: jest.fn(), update: jest.fn() })),
    };
    return mockDb;
  }),
}));

// Mock expo-server-sdk
jest.mock('expo-server-sdk', () => {
  const mockSend = jest.fn().mockResolvedValue([{ status: 'ok', id: 'receipt-123' }]);

  class MockExpo {
    constructor() {
      this.sendPushNotificationsAsync = mockSend;
      this.chunkPushNotifications = jest.fn(msgs => [msgs]);
      this.chunkPushNotificationReceiptIds = jest.fn(ids => [ids]);
      this.getPushNotificationReceiptsAsync = jest.fn().mockResolvedValue({});
    }
  }
  MockExpo.isExpoPushToken = jest.fn(
    token => typeof token === 'string' && token.startsWith('ExponentPushToken[')
  );
  return { Expo: MockExpo };
});

// Mock zod (used by validation.js)
jest.mock('zod', () => {
  const mockSchema = {
    safeParse: jest.fn(() => ({ success: true, data: {} })),
    parse: jest.fn(data => data),
    optional: jest.fn(() => mockSchema),
    nullable: jest.fn(() => mockSchema),
  };
  return {
    z: {
      object: jest.fn(() => mockSchema),
      string: jest.fn(() => ({
        ...mockSchema,
        min: jest.fn(() => mockSchema),
        max: jest.fn(() => mockSchema),
        email: jest.fn(() => mockSchema),
        url: jest.fn(() => mockSchema),
        optional: jest.fn(() => mockSchema),
        nullable: jest.fn(() => mockSchema),
      })),
      number: jest.fn(() => ({
        ...mockSchema,
        min: jest.fn(() => mockSchema),
        max: jest.fn(() => mockSchema),
        int: jest.fn(() => mockSchema),
        optional: jest.fn(() => mockSchema),
      })),
      boolean: jest.fn(() => mockSchema),
      enum: jest.fn(() => mockSchema),
      array: jest.fn(() => ({
        ...mockSchema,
        min: jest.fn(() => mockSchema),
        max: jest.fn(() => mockSchema),
        optional: jest.fn(() => mockSchema),
      })),
      record: jest.fn(() => mockSchema),
      any: jest.fn(() => mockSchema),
    },
  };
});
