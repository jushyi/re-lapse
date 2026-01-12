# Architecture

**Analysis Date:** 2026-01-12

## Pattern Overview

**Overall:** Mobile Client + Backend-as-a-Service (Firebase)

**Key Characteristics:**
- React Native mobile app with Expo managed workflow
- Firebase BaaS for backend (Auth, Firestore, Storage, Functions)
- Context API for global state management
- React Navigation for screen navigation
- Real-time data sync via Firestore listeners

## Layers

**Presentation Layer (Screens + Components):**
- Purpose: UI rendering and user interaction
- Contains: React Native screen components and reusable UI components
- Location: `lapse-clone-app/src/screens/*.js`, `lapse-clone-app/src/components/*.js`
- Depends on: Service layer, Context API, Navigation
- Used by: Navigation system (entry points)

**Navigation Layer:**
- Purpose: Screen routing and navigation stack management
- Contains: Stack navigators, tab navigators, deep linking configuration
- Location: `lapse-clone-app/src/navigation/AppNavigator.js`
- Depends on: Screen components, AuthContext
- Used by: App.js (root component)

**Service Layer:**
- Purpose: Business logic and Firebase operations
- Contains: Firebase service modules (auth, photos, darkroom, feed, friendships, notifications)
- Location: `lapse-clone-app/src/services/firebase/*.js`
- Depends on: Firebase SDK, utility functions
- Used by: Screens, context providers, hooks

**Context/State Layer:**
- Purpose: Global state management for authentication and user profile
- Contains: AuthContext provider
- Location: `lapse-clone-app/src/context/AuthContext.js`
- Depends on: authService, AsyncStorage
- Used by: All screens requiring auth state

**Hooks Layer:**
- Purpose: Reusable stateful logic (custom React hooks)
- Contains: useFeedPhotos hook for feed data management
- Location: `lapse-clone-app/src/hooks/useFeedPhotos.js`
- Depends on: Service layer, React hooks
- Used by: Feed-related screens

**Utility Layer:**
- Purpose: Shared helper functions (logging, time formatting, haptics)
- Contains: logger, timeUtils, haptics, debugFeed
- Location: `lapse-clone-app/src/utils/*.js`
- Depends on: React Native APIs
- Used by: Services, screens, components

**Backend Layer (Firebase):**
- Purpose: Cloud-hosted backend services
- Contains: Firestore database, Cloud Storage, Authentication, Cloud Functions
- Location: `lapse-clone-app/functions/index.js` (Cloud Functions source)
- Depends on: Firebase Admin SDK, Expo Push API
- Used by: Service layer (from client), Cloud Functions (serverless)

## Data Flow

**User Authentication Flow:**

1. User enters credentials in LoginScreen/SignUpScreen
2. Screen calls AuthContext.login() or AuthContext.signup()
3. AuthContext calls authService.signInWithEmail() or authService.signUpWithEmail()
4. authService interacts with Firebase Auth API
5. On success, Firebase returns user object
6. AuthContext stores user in state and AsyncStorage
7. AppNavigator re-renders, showing MainTabNavigator or ProfileSetupScreen

**Photo Capture Flow:**

1. User opens CameraScreen
2. User taps capture button → CameraScreen.handleCapturePhoto()
3. expo-camera captures photo, returns URI
4. expo-image-manipulator compresses photo
5. CameraScreen calls photoService.uploadPhoto(userId, photoUri)
6. photoService uploads to Firebase Storage
7. photoService creates Firestore document in `photos/` collection (status: 'developing')
8. photoService updates darkroom badge count
9. CameraScreen navigates to Darkroom tab with animation

**Feed Data Flow:**

1. FeedScreen mounts, calls useFeedPhotos hook
2. useFeedPhotos calls feedService.subscribeFeedPhotos(friendIds)
3. feedService sets up Firestore onSnapshot listener on `photos/` collection (where photoState == 'journal')
4. Firestore pushes real-time updates to client
5. useFeedPhotos updates state with new photos
6. FeedScreen re-renders FlatList with FeedPhotoCard components
7. User taps emoji → FeedScreen calls feedService.toggleReaction()
8. feedService updates Firestore photo document (reactions field)
9. Firestore listener triggers update, UI reflects new reaction count

