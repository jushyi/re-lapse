# Claude Development Guide - Lapse Clone

**Project:** Lapse Social Media App Clone
**Status:** Active Development (Week 11 Complete - Push Notifications System | Week 12 Next - Final Polish & Testing)
**Platform:** iOS (React Native + Expo)
**Last Updated:** 2026-01-08

---

## 📋 Project Overview

This is a full-featured clone of the Lapse social media app - a friends-only, disposable camera-inspired platform that emphasizes authentic photo-sharing over follower metrics. The app features timed photo reveals (darkroom system), instant camera interface, and emoji-based reactions instead of likes.

### Core Philosophy
- **Friends not Followers** - Private, friend-only content
- **Authentic over Polished** - No filters, raw photography
- **Anti-Instagram** - No likes, no algorithms, no metrics
- **Nostalgic Experience** - Film camera aesthetics and darkroom metaphors

---

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend:** React Native with Expo (Managed Workflow)
- **Backend:** Firebase (BaaS)
  - Authentication: Firebase Auth (Email/Password + Apple Sign-In)
  - Database: Cloud Firestore (NoSQL)
  - Storage: Firebase Cloud Storage
  - Functions: Firebase Cloud Functions (for scheduled reveals)
- **State Management:** React Context API + AsyncStorage
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **Camera:** expo-camera
- **Image Processing:** expo-image-manipulator

### Project Structure
```
lapse-clone-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── context/          # Global state (AuthContext)
│   ├── services/         # Firebase services
│   │   └── firebase/     # All Firebase-related services
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   └── constants/        # App constants
├── docs/                 # Project documentation
│   ├── MVP_ROADMAP.md
│   ├── LAPSE_FEATURES_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   └── PROJECT_ROADMAP.md
└── App.js               # Root component
```

---

## 🗄️ Database Schema (Firestore)

