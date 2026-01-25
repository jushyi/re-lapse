# Phase 27: Test Suite Setup - Research

**Researched:** 2026-01-25
**Domain:** Jest testing with Expo + React Native Firebase mocking
**Confidence:** HIGH

<research_summary>

## Summary

Researched the standard approach for unit/integration testing in Expo React Native projects that use React Native Firebase. The established stack is `jest-expo` preset with manual mocks for Firebase modules, plus `firestore-jest-mock` for Firestore-specific assertions.

Key finding: React Native Firebase mocking requires careful setup because the native modules aren't available in Jest. The official react-native-firebase repo provides a comprehensive jest.setup.ts that mocks all Firebase modules. For Firestore specifically, `firestore-jest-mock` with its `mockReactNativeFirestore` function provides assertion helpers for verifying queries.

**Primary recommendation:** Use jest-expo preset + manual mocks from official RNFirebase jest.setup.ts + firestore-jest-mock for Firestore assertions. Focus tests on service logic, not component rendering.
</research_summary>

<standard_stack>

## Standard Stack

### Core

| Library   | Version | Purpose              | Why Standard                                |
| --------- | ------- | -------------------- | ------------------------------------------- |
| jest      | ^29.x   | Test runner          | Jest is the standard for React/React Native |
| jest-expo | ~52.x   | Expo preset for Jest | Handles Expo-specific transforms and mocks  |

### Supporting

| Library                       | Version | Purpose           | When to Use                                          |
| ----------------------------- | ------- | ----------------- | ---------------------------------------------------- |
| firestore-jest-mock           | ^1.5.x  | Firestore mocking | Verifying Firestore queries (collection, where, doc) |
| @testing-library/react-native | ^12.x   | Component testing | If component tests added later (out of scope now)    |

### Alternatives Considered

| Instead of            | Could Use               | Tradeoff                                                |
| --------------------- | ----------------------- | ------------------------------------------------------- |
| Manual Firebase mocks | firebase-mock           | firebase-mock is for web SDK, not React Native Firebase |
| jest-expo             | preset: 'react-native'  | jest-expo handles Expo-specific modules automatically   |
| firestore-jest-mock   | Firebase Emulator Suite | Emulator is heavyweight, adds complexity, slower        |

**Installation:**

```bash
npx expo install jest-expo jest --dev
npm install --save-dev firestore-jest-mock
```

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Recommended Project Structure

```
__tests__/                    # All tests live here (not in app/ for Expo Router)
├── setup/
│   └── jest.setup.js         # Firebase mocks + global test setup
├── services/
│   ├── authService.test.js   # Auth service unit tests
│   ├── photoService.test.js  # Photo lifecycle tests
│   ├── friendshipService.test.js
│   ├── darkroomService.test.js
│   └── feedService.test.js
├── integration/
│   ├── photoLifecycle.test.js    # Capture → developing → reveal → triage
│   ├── friendshipFlow.test.js    # Request → accept → feed filtering
│   └── authFlow.test.js          # Login → session → logout
└── __mocks__/
    ├── @react-native-firebase/   # Manual mocks for Firebase modules
    │   ├── app.js
    │   ├── auth.js
    │   ├── firestore.js
    │   └── storage.js
    └── expo-secure-store.js      # Mock for SecureStore
```

### Pattern 1: Firebase Module Mock Structure

**What:** Each Firebase module needs a factory function that returns an object with all methods mocked
**When to use:** Every Firebase module import
**Example:**

```javascript
// __mocks__/@react-native-firebase/auth.js
const mockSignInWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockOnAuthStateChanged = jest.fn();

const auth = () => ({
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signOut: mockSignOut,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  onAuthStateChanged: mockOnAuthStateChanged,
  currentUser: null,
});

// CRITICAL: Export mocks for test assertions
module.exports = auth;
module.exports.mockSignInWithEmailAndPassword = mockSignInWithEmailAndPassword;
module.exports.mockSignOut = mockSignOut;
module.exports.mockCreateUserWithEmailAndPassword = mockCreateUserWithEmailAndPassword;
module.exports.mockOnAuthStateChanged = mockOnAuthStateChanged;
```

### Pattern 2: Firestore Mock with firestore-jest-mock

**What:** Use mockReactNativeFirestore for @react-native-firebase/firestore
**When to use:** Testing any Firestore queries
**Example:**