**Push Notification Flow:**

1. Firestore document event triggers (e.g., darkroom update, friendship created)
2. Firebase Cloud Function executes (sendPhotoRevealNotification, sendFriendRequestNotification)
3. Function fetches recipient's fcmToken from Firestore
4. Function sends notification payload to Expo Push API
5. Expo delivers notification to device
6. User taps notification → App.js notification handler extracts deep link data
7. navigationRef.navigate() routes to target screen

**State Management:**
- Authentication state: Managed by AuthContext, persisted to AsyncStorage
- Feed data: Managed by useFeedPhotos hook, real-time sync via Firestore listeners
- Navigation state: Managed by React Navigation
- Transient UI state: Local component state (useState)

## Key Abstractions

**Service:**
- Purpose: Encapsulate Firebase operations for a domain
- Examples: `authService.js`, `photoService.js`, `darkroomService.js`, `feedService.js`, `friendshipService.js`, `notificationService.js`
- Pattern: Exported functions (module pattern), not classes
- Location: `lapse-clone-app/src/services/firebase/*.js`

**Context Provider:**
- Purpose: Share authentication state globally
- Examples: `AuthContext.js`
- Pattern: React Context with Provider/Consumer
- Location: `lapse-clone-app/src/context/AuthContext.js`

**Custom Hook:**
- Purpose: Reusable stateful logic for complex data management
- Examples: `useFeedPhotos.js` (handles feed loading, pagination, real-time updates)
- Pattern: React custom hook (returns state and functions)
- Location: `lapse-clone-app/src/hooks/*.js`

**Navigator:**
- Purpose: Define screen hierarchies and routing
- Examples: MainTabNavigator (bottom tabs), FriendsStackNavigator (nested stack)
- Pattern: React Navigation declarative configuration
- Location: `lapse-clone-app/src/navigation/AppNavigator.js`

## Entry Points

**App Entry:**
- Location: `lapse-clone-app/App.js`
- Triggers: App launch
- Responsibilities: Initialize AuthContext, setup notification listeners, render AppNavigator

**Navigation Root:**
- Location: `lapse-clone-app/src/navigation/AppNavigator.js`
- Triggers: Rendered by App.js after AuthContext initialization
- Responsibilities: Route to auth screens or main tabs based on auth state, configure deep linking

**Cloud Functions Entry:**
- Location: `lapse-clone-app/functions/index.js`
- Triggers: Firestore document events (onCreate, onUpdate)
- Responsibilities: Send push notifications via Expo API

## Error Handling

**Strategy:** Service layer returns `{ success, error }` objects, screens handle errors with user feedback

**Patterns:**
- Services use try/catch, return error messages in result objects
- Screens check result.success, display Alert on failure
- AuthContext handles auth errors, sets error state
- Cloud Functions log errors to Firebase Functions logs

## Cross-Cutting Concerns

**Logging:**
- Framework: Custom logger utility (`lapse-clone-app/src/utils/logger.js`)
- Levels: debug, info, warn, error
- Pattern: Structured logging with context objects, automatic sensitive data sanitization
- Environment-aware: DEBUG/INFO in development, WARN/ERROR in production

**Validation:**
- Pattern: Manual validation in screens and services (no schema library)
- Example: Email format checking, username uniqueness in authService

**Authentication:**
- Pattern: AuthContext wraps app, provides user state to all screens
- Protected routes: Conditional rendering in AppNavigator based on AuthContext.user

**Real-time Sync:**
- Pattern: Firestore onSnapshot listeners in service layer, unsubscribe on unmount
- Example: feedService.subscribeFeedPhotos(), friendshipService.subscribeFriendships()

**Haptic Feedback:**
- Pattern: Utility function wraps expo-haptics, called on key user actions
- Location: `lapse-clone-app/src/utils/haptics.js`
- Usage: Photo capture, reactions, friend requests

---

*Architecture analysis: 2026-01-12*
*Update when major patterns change*
