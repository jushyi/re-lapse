/**
 * Mock for @react-native-firebase/firestore
 *
 * CRITICAL: Mock functions are defined OUTSIDE the module export
 * so they can be imported and used for test assertions.
 *
 * Note: This mock provides basic structure. For complex query testing,
 * use firestore-jest-mock's mockReactNativeFirestore() in individual tests.
 */

// Document operations
const mockGetDoc = jest.fn(() =>
  Promise.resolve({
    exists: () => true,
    data: () => ({ id: 'test-doc', name: 'Test' }),
    id: 'test-doc',
  })
);

const mockGetDocs = jest.fn(() =>
  Promise.resolve({
    docs: [],
    empty: true,
    forEach: jest.fn(),
    size: 0,
  })
);

const mockSetDoc = jest.fn(() => Promise.resolve());
const mockUpdateDoc = jest.fn(() => Promise.resolve());
const mockDeleteDoc = jest.fn(() => Promise.resolve());
const mockAddDoc = jest.fn(() => Promise.resolve({ id: 'new-doc-id' }));

// Real-time listener
const mockOnSnapshot = jest.fn((queryOrDoc, callback, errorCallback) => {
  // Return unsubscribe function
  return jest.fn();
});

// Collection/Doc references
const mockDocRef = {
  get: mockGetDoc,
  set: mockSetDoc,
  update: mockUpdateDoc,
  delete: mockDeleteDoc,
  onSnapshot: mockOnSnapshot,
  id: 'test-doc-id',
  path: 'collection/test-doc-id',
};

const mockCollectionRef = {
  get: mockGetDocs,
  add: mockAddDoc,
  doc: jest.fn(() => mockDocRef),
  onSnapshot: mockOnSnapshot,
};

const mockCollection = jest.fn(() => mockCollectionRef);
const mockDoc = jest.fn(() => mockDocRef);

// Query operations
const mockQuery = jest.fn(() => ({
  get: mockGetDocs,
  onSnapshot: mockOnSnapshot,
}));

const mockWhere = jest.fn(() => ({
  get: mockGetDocs,
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  onSnapshot: mockOnSnapshot,
}));

const mockOrderBy = jest.fn(() => ({
  get: mockGetDocs,
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  onSnapshot: mockOnSnapshot,
}));

const mockLimit = jest.fn(() => ({
  get: mockGetDocs,
  onSnapshot: mockOnSnapshot,
}));

const mockOr = jest.fn((...queries) => ({
  get: mockGetDocs,
  onSnapshot: mockOnSnapshot,
}));

const mockStartAfter = jest.fn(() => ({
  get: mockGetDocs,
  onSnapshot: mockOnSnapshot,
}));

// Timestamp utilities
const mockServerTimestamp = jest.fn(() => ({
  _seconds: Math.floor(Date.now() / 1000),
  _nanoseconds: 0,
}));

const mockTimestamp = {
  now: jest.fn(() => ({
    _seconds: Math.floor(Date.now() / 1000),
    _nanoseconds: 0,
    toDate: () => new Date(),
  })),
  fromDate: jest.fn(date => ({
    _seconds: Math.floor(date.getTime() / 1000),
    _nanoseconds: 0,
    toDate: () => date,
  })),
};

// Firestore factory function
const firestore = () => ({
  collection: mockCollection,
  doc: mockDoc,
  batch: jest.fn(() => ({
    set: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    commit: jest.fn(() => Promise.resolve()),
  })),
  runTransaction: jest.fn(callback =>
    callback({
      get: mockGetDoc,
      set: mockSetDoc,
      update: mockUpdateDoc,
      delete: mockDeleteDoc,
    })
  ),
});

// Static properties
firestore.FieldValue = {
  serverTimestamp: mockServerTimestamp,
  increment: jest.fn(n => ({ _increment: n })),
  arrayUnion: jest.fn((...items) => ({ _arrayUnion: items })),
  arrayRemove: jest.fn((...items) => ({ _arrayRemove: items })),
  delete: jest.fn(() => ({ _delete: true })),
};

firestore.Timestamp = mockTimestamp;

firestore.Filter = {
  or: mockOr,
  and: jest.fn((...queries) => ({ _and: queries })),
};

// Export factory function as default
module.exports = firestore;

// Export mock functions for test assertions
module.exports.mockGetDoc = mockGetDoc;
module.exports.mockGetDocs = mockGetDocs;
module.exports.mockSetDoc = mockSetDoc;
module.exports.mockUpdateDoc = mockUpdateDoc;
module.exports.mockDeleteDoc = mockDeleteDoc;
module.exports.mockAddDoc = mockAddDoc;
module.exports.mockOnSnapshot = mockOnSnapshot;
module.exports.mockCollection = mockCollection;
module.exports.mockDoc = mockDoc;
module.exports.mockQuery = mockQuery;
module.exports.mockWhere = mockWhere;
module.exports.mockOrderBy = mockOrderBy;
module.exports.mockLimit = mockLimit;
module.exports.mockOr = mockOr;
module.exports.mockStartAfter = mockStartAfter;
module.exports.mockServerTimestamp = mockServerTimestamp;
module.exports.mockTimestamp = mockTimestamp;
module.exports.mockDocRef = mockDocRef;
module.exports.mockCollectionRef = mockCollectionRef;
