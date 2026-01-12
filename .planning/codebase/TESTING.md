# Testing Patterns

**Analysis Date:** 2026-01-12

## Test Framework

**Runner:**
- Not configured (no test framework in package.json)
- Future: Jest or Vitest recommended for React Native

**Assertion Library:**
- Not applicable (no testing setup)

**Run Commands:**
```bash
# No test commands configured yet
# Future: npm test, npm run test:watch
```

## Test File Organization

**Location:**
- Not applicable (no tests exist yet)
- Recommended: `src/**/__tests__/*.test.js` (co-located with source) or `tests/` directory

**Naming:**
- Recommended: `ComponentName.test.js`, `serviceName.test.js`

**Structure:**
- Not applicable (no tests exist)

## Test Structure

**Suite Organization:**
- Not applicable (no testing framework configured)

**Patterns:**
- Recommended: Arrange/Act/Assert pattern
- Recommended: describe() blocks for grouping, it() for individual tests

## Mocking

**Framework:**
- Not applicable (no mocking library configured)
- Future: Jest built-in mocking or manual mocks

**Patterns:**
- Future needs:
  - Mock Firebase SDK (Firestore, Auth, Storage)
  - Mock expo-camera for photo capture tests
  - Mock expo-notifications for notification tests
  - Mock AsyncStorage for persistence tests
  - Mock navigation (React Navigation testing library)

**What to Mock:**
- Firebase operations (Firestore queries, Auth calls, Storage uploads)
- External APIs (Expo Push Notification API)
- Device features (camera, notifications, haptics)
- Navigation actions

**What NOT to Mock:**
- Pure utility functions (timeUtils, logger)
- React components (test actual rendering)

## Fixtures and Factories

**Test Data:**
- Not applicable (no tests exist)
- Recommended: Factory functions for creating test users, photos, friendships

**Example Future Pattern:**
```javascript
// tests/fixtures/users.js
export const createTestUser = (overrides = {}) => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  username: 'testuser',
  ...overrides
});

// tests/fixtures/photos.js
export const createTestPhoto = (overrides = {}) => ({
  id: 'photo-123',
  userId: 'test-user-123',
  imageURL: 'https://example.com/photo.jpg',
  status: 'revealed',
  photoState: 'journal',
  capturedAt: new Date(),
  ...overrides
});
```

**Location:**
- Recommended: `tests/fixtures/` for shared test data

## Coverage

**Requirements:**
- Not applicable (no coverage tooling configured)
- Future goal: 70-80% coverage for critical paths

**Configuration:**
- Not applicable

**View Coverage:**
```bash
# Future: npm run test:coverage
```

## Test Types

**Unit Tests:**
- Not implemented yet
- Future scope: Test service functions (authService, photoService, etc.)
- Mock Firebase SDK
- Fast execution (<1s per test)

**Integration Tests:**
- Not implemented yet
- Future scope: Test service layer + Firebase interactions
- Use Firebase Emulators for integration testing
- Test photo lifecycle (upload → develop → reveal → triage)

**E2E Tests:**
- Not implemented yet
- Future scope: Test critical user flows with Detox or Maestro
- Flows to test:
  - Sign up → profile setup → camera → darkroom → feed
  - Friend request flow
  - Reaction flow

**Component Tests:**
- Not implemented yet
- Future scope: Test React components with React Native Testing Library
- Test rendering, user interactions, prop changes

## Common Patterns

**Async Testing:**
- Not applicable (no tests exist)
- Recommended pattern:
```javascript
it('should upload photo successfully', async () => {
  const result = await photoService.uploadPhoto(userId, photoUri);
  expect(result.success).toBe(true);
  expect(result.photoId).toBeDefined();
});
```

**Error Testing:**
- Not applicable (no tests exist)
- Recommended pattern:
```javascript
it('should return error on invalid input', async () => {
  const result = await authService.signUpWithEmail('invalid', 'short');
  expect(result.success).toBe(false);
  expect(result.error).toContain('Invalid email');
});
```

**Firebase Mocking:**
- Not applicable (no tests exist)
- Recommended: Use Firebase Emulators or jest.mock()

**Snapshot Testing:**
- Not recommended for React Native (prefer explicit assertions)

## Testing Philosophy (from CLAUDE.md)

**Manual Testing Checklist:**
- Test on physical iPhone device (Expo Go for dev, standalone build for prod features)
- Test happy path (expected user flow)
- Test error cases (network failure, invalid input)
- Test edge cases (empty states, maximum limits)
- Test permissions (camera, notifications)
- Verify Firebase Security Rules prevent unauthorized access

**Test Accounts:**
- Recommended: Create 3-5 test accounts for different scenarios:
  1. New user (incomplete profile)
  2. Active user (with friends)
  3. User with developing photos
  4. User with revealed photos
  5. User with no friends (empty state)

## Known Testing Gaps

**Critical Untested Areas:**
1. **Photo Lifecycle** - Upload, compress, darkroom reveal, triage flow
2. **Friend System** - Send request, accept, decline, remove friend
3. **Reactions System** - Toggle reaction, multi-reaction support, real-time updates
4. **Push Notifications** - Permission flow, token generation, Cloud Function triggers, deep linking
5. **Feed System** - Real-time updates, pagination, friends-only filtering
6. **Authentication** - Sign up, login, profile setup, session persistence

**Future Testing Priorities (Week 12):**
1. Set up Jest or Vitest
2. Add unit tests for critical service functions
3. Configure Firebase Emulators for integration tests
4. Add component tests for key UI components
5. Manual testing checklist for MVP release

## Future Test Setup Recommendations

**Packages to Install:**
```json
{
  "devDependencies": {
    "jest": "^29.x",
    "@testing-library/react-native": "^12.x",
    "@testing-library/jest-native": "^5.x",
    "react-test-renderer": "19.1.0"
  }
}
```

**Jest Configuration:**
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|firebase)/)'
  ],
  moduleNameMapper: {
    '^firebase/(.*)$': '<rootDir>/__mocks__/firebase/$1.js'
  }
};
```

---

*Testing analysis: 2026-01-12*
*Update when test patterns change or testing is implemented*

**NOTE:** Testing infrastructure is planned for Week 12 (Final Polish & Testing) as part of MVP completion.
