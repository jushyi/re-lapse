# Coding Conventions

**Analysis Date:** 2026-01-12

## Naming Patterns

**Files:**
- PascalCase for React components: `FeedScreen.js`, `PhotoDetailModal.js`, `UserSearchCard.js`
- camelCase for services and utilities: `authService.js`, `feedService.js`, `timeUtils.js`, `logger.js`
- kebab-case for multi-word config: `firebase-config.js` (if present)
- UPPERCASE for project docs: `README.md`, `CLAUDE.md`

**Functions:**
- camelCase for all functions: `uploadPhoto()`, `sendFriendRequest()`, `getTimeAgo()`
- No special prefix for async functions (async keyword used)
- Handle prefix for event handlers: `handleCapturePhoto`, `handleLogin`, `handleReaction`

**Variables:**
- camelCase for variables: `userId`, `photoId`, `friendshipId`
- UPPER_SNAKE_CASE for constants: `PHOTO_STATES`, `DEFAULT_REVEAL_INTERVAL` (if used)
- Descriptive names: `isCapturing`, `hasMore`, `currentUserId`

**Types:**
- Not applicable (JavaScript, no TypeScript)
- JSDoc type comments may be used in services

## Code Style

**Formatting:**
- No explicit Prettier config detected (likely using default or none)
- Indentation: 2 spaces (React Native convention)
- Quotes: Single quotes for strings (inferred from React Native standard)
- Semicolons: Optional/inconsistent (JavaScript allows omission)
- Line length: Not enforced (no config detected)

**Linting:**
- No ESLint config detected in package.json
- Likely relying on Expo/React Native defaults

**Code Organization:**
- Imports at top of file
- Component definition
- Styles at bottom (StyleSheet.create)
- Exports at end

## Import Organization

**Order:**
(Inferred from React Native best practices)
1. React and React Native core: `import React from 'react'`, `import { View, Text } from 'react-native'`
2. Third-party packages: `import { collection, query } from 'firebase/firestore'`
3. Navigation: `import { useNavigation } from '@react-navigation/native'`
4. Internal modules: `import { feedService } from '../services/firebase/feedService'`
5. Components: `import { FeedPhotoCard } from '../components'`
6. Context: `import { useAuth } from '../context/AuthContext'`
7. Utilities: `import { logger } from '../utils/logger'`

**Grouping:**
- Blank lines between import groups (likely)
- Alphabetical within groups (not enforced)

**Path Aliases:**
- No path aliases configured (uses relative imports: `../`, `./`)

## Error Handling

**Patterns:**
- Services return `{ success: true/false, error: 'message' }` objects
- Screens use try/catch for async operations
- Errors logged via logger utility before returning

**Example Pattern:**
```javascript
// Service layer
export const uploadPhoto = async (userId, photoUri) => {
  logger.debug('PhotoService.uploadPhoto: Starting', { userId });
  try {
    // ... upload logic
    logger.info('PhotoService.uploadPhoto: Success', { photoId });
    return { success: true, photoId };
  } catch (error) {
    logger.error('PhotoService.uploadPhoto: Failed', { error: error.message });
    return { success: false, error: error.message };
  }
};

// Screen usage
const handleUpload = async () => {
  const result = await photoService.uploadPhoto(userId, uri);
  if (!result.success) {
    Alert.alert('Error', result.error);
  }
};
```

**Error Types:**
- Services throw errors, caught internally and returned in result object
- Screens display errors via Alert.alert() or UI error messages
- No custom error classes (using Error constructor)

## Logging

**Framework:**
- Custom logger utility: `lapse-clone-app/src/utils/logger.js`
- Levels: debug, info, warn, error

**Patterns:**
- Structured logging with context objects: `logger.info('User action', { userId, action })`
- Log at service boundaries (function entry/exit)
- Log state transitions and external API calls
- Automatic sensitive data sanitization (passwords, tokens)
- Environment-aware: DEBUG/INFO in dev, WARN/ERROR in prod
- No console.log in committed code (use logger instead)

**Example:**
```javascript
logger.debug('FeedService.subscribeFeedPhotos: Starting', { userId, friendIds });
logger.info('FeedScreen: User pressed capture button');
logger.error('PhotoService.uploadPhoto: Upload failed', { error: error.message });
```

## Comments

**When to Comment:**
- Explain why, not what: `// Retry 3 times because Firebase has transient failures`
- Document business rules: `// Photos revealed in batches every 0-2 hours`
- Explain non-obvious logic or workarounds
- Avoid obvious comments: `// Set count to 0`

**JSDoc/Documentation:**
- Not consistently used (inferred from codebase)
- Service functions may have JSDoc comments (optional)

**TODO Comments:**
- Format: `// TODO: description`
- Example: `// TODO: Add pagination for large friend lists`

## Function Design

**Size:**
- Keep under 50-100 lines where possible
- Extract helpers for complex logic
- Service functions are focused on single responsibility

**Parameters:**
- 1-3 parameters typical
- Use options object for 4+ parameters (not commonly seen)
- Destructure where helpful: `const { userId, photoId } = params`

**Return Values:**
- Services return `{ success, data, error }` objects
- Explicit return statements
- Return early for guard clauses

**Async Patterns:**
- async/await preferred over Promise chains
- try/catch for error handling
- No .catch() chaining

## Module Design

**Exports:**
- Named exports preferred: `export const functionName = ...`
- Default exports for React components: `export default ScreenName`
- Service modules export multiple functions

**File Organization:**
- One primary component or service per file
- Related utilities can be in same file if small
- Barrel exports in `src/components/index.js`

**React Component Pattern:**
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // effect logic
  }, [dependencies]);

  const handleAction = () => {
    // handler logic
  };

  return (
    <View style={styles.container}>
      {/* JSX */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // styles
  },
});

export default ComponentName;
```

**Service Module Pattern:**
```javascript
import { firestore } from './firebaseConfig';
import { logger } from '../../utils/logger';

export const functionName = async (param1, param2) => {
  logger.debug('ServiceName.functionName: Starting', { param1, param2 });
  try {
    // logic
    logger.info('ServiceName.functionName: Success');
    return { success: true, data };
  } catch (error) {
    logger.error('ServiceName.functionName: Failed', { error: error.message });
    return { success: false, error: error.message };
  }
};
```

## React Native Specific

**StyleSheet:**
- Styles defined at bottom of file using StyleSheet.create()
- Style objects named semantically: `container`, `title`, `button`

**Component Structure:**
- Functional components only (no class components)
- Hooks for state management (useState, useEffect)
- Custom hooks for complex logic (useFeedPhotos)

**Platform-Specific Code:**
- Not extensively used (Expo abstracts platform differences)
- Platform.OS checks if needed: `Platform.OS === 'ios'`

---

*Convention analysis: 2026-01-12*
*Update when patterns change*
