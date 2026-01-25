/**
 * Mock for @react-native-firebase/storage
 *
 * CRITICAL: Mock functions are defined OUTSIDE the module export
 * so they can be imported and used for test assertions.
 */

// Storage operations
const mockPutFile = jest.fn(() =>
  Promise.resolve({
    state: 'success',
    bytesTransferred: 1024,
    totalBytes: 1024,
    metadata: {
      fullPath: 'photos/test-photo.jpg',
      name: 'test-photo.jpg',
      size: 1024,
      contentType: 'image/jpeg',
    },
  })
);

const mockPutString = jest.fn(() =>
  Promise.resolve({
    state: 'success',
    metadata: {
      fullPath: 'data/test-string.txt',
    },
  })
);

const mockGetDownloadURL = jest.fn(() => Promise.resolve('https://mock-storage.com/photo.jpg'));

const mockStorageDelete = jest.fn(() => Promise.resolve());

const mockGetMetadata = jest.fn(() =>
  Promise.resolve({
    fullPath: 'photos/test-photo.jpg',
    name: 'test-photo.jpg',
    size: 1024,
    contentType: 'image/jpeg',
    timeCreated: new Date().toISOString(),
    updated: new Date().toISOString(),
  })
);

const mockList = jest.fn(() =>
  Promise.resolve({
    items: [],
    prefixes: [],
    nextPageToken: null,
  })
);

// Storage reference mock
const createMockRef = path => ({
  fullPath: path,
  name: path.split('/').pop(),
  bucket: 'mock-bucket',
  parent: null,
  root: null,
  putFile: mockPutFile,
  putString: mockPutString,
  getDownloadURL: mockGetDownloadURL,
  delete: mockStorageDelete,
  getMetadata: mockGetMetadata,
  list: mockList,
  child: jest.fn(childPath => createMockRef(`${path}/${childPath}`)),
});

const mockStorageRef = jest.fn(path => createMockRef(path || ''));

// Storage factory function
const storage = () => ({
  ref: mockStorageRef,
  refFromURL: jest.fn(url => createMockRef(url)),
  maxDownloadRetryTime: 600000,
  maxUploadRetryTime: 600000,
  setMaxDownloadRetryTime: jest.fn(),
  setMaxUploadRetryTime: jest.fn(),
});

// Export factory function as default
module.exports = storage;

// Export mock functions for test assertions
module.exports.mockPutFile = mockPutFile;
module.exports.mockPutString = mockPutString;
module.exports.mockGetDownloadURL = mockGetDownloadURL;
module.exports.mockStorageDelete = mockStorageDelete;
module.exports.mockGetMetadata = mockGetMetadata;
module.exports.mockList = mockList;
module.exports.mockStorageRef = mockStorageRef;
