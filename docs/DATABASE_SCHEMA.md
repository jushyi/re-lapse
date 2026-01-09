# Lapse Clone - Firestore Database Schema

**Version:** 1.3
**Last Updated:** 2026-01-07
**Status:** Week 8 Complete (Photo Modal & Reactions)

---

## Overview

This document details the Firestore database schema for the Lapse Clone MVP. The database is structured into 6 main collections optimized for the core features: authentication, photo sharing with timed reveals, darkroom-based batch reveals, friend connections, notifications, and photo view tracking.

---

## Collection Structure

```
firestore/
├── users/
│   └── {userId}/
├── photos/
│   └── {photoId}/
├── darkrooms/
│   └── {userId}/
├── friendships/
│   └── {friendshipId}/
├── notifications/
│   └── {notificationId}/
└── photoViews/
    └── {viewId}/
```

---

## 1. Users Collection

**Path:** `users/{userId}`
**Purpose:** Store user profile data and authentication metadata

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | `string` | ✅ | Unique username (lowercase, alphanumeric + underscore) |
| `email` | `string` | ✅ | User's email address (from Firebase Auth) |
| `displayName` | `string` | ✅ | User's display name (can contain spaces, caps) |
| `bio` | `string` | ❌ | User bio (max 150 characters) |
| `profilePhotoURL` | `string` | ❌ | Firebase Storage URL for profile photo |
| `createdAt` | `timestamp` | ✅ | Account creation timestamp |
| `fcmToken` | `string` | ❌ | Firebase Cloud Messaging token for push notifications |
| `profileSetupCompleted` | `boolean` | ✅ | Whether user has completed profile setup (default: false) |

### Example Document

```javascript
{
  username: "johndoe",
  email: "john@example.com",
  displayName: "John Doe",
  bio: "Coffee lover and photographer",
  profilePhotoURL: "https://firebasestorage.googleapis.com/...",
  createdAt: Timestamp(2026, 0, 6, 10, 30, 0),
  fcmToken: "fXtY9...",
  profileSetupCompleted: true
}
```

### Indexes Required

- `username` - Single field index (unique constraint enforced in Security Rules)
- `createdAt` - Single field index (for sorting new users)

### Security Rules

```javascript
// Users can read their own data and other users' public profiles
// Users can only write to their own document
match /users/{userId} {
  allow read: if request.auth != null;
  allow create: if request.auth.uid == userId;
  allow update: if request.auth.uid == userId;
  allow delete: if false; // No deletion allowed
}
```

---

## 2. Photos Collection

**Path:** `photos/{photoId}`
**Purpose:** Store photo metadata and reveal timing information

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `string` | ✅ | ID of user who took the photo |
| `imageURL` | `string` | ✅ | Firebase Storage URL for the photo |
| `capturedAt` | `timestamp` | ✅ | When the photo was taken |
| `revealedAt` | `timestamp` | ❌ | When the photo was revealed (set when status changes to 'revealed') |
| `status` | `string` | ✅ | Photo status: `'developing'`, `'revealed'`, or `'triaged'` |
| `photoState` | `string` | ❌ | Post-reveal state: `'journal'` (public) or `'archive'` (private). `null` while developing/revealed |
| `visibility` | `string` | ✅ | Always `'friends-only'` for MVP |
| `month` | `string` | ✅ | YYYY-MM format for automatic monthly albums (e.g., "2026-01") |
| `reactions` | `map` | ✅ | **New structure (Week 8):** Nested map of userId -> emoji -> count (e.g., `{ "user123": { "😂": 2, "❤️": 1 } }`) |
| `reactionCount` | `number` | ✅ | Total count of all reactions across all users and emojis (for sorting/display) |

### Example Document

```javascript
{
  userId: "user123",
  imageURL: "https://firebasestorage.googleapis.com/...",
  capturedAt: Timestamp(2026, 0, 6, 10, 0, 0),
  revealedAt: Timestamp(2026, 0, 6, 12, 30, 0), // Set when status changed to 'revealed'
  status: "revealed", // or "developing" or "triaged"
  photoState: null, // null until triaged, then "journal" or "archive"
  visibility: "friends-only",
  month: "2026-01",
  reactions: {
    "user456": {
      "😂": 2,  // User reacted with 😂 twice
      "❤️": 1   // And ❤️ once
    },
    "user789": {
      "🔥": 3   // User reacted with 🔥 three times
    }
  },
  reactionCount: 6  // Total: 2 + 1 + 3 = 6
}
```

### Reaction Data Structure (Week 8 Update)

**Multi-reaction support** allows users to react multiple times with the same emoji:

