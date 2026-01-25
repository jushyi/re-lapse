# Phase 27-01 Summary: Jest Test Infrastructure Setup

**Completed:** 2026-01-25
**Duration:** ~15 minutes
**Status:** COMPLETE

## Objective

Set up Jest testing infrastructure with comprehensive Firebase mocking for React Native Firebase SDK.

## What Was Done

### Task 1: Install Jest dependencies and configure jest-expo

- Installed `jest-expo` and `jest` using `npx expo install` for SDK compatibility
- Installed `firestore-jest-mock` for Firestore query assertions
- Created `jest.config.js` with:
  - jest-expo preset
  - setupFilesAfterEnv pointing to jest.setup.js
  - testPathIgnorePatterns for setup/mock directories
  - clearMocks: true for test isolation
  - transformIgnorePatterns for node_modules handling
  - Coverage configuration
- Added npm scripts: `test`, `test:watch`, `test:coverage`
- Created directory structure:
  - `__tests__/setup/` - Jest setup files
  - `__tests__/services/` - Service unit tests
  - `__tests__/integration/` - Integration tests
  - `__tests__/__mocks__/@react-native-firebase/` - Firebase mocks

### Task 2: Create Firebase mock infrastructure and test utilities

- Created `__tests__/setup/jest.setup.js`:
  - Mocks for @react-native-firebase/app (FIRST - other modules depend on it)
  - Mocks for @react-native-firebase/auth with PhoneAuthProvider
  - Mocks for @react-native-firebase/firestore with FieldValue and Timestamp
  - Mocks for @react-native-firebase/storage
  - Mocks for @react-native-firebase/functions
  - Mocks for expo-secure-store, expo-haptics, expo-notifications
  - Mocks for expo-image-manipulator, expo-camera, expo-image-picker
  - Mock for @react-native-async-storage/async-storage
  - Global beforeEach to clear all mocks

- Created individual mock files in `__tests__/__mocks__/@react-native-firebase/`:
  - `app.js` - Base Firebase app mock
  - `auth.js` - Auth mock with exported functions for assertions
  - `firestore.js` - Firestore mock with collection/doc/query operations
  - `storage.js` - Storage mock with ref/putFile/getDownloadURL

- Created `__tests__/setup/testFactories.js` with factory functions:
  - `createTestUser()` - User documents with sensible defaults
  - `createTestPhoto()` - Photo documents (developing status)
  - `createRevealedPhoto()` - Revealed photos ready for triage
  - `createJournaledPhoto()` - Triaged journal photos
  - `createArchivedPhoto()` - Archived photos
  - `createTestFriendship()` - Friendship with sorted user IDs
  - `createPendingFriendRequest()` - Pending friend requests
  - `createTestDarkroom()` - Darkroom with future reveal time
  - `createReadyDarkroom()` - Darkroom ready to reveal
  - `createTestNotification()` - Notification documents
  - `createTestReactions()` - Reaction data
  - `generateFriendshipId()` - Deterministic friendship ID
  - `createTimestamp()` - Firestore timestamp-like objects

- Created `__tests__/services/smoke.test.js` with 22 tests:
  - Jest configuration verification
  - Firebase app/auth/firestore/storage mock loading
  - Expo module mock loading
  - Test factory validation
  - Mock function assertion patterns

- Updated `eslint.config.js`:
  - Added Jest globals for test files (jest, describe, test, expect, etc.)
  - Configured rules for test directory

## Files Created

| File                                                      | Lines | Purpose                                  |
| --------------------------------------------------------- | ----- | ---------------------------------------- |
| `jest.config.js`                                          | 46    | Jest configuration with jest-expo preset |
| `__tests__/setup/jest.setup.js`                           | 389   | Firebase and Expo module mocks           |
| `__tests__/__mocks__/@react-native-firebase/app.js`       | 26    | Firebase app mock                        |
| `__tests__/__mocks__/@react-native-firebase/auth.js`      | 89    | Firebase auth mock                       |
| `__tests__/__mocks__/@react-native-firebase/firestore.js` | 135   | Firebase firestore mock                  |
| `__tests__/__mocks__/@react-native-firebase/storage.js`   | 72    | Firebase storage mock                    |
| `__tests__/setup/testFactories.js`                        | 196   | Test data factory functions              |
| `__tests__/services/smoke.test.js`                        | 138   | Smoke test for infrastructure            |

**Total:** 8 files, ~1,091 lines of code

## Files Modified

| File                | Change                                  |
| ------------------- | --------------------------------------- |
| `package.json`      | Added test scripts and dev dependencies |
| `package-lock.json` | Updated with new dependencies           |
| `eslint.config.js`  | Added Jest globals for test files       |

## Verification

- `npm test` runs successfully
- 22 tests pass
- No native module errors
- Mock functions properly accessible in tests
- Mocks cleared between tests

```
Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        0.726 s
```

## Commits

1. `9d3e0d1` - `chore(27-01): install Jest dependencies and configure jest-expo`
2. `5d0bfd3` - `test(27-01): create Firebase mock infrastructure and test utilities`

## Key Patterns Established

### Mock Function Scoping

Mock functions are defined OUTSIDE jest.mock() calls to allow test access:

```javascript
const mockSignInWithEmailAndPassword = jest.fn(() => Promise.resolve({...}));

jest.mock('@react-native-firebase/auth', () => {
  return () => ({
    signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  });
});

// Export for test assertions
global.mockSignInWithEmailAndPassword = mockSignInWithEmailAndPassword;
```

### Test Factory Usage

```javascript
const { createTestUser, createTestPhoto } = require('../setup/testFactories');

const user = createTestUser({ displayName: 'Custom Name' });
const photo = createTestPhoto({ status: 'revealed' });
```

### Mock Assertion Pattern

```javascript
global.mockSignInWithEmailAndPassword.mockResolvedValueOnce({
  user: { uid: 'custom-uid' },
});

await auth().signInWithEmailAndPassword(email, password);

expect(global.mockSignInWithEmailAndPassword).toHaveBeenCalledWith(email, password);
```

## Dependencies Added

- `jest-expo@~54.0.16` - Expo Jest preset
- `jest@~29.7.0` - Test runner
- `firestore-jest-mock@^0.26.0` - Firestore mocking utilities

## Notes

- Firebase mocks follow the React Native Firebase factory function pattern
- All Expo native modules that the app uses are mocked
- Test factories use sensible defaults with optional overrides
- Mocks are automatically cleared between tests via beforeEach

## Next Steps

Phase 27-02 will add service tests using this infrastructure:

- authService tests
- photoService tests
- friendshipService tests
- darkroomService tests
- feedService tests

---

_Phase: 27-test-suite-setup_
_Plan: 01_
_Completed: 2026-01-25_