### Collections Overview
1. **users/** - User profiles and authentication data
2. **photos/** - Photo metadata and reveal state
3. **darkrooms/** - Batch reveal timing per user
4. **friendships/** - Friend connections and requests
5. **notifications/** - In-app notification system
6. **photoViews/** - Track "NEW" indicator for unseen photos

### Key Data Models

#### User Document
```javascript
users/{userId} {
  username: string (unique, lowercase),
  email: string,
  displayName: string,
  bio: string,
  profilePhotoURL: string,
  createdAt: timestamp,
  fcmToken: string,
  profileSetupCompleted: boolean
}
```

#### Photo Document
```javascript
photos/{photoId} {
  userId: string,
  imageURL: string,
  capturedAt: timestamp,
  revealedAt: timestamp | null,
  status: 'developing' | 'revealed' | 'triaged',
  photoState: 'journal' | 'archive' | null,
  visibility: 'friends-only',
  month: string (YYYY-MM),
  reactions: {
    [userId]: {
      [emoji]: count  // e.g., { 'user123': { '😂': 3, '❤️': 1 } }
    }
  },
  reactionCount: number // Total across all users and emojis
}
```

#### Darkroom Document
```javascript
darkrooms/{userId} {
  userId: string,
  nextRevealAt: timestamp,
  lastRevealedAt: timestamp | null,
  createdAt: timestamp
}
```

**📖 See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for complete schema details.**

---

## 🎯 Core Features & Status

### ✅ Completed Features (Week 1-11)

#### Authentication System (Week 3-4)
- Email/password signup and login
- Apple Sign-In integration
- Profile setup flow (username, bio, profile photo)
- Password reset functionality
- Session persistence with AsyncStorage
- AuthContext for global state

#### Camera & Photo Capture (Week 5-6)
- Instant camera interface
- Photo capture with front/back camera toggle
- Flash control (off/on/auto)
- Photo compression (1080px max, 0.8 quality)
- Firebase Storage upload
- Auto-save to darkroom with "developing" status
- Animated capture feedback (snapshot → darkroom)
- Badge indicator showing developing photo count

#### Darkroom System (Week 6)
- Batch reveal system (0-2 hour random intervals)
- DarkroomScreen for reviewing revealed photos
- Photo triage: Archive, Journal, or Delete
- Real-time badge count updates
- Photo lifecycle management

#### Feed System (Week 7)
- Complete feed screen with FlatList
- Real-time feed updates with Firestore listeners
- Pull-to-refresh functionality
- Infinite scroll with pagination
- FeedPhotoCard component with user info, photos, reactions
- FeedLoadingSkeleton with pulse animation
- Time formatting utilities (getTimeAgo, formatDate)
- useFeedPhotos custom hook for state management
- feedService with getFeedPhotos() and subscribeFeedPhotos()
- Client-side sorting to avoid Firebase composite indexes
- Empty state and error state handling
- Debug utilities for troubleshooting feed issues

#### Photo Detail Modal & Reactions System (Week 8)
- PhotoDetailModal with full-screen photo viewer
- iOS-style swipe-down-to-close gesture with smooth fade animation
- Inline horizontal emoji picker (8 emoji options)
- Multi-reaction support (users can react multiple times with same emoji)
- Dynamic emoji sorting by count with frozen order during rapid tapping
- Haptic feedback for reactions
- Optimistic UI updates with Firebase sync
- New reaction data structure: reactions[userId][emoji] = count
- Real-time reaction count updates
- toggleReaction service function in feedService
- Profile photo overlapping header/photo boundary
- User info (displayName + timestamp) at bottom left
- Smooth parallel animations (translateY + opacity fade)

#### Friends & Social Graph System (Week 9)
- friendshipService.js with 11 core functions (send, accept, decline, remove, getFriendships, etc.)
- Deterministic friendship ID generation ([lowerUserId]_[higherUserId])
- UserSearchScreen with debounced search (500ms) and case-insensitive username matching
- FriendRequestsScreen with tabbed interface (Received/Sent) and badge counts
- FriendsListScreen with search/filter and remove friend functionality
- UserSearchCard and FriendRequestCard components
- Friends tab in main navigation with stack navigator (FriendsList → UserSearch → FriendRequests)
- Feed filtering to friends-only photos (client-side filtering)
- Real-time friendship updates with onSnapshot listeners
- Feed auto-refresh on tab focus (ensures current friendship state)
- Optimistic UI updates throughout friendship flows
- Firestore security rules for friendships collection
- Fixed infinite re-render loop in useFeedPhotos
- Fixed permission errors for reading non-existent documents

#### Push Notifications System (Week 11)
- notificationService.js with 8 core functions (permissions, tokens, handlers)
- iOS notification permissions flow integrated in ProfileSetupScreen
- Expo Push Token generation and storage in Firestore (users/{userId}/fcmToken)
- App.js notification initialization and listeners (foreground + tap handlers)
- Deep linking configuration for all notification types
- NavigationRef for programmatic navigation from notifications
- Three deployed Cloud Functions (sendPhotoRevealNotification, sendFriendRequestNotification, sendReactionNotification)
- Firestore triggers for real-time notification sending
- Expo Push Notification API integration
- Complete notification flow: Firestore event → Cloud Function → Expo API → Device
- Local notification testing utilities (testNotifications.js)
- Tested: permissions, tokens, deep linking, navigation (all working)
- Production deployment: All functions deployed to Firebase (us-central1, Node.js 20)
- EAS project initialized (projectId: b7da185a-d3e1-441b-88f8-0d4379333590)
- Comprehensive documentation (11+ Week 11 docs + functions/README.md)
- **Note:** Remote notification delivery requires standalone build (Expo Go limitation)

### ⏳ Upcoming Features (Week 12)

#### Polish & Testing (Week 12)
- Build standalone development app for full notification testing
- Test remote notifications end-to-end (photo reveals, friend requests, reactions)
- App icon and splash screen
- Smooth animations/transitions
- Error boundaries
- Haptic feedback throughout
- Image loading optimization
- Performance optimization
- Comprehensive bug fixes and testing
- Prepare for TestFlight distribution

### ❌ Post-MVP Features (Phase 2)
- Shared Rolls (collaborative group shoots)
- Group Chats
- Direct Messaging & Instants
- Journals (personal galleries)
- Selects (curated profile showcase)
- Albums (collaborative collections)
- Best Friends list
- Lock screen widget
- Advanced filters/effects
- Comments system

---

## 🔑 Key Implementation Patterns

### 1. Darkroom Reveal Flow

**The darkroom is the core differentiator of Lapse.** Photos are revealed in batches, not individually.

```javascript
// When user opens DarkroomScreen:
1. Fetch darkroom document: darkrooms/{userId}
2. Check if nextRevealAt <= currentTime
3. If ready:
   - Query ALL photos where userId==user AND status=='developing'
   - Update ALL to status='revealed' and set revealedAt timestamp
   - Schedule next reveal: nextRevealAt = randomTime(0-2 hours from now)
   - Update lastRevealedAt to currentTime
4. Display revealed photos for triage (Archive/Journal/Delete)
```

**Implementation Files:**
- [src/services/firebase/darkroomService.js](lapse-clone-app/src/services/firebase/darkroomService.js)
- [src/services/firebase/photoService.js](lapse-clone-app/src/services/firebase/photoService.js)
- [src/screens/DarkroomScreen.js](lapse-clone-app/src/screens/DarkroomScreen.js)

### 2. Photo Lifecycle States

```
CAPTURE → status: 'developing', photoState: null
         ↓ (timed reveal)
REVEAL  → status: 'revealed', photoState: null
         ↓ (user triage)
TRIAGE  → status: 'triaged', photoState: 'journal' OR 'archive'
```

- **developing** = Captured, waiting for batch reveal
- **revealed** = Ready for user to triage
- **triaged** = User has chosen Archive/Journal
- **photoState: 'journal'** = Visible in friends' feed (NOTE: 'journal', NOT 'journaled')
- **photoState: 'archive'** = Private, not in feed (NOTE: 'archive', NOT 'archived')

**⚠️ IMPORTANT:** The photoState values are 'journal' and 'archive' (without 'ed' suffix). This matches what DarkroomScreen saves.

### 3. Friend Feed Query Pattern

```javascript
// To display feed of friends' photos:
// For MVP: Shows ALL users' journaled photos (friends-only filter added in Week 9)
1. Query photos where:
   - photoState == 'journal' (NOT 'journaled')
2. Client-side sorting by capturedAt DESC (avoids Firebase composite index)
3. Manual pagination using array slicing
```

**Implementation Files:**
- [src/services/firebase/feedService.js](lapse-clone-app/src/services/firebase/feedService.js)
- [src/hooks/useFeedPhotos.js](lapse-clone-app/src/hooks/useFeedPhotos.js)
- [src/screens/FeedScreen.js](lapse-clone-app/src/screens/FeedScreen.js)
- [src/components/FeedPhotoCard.js](lapse-clone-app/src/components/FeedPhotoCard.js)
- [src/components/FeedLoadingSkeleton.js](lapse-clone-app/src/components/FeedLoadingSkeleton.js)
- [src/components/PhotoDetailModal.js](lapse-clone-app/src/components/PhotoDetailModal.js)
- [src/utils/timeUtils.js](lapse-clone-app/src/utils/timeUtils.js)
- [src/utils/debugFeed.js](lapse-clone-app/src/utils/debugFeed.js)

### 4. Reaction System Pattern

**New multi-reaction data structure** allows users to react multiple times with the same emoji:

```javascript
// Reaction data structure in Firestore:
photos/{photoId} {
  reactions: {
    [userId]: {
      [emoji]: count  // e.g., { '😂': 3, '❤️': 1 }
    }
  },
  reactionCount: number  // Total across all users and emojis
}

// Example:
reactions: {
  'user123': { '😂': 2, '❤️': 1 },
  'user456': { '😂': 1, '🔥': 3 }
}
// Total reactionCount: 7
```

**Reaction Features:**
- Inline horizontal emoji picker (8 emojis)
- Each tap increments count for that emoji
- Dynamic sorting by count (most reacted first)
- Frozen order during rapid tapping (1.5s delay)
- Haptic feedback on each reaction
- Optimistic UI updates with Firebase sync
- Real-time updates across all users

**Implementation Files:**
- [src/services/firebase/feedService.js](lapse-clone-app/src/services/firebase/feedService.js) - toggleReaction()
- [src/components/PhotoDetailModal.js](lapse-clone-app/src/components/PhotoDetailModal.js) - Inline emoji picker
- [src/components/FeedPhotoCard.js](lapse-clone-app/src/components/FeedPhotoCard.js) - Top 3 reactions display
- [src/screens/FeedScreen.js](lapse-clone-app/src/screens/FeedScreen.js) - Reaction handler with optimistic updates
- [src/utils/haptics.js](lapse-clone-app/src/utils/haptics.js) - Haptic feedback

### 5. Photo Detail Modal with Gestures

**iOS-style swipe-down-to-dismiss** with smooth animations:

```javascript
// Gesture handling:
- PanResponder captures swipe gestures
- Excludes footer area (bottom 100px) for emoji taps
- Parallel animations: translateY + opacity fade
- Dismiss threshold: 1/3 screen height OR velocity > 0.5
- Spring-back animation if threshold not met
- 300ms fade transition on close
```

**Layout Structure:**
- Full-screen black background with fade animation
- Close button (✕) at top right
- Profile photo (80x80) overlapping header/photo boundary
- Photo with rounded corners (24px border radius)
- User info (displayName + timestamp) at bottom left
- Footer with horizontal scrolling emoji picker

**Implementation Files:**
- [src/components/PhotoDetailModal.js](lapse-clone-app/src/components/PhotoDetailModal.js)

### 6. Friendship Model

```javascript
// Deterministic friendship ID prevents duplicates:
friendshipId = [lowerUserId]_[higherUserId]

// Example: user123 + user456 = "user123_user456"

friendships/{friendshipId} {
  user1Id: string (alphabetically first),
  user2Id: string (alphabetically second),
  status: 'pending' | 'accepted',
  requestedBy: string (userId who sent request),
  createdAt: timestamp,
  acceptedAt: timestamp | null
}
```

**friendshipService Functions:**
- `generateFriendshipId(userId1, userId2)` - Create deterministic ID
- `sendFriendRequest(fromUserId, toUserId)` - Create pending friendship
- `acceptFriendRequest(friendshipId, userId)` - Accept request
- `declineFriendRequest(friendshipId, userId)` - Decline/cancel request
- `removeFriend(userId1, userId2)` - Delete friendship
- `getFriendships(userId)` - Get all accepted friendships
- `getPendingRequests(userId)` - Get incoming requests
- `getSentRequests(userId)` - Get outgoing requests
- `checkFriendshipStatus(userId1, userId2)` - Check status between users
- `subscribeFriendships(userId, callback)` - Real-time updates
- `getFriendUserIds(userId)` - Get array of friend IDs for feed filtering

**Implementation Files:**
- [src/services/firebase/friendshipService.js](lapse-clone-app/src/services/firebase/friendshipService.js)
- [src/screens/UserSearchScreen.js](lapse-clone-app/src/screens/UserSearchScreen.js)
- [src/screens/FriendRequestsScreen.js](lapse-clone-app/src/screens/FriendRequestsScreen.js)
- [src/screens/FriendsListScreen.js](lapse-clone-app/src/screens/FriendsListScreen.js)
- [src/components/UserSearchCard.js](lapse-clone-app/src/components/UserSearchCard.js)
- [src/components/FriendRequestCard.js](lapse-clone-app/src/components/FriendRequestCard.js)

### 7. Authentication Flow

```javascript
// App boots → AuthContext checks Firebase Auth state
1. If no user → Show Login/SignUp screens
2. If user exists but profileSetupCompleted=false → Show ProfileSetupScreen
3. If user exists and profileSetupCompleted=true → Show MainTabNavigator

// AuthContext provides:
- user (Firebase Auth user)
- userProfile (Firestore user document)
- signup, login, logout functions
- initializing state (loading)
```

**Implementation Files:**
- [src/context/AuthContext.js](lapse-clone-app/src/context/AuthContext.js)
- [src/navigation/AppNavigator.js](lapse-clone-app/src/navigation/AppNavigator.js)
- [src/services/firebase/authService.js](lapse-clone-app/src/services/firebase/authService.js)

### 8. Push Notifications System

**Complete end-to-end notification flow:**

```javascript
// User Action (e.g., photo reveal, friend request, reaction)
1. Firestore document created/updated
   ↓
2. Cloud Function triggered automatically (onCreate/onUpdate)
   ↓
3. Function fetches recipient's FCM token from users/{userId}
   ↓
4. Function sends notification via Expo Push API
   ↓
5. User's device receives notification
   ↓
6. User taps notification
   ↓
7. App.js listener extracts deep link data
   ↓
8. navigationRef.navigate() to relevant screen
```

**Notification Types:**
- **Photo Reveal:** darkroom/{userId} onUpdate → "📸 Photos Ready! X photos are ready to view"
- **Friend Request:** friendships/{id} onCreate → "👋 Friend Request - [Name] sent you a friend request"
- **Reaction:** photos/{photoId} onUpdate → "❤️ New Reaction - [Name] reacted [emoji] to your photo"

**Key Components:**

```javascript
// notificationService.js functions:
- initializeNotifications() - Setup handlers and listeners
- requestNotificationPermission() - Request iOS permissions
- getNotificationToken() - Get Expo Push Token
- storeNotificationToken(userId, token) - Save to Firestore
- handleNotificationReceived(notification) - Foreground handler
- handleNotificationTapped(notification) - Navigation handler
- checkNotificationPermissions() - Verify permission status
- scheduleTestNotification() - Local testing utility
```

**Deep Linking Routes:**
- `lapse://darkroom` → Darkroom tab (photo reveals)
- `lapse://friends/requests` → FriendRequests screen (friend requests)
- `lapse://feed` → Feed tab (reactions)

**Cloud Functions (Firebase):**
- `sendPhotoRevealNotification` - Triggered by darkroom updates
- `sendFriendRequestNotification` - Triggered by friendship creation
- `sendReactionNotification` - Triggered by photo reaction updates

**Implementation Files:**
- [src/services/firebase/notificationService.js](lapse-clone-app/src/services/firebase/notificationService.js)
- [functions/index.js](lapse-clone-app/functions/index.js)
- [functions/README.md](lapse-clone-app/functions/README.md)
- [App.js](lapse-clone-app/App.js) - Notification listeners
- [src/screens/ProfileSetupScreen.js](lapse-clone-app/src/screens/ProfileSetupScreen.js) - Permission request
- [src/navigation/AppNavigator.js](lapse-clone-app/src/navigation/AppNavigator.js) - Deep linking config
- [src/utils/testNotifications.js](lapse-clone-app/src/utils/testNotifications.js) - Testing utilities

**Important Notes:**
- Expo Push Tokens stored in users/{userId}/fcmToken
- Cloud Functions deployed to us-central1 (Node.js 20 runtime)
- Local notifications work in Expo Go (tested and verified)
- Remote notifications require standalone build (Expo Go limitation)
- EAS project initialized for production builds

---

## 📝 Development Best Practices

### Logging Guidelines

**Comprehensive logging is MANDATORY throughout the codebase.** The `logger` utility (`src/utils/logger.js`) provides environment-aware, structured logging with automatic sensitive data sanitization.

#### **When to Log**

**ALWAYS log in these scenarios:**

1. **Function Entry/Exit** (DEBUG level)
   - Service function calls
   - Complex business logic functions
   - Async operations

2. **User Actions** (INFO level)
   - Button presses, form submissions
   - Navigation events
   - Photo capture, friend requests, reactions
   - Sign in/out

3. **State Changes** (DEBUG/INFO level)
   - Context updates (auth state, user profile)
   - Local state mutations in hooks
   - Query results from Firestore

4. **Firebase Operations** (DEBUG/INFO level)
   - Firestore queries (before/after with query params)
   - Storage uploads/downloads
   - Cloud Function calls
   - Real-time listener subscriptions

5. **Errors** (ERROR level)
   - Try/catch blocks
   - Failed API calls
   - Validation failures
   - Permission denials

6. **Warnings** (WARN level)
   - Deprecated code paths
   - Fallback behaviors
   - Performance concerns (slow queries)
   - Missing optional data

#### **Log Level Guidelines**

```javascript
// 🔍 DEBUG - Development-only detailed information
logger.debug('PhotoService: Fetching developing photos', { userId, status: 'developing' });

// ℹ️ INFO - Important user actions and app events
logger.info('User captured photo', { photoId, userId });

// ⚠️ WARN - Recoverable issues
logger.warn('Friend request already exists', { friendshipId, status: 'pending' });

// ❌ ERROR - Failures affecting functionality
logger.error('Failed to upload photo', { error: error.message, photoId });
```

#### **Logging Patterns by Layer**

##### **Services (Firebase)**
```javascript
// Example: photoService.js
export const uploadPhoto = async (userId, photoUri) => {
  logger.debug('PhotoService.uploadPhoto: Starting upload', { userId });

  try {
    const result = await storageUpload(photoUri);
    logger.info('PhotoService.uploadPhoto: Upload successful', {
      userId,
      photoId: result.id,
      size: result.size
    });
    return { success: true, photoId: result.id };
  } catch (error) {
    logger.error('PhotoService.uploadPhoto: Upload failed', {
      userId,
      error: error.message
    });
    return { success: false, error: error.message };
  }
};
```

##### **Screens (User Interactions)**
```javascript
// Example: CameraScreen.js
const handleCapturePhoto = async () => {
  logger.info('CameraScreen: User pressed capture button');

  try {
    setIsCapturing(true);
    logger.debug('CameraScreen: Taking photo');

    const photo = await cameraRef.current.takePictureAsync();
    logger.info('CameraScreen: Photo captured successfully', {
      uri: photo.uri.substring(0, 50) // Truncate URI
    });

    // ... rest of logic
  } catch (error) {
    logger.error('CameraScreen: Photo capture failed', error);
  } finally {
    setIsCapturing(false);
  }
};
```

##### **Context Providers**
```javascript
// Example: AuthContext.js
const signIn = async (email, password) => {
  logger.info('AuthContext: Sign in attempt', { email });

  try {
    setLoading(true);
    const result = await signInWithEmail(email, password);

    if (result.success) {
      logger.info('AuthContext: Sign in successful', { userId: result.user.uid });
    } else {
      logger.warn('AuthContext: Sign in failed', { error: result.error });
    }

    return result;
  } catch (error) {
    logger.error('AuthContext: Sign in error', error);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};
```

##### **Custom Hooks**
```javascript
// Example: useFeedPhotos.js
const loadMorePhotos = async () => {
  logger.debug('useFeedPhotos: Loading more photos', {
    currentCount: photos.length,
    hasMore
  });

  // ... logic

  logger.info('useFeedPhotos: Loaded additional photos', {
    newCount: result.length,
    totalCount: photos.length + result.length
  });
};
```

#### **DO's and DON'Ts**

✅ **DO:**
- Log function entry/exit for all service calls
- Log user actions (button presses, navigation)
- Log Firebase query parameters and result counts
- Log state transitions (loading → success/error)
- Use structured data (objects) for context
- Trust the logger to sanitize sensitive data

❌ **DON'T:**
- Use `console.log` directly (always use `logger`)
- Log passwords, tokens, or API keys (logger handles this)
- Log excessive data in loops (summarize instead)
- Skip error logging in try/catch blocks
- Use generic messages like "Error occurred"

#### **Benefits**

1. **Debugging**: Trace user flows and identify issues quickly
2. **Performance**: Identify slow operations and bottlenecks
3. **Monitoring**: Track user behavior and app health
4. **Production**: Automatic filtering (only WARN/ERROR in prod)
5. **Security**: Automatic sensitive data sanitization
6. **Future**: Ready for Sentry/analytics integration

#### **Example: Complete Service Function**

```javascript
// src/services/firebase/friendshipService.js
export const sendFriendRequest = async (fromUserId, toUserId) => {
  logger.debug('FriendshipService.sendFriendRequest: Starting', {
    fromUserId,
    toUserId
  });

  try {
    // Generate friendship ID
    const friendshipId = generateFriendshipId(fromUserId, toUserId);
    logger.debug('FriendshipService.sendFriendRequest: Generated ID', {
      friendshipId
    });

    // Check if friendship already exists
    const existingRef = doc(db, 'friendships', friendshipId);
    const existingDoc = await getDoc(existingRef);

    if (existingDoc.exists()) {
      logger.warn('FriendshipService.sendFriendRequest: Friendship exists', {
        friendshipId,
        status: existingDoc.data().status
      });
      return { success: false, error: 'Friendship already exists' };
    }

    // Create friendship document
    await setDoc(existingRef, {
      user1Id: [fromUserId, toUserId].sort()[0],
      user2Id: [fromUserId, toUserId].sort()[1],
      status: 'pending',
      requestedBy: fromUserId,
      createdAt: serverTimestamp(),
    });

    logger.info('FriendshipService.sendFriendRequest: Request sent successfully', {
      friendshipId,
      fromUserId,
      toUserId
    });

    return { success: true, friendshipId };
  } catch (error) {
    logger.error('FriendshipService.sendFriendRequest: Failed', {
      fromUserId,
      toUserId,
      error: error.message
    });
    return { success: false, error: error.message };
  }
};
```

---

## 📊 Progress Tracking

| Feature Area | Status | Completion | Next Steps |
|--------------|--------|-----------|------------|
| Authentication | ✅ Complete | 100% | N/A |
| Camera & Upload | ✅ Complete | 100% | N/A |
| Darkroom System | ✅ Complete | 100% | N/A |
| Feed Display | ✅ Complete | 100% | N/A |
| Photo Modal & Reactions | ✅ Complete | 100% | N/A |
| Friends System | ✅ Complete | 100% | N/A |
| Push Notifications | ✅ Complete | 100% | Remote testing in Week 12 |
| Polish & Testing | 🔜 Next Up | 0% | Week 12 (Final Sprint) |

**Legend:** ✅ Complete | 🔜 Not Started

**MVP Progress:** 91% Complete (11 of 12 weeks done)

---

## 🎯 Current Sprint (Week 12)

### Focus: Final Polish & Testing

**Status:** 🔜 Ready to Begin

**Week 11 Completion Summary:**
- ✅ Push Notifications System: COMPLETE (2h 40m vs 12h planned)
- ✅ All 5 phases completed and tested
- ✅ Cloud Functions deployed to production
- ✅ Local notifications fully tested
- ✅ Deep linking verified for all notification types
- ✅ 16 files created, 5 modified, 2000+ lines of code/docs
- 📖 **See [docs/WEEK_11_COMPLETE.md](docs/WEEK_11_COMPLETE.md) for full summary**

**Week 12 Objectives:**
1. Build standalone development app (EAS Build)
2. Test remote notifications end-to-end
   - Photo reveal notifications from Cloud Functions
   - Friend request notifications from Cloud Functions
   - Reaction notifications from Cloud Functions
3. Create app icon (all required sizes)
4. Build splash screen
5. Add smooth animations/transitions
6. Implement error boundaries
7. Add haptic feedback throughout
8. Optimize image loading and caching
9. Comprehensive bug fixes
10. Performance testing and optimization
11. Prepare for TestFlight distribution

**Implementation Plan:**
📖 **Week 12 plan will be created at sprint start**

**Priority Tasks:**
1. **EAS Build** - Create standalone app for remote notification testing
2. **Notification Testing** - Verify end-to-end Cloud Function → Device flow
3. **UI Polish** - App icon, splash screen, animations
4. **Bug Fixes** - Address any issues found during testing
5. **TestFlight Prep** - Final checks before MVP release

---

## 🧪 Testing Strategy

### Manual Testing Checklist (Per Feature)
- [ ] Test on physical iPhone device (Expo Go)
- [ ] Test happy path (expected user flow)
- [ ] Test error cases (network failure, invalid input)
- [ ] Test edge cases (empty states, maximum limits)
- [ ] Test permissions (camera, notifications)
- [ ] Verify Firebase Security Rules prevent unauthorized access

### Test Accounts
Create 3-5 test accounts for different scenarios:
1. New user (incomplete profile)
2. Active user (with friends)
3. User with developing photos
4. User with revealed photos
5. User with no friends (empty state)

### Known Issues / Tech Debt
- Client-side sorting is used to avoid Firebase composite indexes (acceptable trade-off for MVP)
- Remote push notifications require standalone build (Expo Go limitation, not a code issue)
- ProfileScreen photo gallery feature marked as "Coming Soon" (planned for post-MVP)

### Week 9 Completed Features Summary
- ✅ friendshipService.js with 11 core functions
- ✅ Deterministic friendship ID generation
- ✅ UserSearchScreen with debounced search
- ✅ FriendRequestsScreen with tabbed interface
- ✅ FriendsListScreen with remove friend functionality
- ✅ UserSearchCard and FriendRequestCard components
- ✅ Friends tab in main navigation
- ✅ Feed filtering to friends-only photos
- ✅ Real-time friendship updates
- ✅ Feed auto-refresh on tab focus
- ✅ Optimistic UI updates throughout
- ✅ Firestore security rules configured
- ✅ Fixed infinite re-render loop
- ✅ Fixed permission errors

### Week 11 Completed Features Summary
- ✅ notificationService.js with 8 core functions (243 lines)
- ✅ iOS notification permissions integrated in ProfileSetupScreen
- ✅ Expo Push Token generation and Firestore storage
- ✅ App.js notification listeners (foreground + tap)
- ✅ Deep linking configuration with navigationRef
- ✅ Three Cloud Functions deployed to Firebase (340 lines total)
- ✅ Firestore triggers for photo reveals, friend requests, reactions
- ✅ Expo Push Notification API integration
- ✅ Complete notification flow tested (local notifications)
- ✅ Deep linking verified for all notification types
- ✅ EAS project initialized (projectId: b7da185a-d3e1-441b-88f8-0d4379333590)
- ✅ functions/README.md with complete documentation
- ✅ Test utilities created (testNotifications.js)
- ✅ Completed in 2h 40m (vs 12h planned - 10 hours ahead!)
- ⏳ Remote notification testing deferred to Week 12 (requires standalone build)

### Code Cleanup Summary (2026-01-09)
**Complete cleanup of unused code and development utilities completed:**

**Files Deleted (5 files, ~643 lines removed):**
- ❌ `src/components/ReactionPicker.js` (224 lines) - Replaced by inline emoji picker
- ❌ `src/utils/debugFeed.js` (93 lines) - Debug utility no longer needed
- ❌ `src/utils/debugFriendship.js` (150 lines) - Debug utility no longer needed
- ❌ `src/utils/debugDarkroom.js` (101 lines) - Debug utility no longer needed
- ❌ `src/utils/testNotifications.js` (75 lines) - Test utility no longer needed

**Files Modified (4 files):**
- ✅ `src/components/index.js` - Removed ReactionPicker export
- ✅ `src/screens/FeedScreen.js` - Removed debug button, imports, unused variables
- ✅ `src/screens/DarkroomScreen.js` - Removed debugDarkroom import and call
- ✅ `src/screens/ProfileScreen.js` - Removed test notification code (~90 lines), connected to real Firestore data

**ProfileScreen Improvements:**
- ✅ Now displays real user data (username, bio, profile photo from Firestore)
- ✅ Calculates and displays actual stats (photos, friends, reactions)
- ✅ Loading state while fetching data
- ✅ "Coming Soon" section for photo gallery feature
- ✅ Clean, production-ready UI

**Impact:**
- 643 lines of dead code removed
- All syntax validated, no broken imports
- Codebase ready for Week 12 polish and TestFlight distribution

---

## ✅ Definition of Done

A feature is "complete" when:
- [ ] Code implemented and follows established patterns
- [ ] **Comprehensive logging added (DEBUG/INFO/WARN/ERROR at all critical points)**
- [ ] Tested on physical iOS device (iPhone via Expo Go)
- [ ] Error handling implemented (try/catch, loading states)
- [ ] All try/catch blocks include error logging
- [ ] Loading states and empty states handled
- [ ] UI matches design guidelines (colors, typography)
- [ ] Firebase Security Rules updated (if applicable)
- [ ] Documentation updated (this file + MVP_ROADMAP.md)
- [ ] No console errors or warnings (no direct console.log usage)
- [ ] Feature checked off in MVP_ROADMAP.md

---

**🎯 Current Goal:** Implement comprehensive logging throughout codebase, then begin Week 12 tasks (Final Polish & Testing).

**📅 MVP Target:** March 2026 (10-12 weeks total)

**🔗 Quick Links:**
- [Firebase Console](https://console.firebase.com/)
- [Expo Dashboard](https://expo.dev/)
- [📝 Logging Implementation Guide](docs/LOGGING_IMPLEMENTATION_GUIDE.md) ⭐ **NEW - START HERE**
- [Week 9 Summary](docs/WEEK_9_SUMMARY.md)
- [Week 11 Complete](docs/WEEK_11_COMPLETE.md)
- [Week 11 Plan](docs/WEEK_11_PLAN.md)
- [Cloud Functions README](lapse-clone-app/functions/README.md)

---

**Last Updated:** 2026-01-09 by Claude
**Version:** 1.6 (Logging Guidelines + Implementation Guide Added)