```javascript
// In test file
const { mockReactNativeFirestore } = require('firestore-jest-mock');
const {
  mockCollection,
  mockWhere,
  mockDoc,
  mockGet,
} = require('firestore-jest-mock/mocks/firestore');

describe('photoService', () => {
  beforeEach(() => {
    mockReactNativeFirestore({
      database: {
        photos: [
          { id: 'photo1', userId: 'user1', status: 'developing' },
          { id: 'photo2', userId: 'user1', status: 'revealed' },
        ],
        users: [{ id: 'user1', username: 'testuser', displayName: 'Test User' }],
      },
    });
  });

  test('fetches developing photos for user', async () => {
    await photoService.getDevelopingPhotos('user1');

    expect(mockCollection).toHaveBeenCalledWith('photos');
    expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user1');
    expect(mockWhere).toHaveBeenCalledWith('status', '==', 'developing');
  });
});
```

### Pattern 3: Service Function Testing (Pure Logic)

**What:** Test service functions by mocking Firebase and asserting on calls + return values
**When to use:** Unit testing all service functions
**Example:**

```javascript
// __tests__/services/friendshipService.test.js
import {
  generateFriendshipId,
  sendFriendRequest,
} from '../../src/services/firebase/friendshipService';

describe('friendshipService', () => {
  describe('generateFriendshipId', () => {
    // Pure function - no mocks needed
    test('returns alphabetically sorted ID', () => {
      expect(generateFriendshipId('zebra', 'apple')).toBe('apple_zebra');
      expect(generateFriendshipId('apple', 'zebra')).toBe('apple_zebra');
    });
  });

  describe('sendFriendRequest', () => {
    test('creates pending friendship document', async () => {
      // Uses mockReactNativeFirestore from beforeEach
      const result = await sendFriendRequest('user1', 'user2');

      expect(result.success).toBe(true);
      expect(mockDoc).toHaveBeenCalledWith('friendships', 'user1_user2');
    });
  });
});
```

### Anti-Patterns to Avoid

- **Defining mock functions inside jest.mock():** Define them outside, then reference inside. Otherwise mockResolvedValue won't work.
- **Testing Firestore query results:** firestore-jest-mock doesn't actually filter data. Test that correct queries were called, not results.
- **Testing components with Firebase:** Focus on service logic. Component tests add complexity without proportional value for this phase.
- **Hitting real Firebase:** Every test must use mocks. No network calls in unit tests.
  </architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Problem              | Don't Build                       | Use Instead                    | Why                                                 |
| -------------------- | --------------------------------- | ------------------------------ | --------------------------------------------------- |
| Firebase mocking     | Custom jest.fn() for every method | Official jest.setup.ts pattern | RNFirebase has 100+ methods across modules          |
| Firestore assertions | Manual mock tracking              | firestore-jest-mock            | Provides mockCollection, mockWhere, mockDoc helpers |
| Expo module mocks    | Manual mocks for expo-\*          | jest-expo preset               | Handles all Expo native modules automatically       |
| Transform patterns   | Custom transformIgnorePatterns    | jest-expo defaults             | Preset knows which node_modules need transpiling    |

**Key insight:** React Native Firebase has many edge cases in mocking (native module loading, factory function pattern, etc.). Using established patterns from the official repo and firestore-jest-mock prevents hours of debugging mock configuration issues.
</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Mock Function Scoping Error

**What goes wrong:** `TypeError: Cannot read property 'mockResolvedValue' of undefined` when setting up mock return values
**Why it happens:** Mock function defined inside jest.mock() is not accessible to test code
**How to avoid:** Define mock functions OUTSIDE jest.mock(), then reference them inside
**Warning signs:** Tests fail with "undefined" when calling .mockResolvedValue() or .mockImplementation()

```javascript
// WRONG
jest.mock('@react-native-firebase/auth', () => {
  return () => ({
    signInWithEmailAndPassword: jest.fn(), // Can't access this!
  });
});

// RIGHT
const mockSignIn = jest.fn();
jest.mock('@react-native-firebase/auth', () => {
  return () => ({
    signInWithEmailAndPassword: mockSignIn, // Can reference mockSignIn in tests
  });
});
```

### Pitfall 2: Native Module Not Found Errors