```javascript
// Structure:
reactions: {
  [userId]: {
    [emoji]: count  // Number of times this user reacted with this emoji
  }
}

// Example - User can react multiple times:
// User taps 😂 three times, then taps ❤️ once
reactions: {
  "currentUser": {
    "😂": 3,
    "❤️": 1
  }
}
```

**Benefits:**
- Allows incremental reaction counts (like Instagram Stories)
- Supports multiple different emoji reactions per user
- Enables dynamic sorting by popularity
- Maintains individual user reaction history

### Indexes Required (Composite)

1. **Feed Query** (friends' revealed photos sorted by capture time):
   - `userId` (Ascending) + `status` (Ascending) + `capturedAt` (Descending)

2. **User's Photos** (for profile view):
   - `userId` (Ascending) + `capturedAt` (Descending)

3. **Monthly Albums**:
   - `userId` (Ascending) + `month` (Ascending) + `capturedAt` (Descending)

4. **Developing Photos Query** (for darkroom):
   - `userId` (Ascending) + `status` (Ascending)

### Photo Lifecycle States

```
1. CAPTURE → status: "developing", photoState: null
2. REVEAL → status: "revealed", photoState: null
3. TRIAGE → status: "triaged", photoState: "journal" OR "archive"
```

**⚠️ IMPORTANT:** The photoState values are 'journal' and 'archive' (without 'ed' suffix).

### Security Rules

```javascript
match /photos/{photoId} {
  // Anyone authenticated can read revealed photos
  allow read: if request.auth != null
    && (resource.data.status == 'revealed' || resource.data.status == 'triaged');

  // Users can read their own developing photos
  allow read: if request.auth != null
    && request.auth.uid == resource.data.userId;

  // Users can create their own photos
  allow create: if request.auth != null
    && request.auth.uid == request.resource.data.userId;

  // Users can update their own photos (for reactions and triage)
  allow update: if request.auth != null;

  // Users can delete their own photos
  allow delete: if request.auth != null
    && request.auth.uid == resource.data.userId;
}
```

---

## 3. Darkrooms Collection

**Path:** `darkrooms/{userId}`
**Purpose:** Manage batch photo reveal timing for each user

**Note:** Document ID is the user ID (one darkroom per user)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `string` | ✅ | ID of user who owns this darkroom |
| `nextRevealAt` | `timestamp` | ✅ | When the next batch reveal will occur (random 0-2 hours from last reveal) |
| `lastRevealedAt` | `timestamp` | ❌ | When photos were last revealed (null if never revealed) |
| `createdAt` | `timestamp` | ✅ | When the darkroom was created |

### Example Document

```javascript
{
  userId: "user123",
  nextRevealAt: Timestamp(2026, 0, 6, 12, 45, 0), // Random time in next 0-2 hours
  lastRevealedAt: Timestamp(2026, 0, 6, 10, 30, 0), // Last batch reveal
  createdAt: Timestamp(2026, 0, 6, 8, 0, 0)
}
```

### Indexes Required

- No composite indexes required (single document per user accessed by ID)

### Darkroom Reveal Logic

1. **Initial Creation:** When user takes their first photo, create darkroom with `nextRevealAt` set to random time 0-2 hours in future
2. **Reveal Check:** When user opens DarkroomScreen, check if `nextRevealAt <= currentTime`
3. **Batch Reveal:** If ready:
   - Query ALL photos where `userId == user AND status == 'developing'`
   - Update ALL to `status = 'revealed'` and set `revealedAt` timestamp
   - Schedule next reveal by updating `nextRevealAt` to new random time (0-2 hours from now)
   - Update `lastRevealedAt` to current time
4. **Display:** Show revealed photos (`status == 'revealed'`) for triaging

### Security Rules

```javascript
match /darkrooms/{userId} {
  // Users can only read their own darkroom
  allow read: if request.auth != null
    && request.auth.uid == userId;

  // Users can create and update their own darkroom
  allow create, update: if request.auth != null
    && request.auth.uid == userId;

  // No deletion allowed
  allow delete: if false;
}
```

---

## 4. Friendships Collection

**Path:** `friendships/{friendshipId}`
**Purpose:** Store friend relationships and friend requests

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user1Id` | `string` | ✅ | First user's ID (alphabetically lower) |
| `user2Id` | `string` | ✅ | Second user's ID (alphabetically higher) |
| `status` | `string` | ✅ | `'pending'` (request sent) or `'accepted'` (friends) |
| `requestedBy` | `string` | ✅ | ID of user who sent the friend request |
| `createdAt` | `timestamp` | ✅ | When the request was created |
| `acceptedAt` | `timestamp` | ❌ | When the request was accepted (null if pending) |

### Document ID Strategy

To prevent duplicate friendships, we use a deterministic ID:
- Sort the two user IDs alphabetically
- Concatenate with underscore: `{lowerUserId}_{higherUserId}`
- Example: friendship between `user123` and `user456` = `user123_user456`

### Example Document

```javascript
{
  user1Id: "user123", // Alphabetically first
  user2Id: "user456", // Alphabetically second
  status: "accepted",
  requestedBy: "user456", // user456 sent the request
  createdAt: Timestamp(2026, 0, 5, 14, 20, 0),
  acceptedAt: Timestamp(2026, 0, 5, 15, 10, 0)
}
```

### Indexes Required (Composite)

1. **User's Friends List**:
   - `user1Id` (Ascending) + `status` (Ascending)
   - `user2Id` (Ascending) + `status` (Ascending)

2. **Friend Requests Received**:
   - `user1Id` (Ascending) + `status` (Ascending) + `requestedBy` (Ascending)
   - `user2Id` (Ascending) + `status` (Ascending) + `requestedBy` (Ascending)

### Querying Friends

To get all friends for `currentUserId`:
1. Query where `user1Id == currentUserId AND status == 'accepted'`
2. Query where `user2Id == currentUserId AND status == 'accepted'`
3. Combine results

### Security Rules

```javascript
match /friendships/{friendshipId} {
  // Users can read friendships they're part of
  allow read: if request.auth != null
    && (request.auth.uid == resource.data.user1Id
      || request.auth.uid == resource.data.user2Id);

  // Users can create friend requests
  allow create: if request.auth != null
    && (request.auth.uid == request.resource.data.user1Id
      || request.auth.uid == request.resource.data.user2Id);

  // Users can accept friend requests sent to them
  allow update: if request.auth != null
    && request.auth.uid != resource.data.requestedBy
    && (request.auth.uid == resource.data.user1Id
      || request.auth.uid == resource.data.user2Id);

  // Users can delete friendships they're part of
  allow delete: if request.auth != null
    && (request.auth.uid == resource.data.user1Id
      || request.auth.uid == resource.data.user2Id);
}
```

---

## 5. Notifications Collection

**Path:** `notifications/{notificationId}`
**Purpose:** Store in-app notifications for user events

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recipientId` | `string` | ✅ | ID of user receiving the notification |
| `senderId` | `string` | ❌ | ID of user who triggered the notification (null for system) |
| `type` | `string` | ✅ | Notification type: `'photo_reveal'`, `'friend_request'`, `'reaction'` |
| `photoId` | `string` | ❌ | Related photo ID (for photo_reveal and reaction types) |
| `message` | `string` | ✅ | Notification text (e.g., "John reacted to your photo") |
| `read` | `boolean` | ✅ | Whether notification has been read (default: false) |
| `createdAt` | `timestamp` | ✅ | When the notification was created |

### Example Documents

```javascript
// Photo reveal notification
{
  recipientId: "user123",
  senderId: null, // System notification
  type: "photo_reveal",
  photoId: "photo789",
  message: "Your photo from this morning is ready!",
  read: false,
  createdAt: Timestamp(2026, 0, 6, 12, 30, 0)
}

// Friend request notification
{
  recipientId: "user123",
  senderId: "user456",
  type: "friend_request",
  photoId: null,
  message: "Jane Doe sent you a friend request",
  read: false,
  createdAt: Timestamp(2026, 0, 6, 10, 15, 0)
}

// Reaction notification
{
  recipientId: "user123",
  senderId: "user789",
  type: "reaction",
  photoId: "photo456",
  message: "Mike reacted 😂 to your photo",
  read: true,
  createdAt: Timestamp(2026, 0, 6, 11, 45, 0)
}
```

### Indexes Required (Composite)

1. **User's Notifications** (sorted by newest):
   - `recipientId` (Ascending) + `createdAt` (Descending)

2. **Unread Notifications Count**:
   - `recipientId` (Ascending) + `read` (Ascending)

### Security Rules

```javascript
match /notifications/{notificationId} {
  // Users can only read their own notifications
  allow read: if request.auth != null
    && request.auth.uid == resource.data.recipientId;

  // System/Cloud Functions can create notifications
  allow create: if request.auth != null;

  // Users can mark their notifications as read
  allow update: if request.auth != null
    && request.auth.uid == resource.data.recipientId
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);

  // Users can delete their own notifications
  allow delete: if request.auth != null
    && request.auth.uid == resource.data.recipientId;
}
```

---

## 6. PhotoViews Collection

**Path:** `photoViews/{viewId}`
**Purpose:** Track which photos each user has seen (for "NEW" indicator on Feed)

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `string` | ✅ | ID of user who viewed the photo |
| `photoId` | `string` | ✅ | ID of photo that was viewed |
| `photoOwnerId` | `string` | ✅ | ID of user who owns the photo (denormalized for queries) |
| `viewedAt` | `timestamp` | ✅ | When the photo was viewed |

### Document ID Strategy

Use a deterministic ID: `{userId}_{photoId}`
- Example: user123 views photo456 = `user123_photo456`
- This prevents duplicate view records

### Example Document

```javascript
{
  userId: "user123",
  photoId: "photo456",
  photoOwnerId: "user789",
  viewedAt: Timestamp(2026, 0, 6, 14, 30, 0)
}
```

### Indexes Required (Composite)

1. **Check if user has seen a friend's photos**:
   - `userId` (Ascending) + `photoOwnerId` (Ascending) + `viewedAt` (Descending)

2. **Get all photos user has viewed from a specific friend**:
   - `userId` (Ascending) + `photoOwnerId` (Ascending)

### Security Rules

```javascript
match /photoViews/{viewId} {
  // Users can read their own views
  allow read: if request.auth != null
    && request.auth.uid == resource.data.userId;

  // Users can create view records
  allow create: if request.auth != null
    && request.auth.uid == request.resource.data.userId;

  // No updates or deletes allowed
  allow update, delete: if false;
}
```

### Usage Pattern

When a user views a friend's photos via Friend Photo Viewer:
1. Check if view record exists: `photoViews/{userId}_{photoId}`
2. If not exists → photo is "NEW" (unseen)
3. When user swipes through photos → create view record for each photo
4. Friend thumbnail shows red dot if ANY photos from last 7 days are unseen

---

## Firebase Storage Structure

Photos and profile images are stored in Firebase Storage:

```
storage/
├── profile_photos/
│   └── {userId}.jpg
└── photos/
    └── {photoId}.jpg
```

### Storage Rules

```javascript
// Profile photos
match /profile_photos/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}

// User photos
match /photos/{photoId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```

---

## Key Database Patterns

### 1. Darkroom-Based Batch Reveal

Photos are revealed in batches per user, not individually:
1. When user takes their first photo, create darkroom document with `nextRevealAt` = random time 0-2 hours from now
2. When user opens DarkroomScreen, check if `darkroom.nextRevealAt <= currentTime`
3. If ready to reveal:
   - Query ALL photos where `userId == user AND status == 'developing'`
   - Update ALL to `status = 'revealed'` and set `revealedAt` timestamp
   - Update darkroom: set `nextRevealAt` to new random time (0-2 hours from now), update `lastRevealedAt`
4. Client-side sorting is used to avoid composite index requirements (sort by `capturedAt` in JavaScript)

### 2. Friend Feed Query

To display the feed of friends' photos (MVP currently shows ALL users):
1. Query photos where:
   - `photoState == 'journal'` (NOT 'journaled')
2. Client-side sorting by `capturedAt` DESC (avoids Firebase composite index)
3. Manual pagination using array slicing with `paginationIndex` marker
4. Real-time updates using `onSnapshot` listener
5. Friends-only filtering will be added in Week 9

### 3. Photo Triage Flow

After photos are revealed:
1. User views revealed photos one by one in DarkroomScreen
2. For each photo, user chooses:
   - **Archive** → `status = 'triaged'`, `photoState = 'archive'` (private, not in feed)
   - **Journal** → `status = 'triaged'`, `photoState = 'journal'` (public, visible to friends in feed)
   - **Delete** → Delete photo document and Firebase Storage file
3. Client removes triaged photo from darkroom view and shows next photo

### 4. Reaction Updates

When a user reacts to a photo:
1. Update `reactions` map: `reactions[userId] = emoji`
2. Recalculate `reactionCount` = Object.keys(reactions).length
3. Create notification for photo owner (if not their own photo)

---

## Data Validation Rules

### Username Constraints
- 3-20 characters
- Lowercase alphanumeric + underscores only
- Must be unique (enforced in app logic + Security Rules)
- Pattern: `/^[a-z0-9_]{3,20}$/`

### Bio Constraints
- Max 150 characters
- Optional field

### Photo File Constraints
- Max file size: 10MB
- Accepted formats: JPG, JPEG, PNG
- Images compressed before upload

---

## Migration & Seeding Strategy

For development/testing, create sample data:
1. 5 test users with profiles
2. 20 photos in various states (developing, revealed, triaged)
3. 10 friendships (mix of pending/accepted)
4. 15 notifications

---

## Future Enhancements (Post-MVP)

These collections may be added in Phase 2:
- `sharedRolls/` - Collaborative group photo shoots
- `messages/` - Direct messaging
- `groupChats/` - Group conversations
- `journals/` - Personal curated galleries
- `albums/` - Collaborative collections
- `comments/` - Photo comments

---

**Document Status:** Ready for implementation
**Next Steps:**
1. Configure Firebase Security Rules in console
2. Create Firestore indexes in console
3. Implement Firebase helper functions in code