**What goes wrong:** "RNFirebase core module was not found natively on iOS" during tests
**Why it happens:** Jest tries to load native modules that don't exist in test environment
**How to avoid:** Mock @react-native-firebase/app FIRST before other modules in jest.setup.js
**Warning signs:** Tests fail immediately with native module errors before any assertions

### Pitfall 3: Firestore Mock Data Expectations

**What goes wrong:** Tests pass but don't actually verify correct behavior because mock data isn't filtered
**Why it happens:** firestore-jest-mock doesn't implement actual query filtering - all data returns regardless of where() clauses
**How to avoid:** Assert on mock function CALLS (mockWhere called with correct args), not on results
**Warning signs:** Tests pass even when query logic is wrong

### Pitfall 4: Async/Await Not Waited

**What goes wrong:** Tests pass immediately without executing async code
**Why it happens:** Missing await on async service function calls
**How to avoid:** Always await async functions, use async test functions
**Warning signs:** Mocks show 0 calls even though code should call them

### Pitfall 5: Jest Transform Errors with ESM

**What goes wrong:** "Unexpected token 'export'" errors when running tests
**Why it happens:** Some node_modules use ESM syntax that Jest doesn't handle by default
**How to avoid:** Use jest-expo preset which handles this, or add to transformIgnorePatterns
**Warning signs:** Syntax errors pointing to node_modules files
</common_pitfalls>

<code_examples>

## Code Examples

Verified patterns from official sources:

### Jest Configuration (package.json)

```json
// Source: Expo documentation
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watchAll",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": ["<rootDir>/__tests__/setup/jest.setup.js"],
    "testPathIgnorePatterns": ["<rootDir>/node_modules/", "<rootDir>/__tests__/setup/"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

### Firebase Mock Setup File

```javascript
// __tests__/setup/jest.setup.js
// Source: Adapted from react-native-firebase/jest.setup.ts

// Prevent native module errors
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: () => ({
    app: jest.fn(),
  }),
  firebase: {
    app: jest.fn(),
  },
}));

// Auth mock with exported functions for test assertions
const mockSignInWithEmailAndPassword = jest.fn(() =>
  Promise.resolve({ user: { uid: 'test-uid' } })
);
const mockSignOut = jest.fn(() => Promise.resolve());
const mockOnAuthStateChanged = jest.fn();
const mockCurrentUser = { uid: 'test-uid', email: 'test@example.com' };

jest.mock('@react-native-firebase/auth', () => {
  return () => ({
    signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
    signOut: mockSignOut,
    onAuthStateChanged: mockOnAuthStateChanged,
    currentUser: mockCurrentUser,
  });
});

// Export for use in tests
global.mockSignInWithEmailAndPassword = mockSignInWithEmailAndPassword;
global.mockSignOut = mockSignOut;
global.mockOnAuthStateChanged = mockOnAuthStateChanged;

// Storage mock
jest.mock('@react-native-firebase/storage', () => {
  return () => ({
    ref: jest.fn(() => ({
      putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
      getDownloadURL: jest.fn(() => Promise.resolve('https://mock-url.com/photo.jpg')),
      delete: jest.fn(() => Promise.resolve()),
    })),
  });
});

// Expo modules
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));
```

### Service Test Example

```javascript
// __tests__/services/authService.test.js
import { signIn, signOut } from '../../src/services/firebase/authService';

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('authService', () => {
  describe('signIn', () => {
    test('returns success with user on valid credentials', async () => {
      global.mockSignInWithEmailAndPassword.mockResolvedValueOnce({
        user: { uid: 'user123', email: 'test@test.com' },
      });

      const result = await signIn('test@test.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user.uid).toBe('user123');
      expect(global.mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        'test@test.com',
        'password123'
      );
    });

    test('returns error on invalid credentials', async () => {
      global.mockSignInWithEmailAndPassword.mockRejectedValueOnce(
        new Error('auth/invalid-credentials')
      );

      const result = await signIn('bad@test.com', 'wrong');

      expect(result.success).toBe(false);
      expect(result.error).toContain('invalid-credentials');
    });
  });

  describe('signOut', () => {
    test('calls Firebase signOut', async () => {
      await signOut();

      expect(global.mockSignOut).toHaveBeenCalled();
    });
  });
});
```

### Firestore Query Test Example

```javascript
// __tests__/services/photoService.test.js
const { mockReactNativeFirestore } = require('firestore-jest-mock');
const { mockCollection, mockWhere, mockGet } = require('firestore-jest-mock/mocks/firestore');

import { getDevelopingPhotos, triagePhoto } from '../../src/services/firebase/photoService';

describe('photoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockReactNativeFirestore({
      database: {
        photos: [
          { id: 'p1', userId: 'u1', status: 'developing', capturedAt: new Date() },
          { id: 'p2', userId: 'u1', status: 'revealed', capturedAt: new Date() },
          { id: 'p3', userId: 'u2', status: 'developing', capturedAt: new Date() },
        ],
      },
    });
  });

  describe('getDevelopingPhotos', () => {
    test('queries photos collection with correct filters', async () => {
      await getDevelopingPhotos('u1');

      expect(mockCollection).toHaveBeenCalledWith('photos');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'u1');
      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'developing');
    });
  });
});
```

</code_examples>

<sota_updates>

## State of the Art (2024-2025)

| Old Approach                 | Current Approach                   | When Changed | Impact                                           |
| ---------------------------- | ---------------------------------- | ------------ | ------------------------------------------------ |
| firebase-mock                | Manual mocks + firestore-jest-mock | 2022+        | firebase-mock is for web SDK, not RN Firebase    |
| preset: 'react-native'       | preset: 'jest-expo'                | Expo SDK 50+ | jest-expo handles all Expo-specific transforms   |
| @testing-library/jest-native | @testing-library/react-native      | 2023         | jest-native deprecated, merged into react-native |

**New tools/patterns to consider:**

- **React Native Testing Library**: User-centric testing if component tests added later
- **jest-expo/universal**: Multi-platform testing (iOS, Android, web) in single run

**Deprecated/outdated:**

- **firebase-mock npm package**: For web Firebase SDK only, not React Native Firebase
- **@testing-library/jest-native**: Merged into @testing-library/react-native
- **Enzyme for React Native**: Community moved to Testing Library
  </sota_updates>

<open_questions>

## Open Questions

Things that couldn't be fully resolved:

1. **Firestore subcollection mocking depth**
   - What we know: firestore-jest-mock supports \_collections for nested data
   - What's unclear: How well it handles deeply nested subcollections in this project
   - Recommendation: Start with flat collections, add subcollection support if tests require it

2. **serverTimestamp() handling in mocks**
   - What we know: Firebase serverTimestamp() returns a sentinel value
   - What's unclear: Best pattern for mocking time-based logic (reveal timing)
   - Recommendation: Mock Date.now() or use jest.useFakeTimers() for time-sensitive tests
     </open_questions>

<sources>
## Sources

### Primary (HIGH confidence)

- [Expo Unit Testing Documentation](https://docs.expo.dev/develop/unit-testing/) - Official Expo Jest setup guide
- [react-native-firebase/jest.setup.ts](https://github.com/invertase/react-native-firebase/blob/main/jest.setup.ts) - Official RNFirebase mock patterns
- [Jest React Native Tutorial](https://jestjs.io/docs/tutorial-react-native) - Official Jest documentation

### Secondary (MEDIUM confidence)

- [firestore-jest-mock README](https://github.com/sbatson5/firestore-jest-mock) - NPM package documentation, verified against Firestore API
- [My Battle With Jest Mocks and Firebase Auth](https://iamhusnain.com/blog/jest-mocks-and-firebase-auth/) - Common pitfall documentation (June 2025)
- [React Native Firebase GitHub Issue #1902](https://github.com/invertase/react-native-firebase/issues/1902) - Community mocking patterns

### Tertiary (LOW confidence - needs validation)

- None - all findings verified with official sources
  </sources>

<metadata>
## Metadata

**Research scope:**

- Core technology: Jest + jest-expo for Expo React Native
- Ecosystem: firestore-jest-mock, manual Firebase mocks
- Patterns: Service testing, mock function scoping, Firestore assertions
- Pitfalls: Native module errors, mock scoping, async handling

**Confidence breakdown:**

- Standard stack: HIGH - jest-expo is official Expo recommendation
- Architecture: HIGH - patterns from official react-native-firebase repo
- Pitfalls: HIGH - documented in GitHub issues and blog posts
- Code examples: HIGH - adapted from official sources and verified

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - stable ecosystem, Jest/Expo well-established)
</metadata>

---

_Phase: 27-test-suite-setup_
_Research completed: 2026-01-25_
_Ready for planning: yes_
