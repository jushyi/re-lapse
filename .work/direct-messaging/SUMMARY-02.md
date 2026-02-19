# SUMMARY-02: Cloud Function + Firestore Infrastructure

**Status:** SUCCESS
**Plan:** PLAN-02.md
**Date:** 2026-02-19

## Commits

| Hash | Description |
|------|-------------|
| `4fd4a6a` | feat(dm): add onNewMessage Cloud Function for conversation metadata and notifications |
| `979dc43` | feat(dm): add Firestore security rules and composite index for conversations |

## What was implemented

### Task 1: onNewMessage Cloud Function (`functions/index.js`)

Added `exports.onNewMessage` Firestore onCreate trigger on `conversations/{conversationId}/messages/{messageId}`. The function:

1. **Validates** message data and senderId exist
2. **Parses** the recipient from the deterministic conversation ID (`lowerUserId_higherUserId`)
3. **Updates conversation metadata atomically:**
   - `lastMessage` object (text preview, senderId, timestamp, type)
   - `updatedAt` timestamp
   - `unreadCount.{recipientId}` via `FieldValue.increment(1)`
4. **Sends push notification** to recipient with:
   - Title: sender's display name
   - Body: message text or "Sent a GIF"
   - Data payload: `type: 'direct_message'`, `conversationId`, `senderId`, `senderName`, `senderProfilePhotoURL`, `threadId` (for iOS grouping), `channelId: 'messages'` (for Android)
5. **Respects notification preferences** (`enabled` master toggle and `directMessages` toggle)
6. **Error isolation:** notification failures do not prevent metadata update (inner try/catch)

Implementation matches existing v1 trigger patterns: `functions.runWith().firestore.document().onCreate()`, inline `require('./notifications/sender')`, `db` reference, `admin.firestore.FieldValue`, and `logger`.

### Task 2: Firestore Security Rules and Composite Index

**Security Rules (`firestore.rules`):**

- Added `isConversationMemberById(conversationId)` helper function after `isFriendshipMemberById` -- parses deterministic document ID to check membership without a `get()` call
- Added `conversations/{conversationId}` collection rules:
  - **Read:** participants only (via ID parsing)
  - **Create:** participant with required fields (`participants`, `createdAt`, `updatedAt`, `deletedAt`, `unreadCount`), participant array must include auth user and have exactly 2 entries
  - **Update:** participants only, restricted to `deletedAt` and `unreadCount` fields (Cloud Functions bypass rules for `lastMessage`/`updatedAt` via admin SDK)
  - **Delete:** never (conversations are permanent)
- Added `messages/{messageId}` subcollection rules:
  - **Read:** participants only
  - **Create:** participant who is the sender, required fields (`senderId`, `type`, `createdAt`)
  - **Update/Delete:** never (messages are permanent, retained for moderation)
- Default deny rule remains at the end, unchanged

**Composite Index (`firestore.indexes.json`):**

- Added index for conversation list query: `conversations` collection with `participants` (array-contains) + `updatedAt` (descending)

## Verification Checklist

- [x] `onNewMessage` Cloud Function is exported from `functions/index.js`
- [x] Triggers on `conversations/{conversationId}/messages/{messageId}` creation
- [x] Updates conversation `lastMessage`, `updatedAt`, increments `unreadCount` for recipient
- [x] Sends push notification with `type: 'direct_message'` in data payload
- [x] `threadId: conversationId` set for iOS notification grouping
- [x] `channelId: 'messages'` set for Android notification channel
- [x] Error in notification sending does NOT prevent metadata update
- [x] Uses existing import patterns (admin SDK, logger, sendPushNotification)
- [x] Security rules properly structured (no syntax errors)
- [x] `isConversationMemberById` helper function exists in `firestore.rules`
- [x] Conversations readable only by participants (using ID parsing, no `get()` calls)
- [x] Conversation updates restricted to `deletedAt` and `unreadCount` fields only
- [x] Messages subcollection: read by participants, create by sender only, no update/delete
- [x] Composite index JSON is valid
- [x] All existing Cloud Functions, rules, and indexes are unchanged
- [x] `npm run lint` passes with 0 errors (warnings are pre-existing)
- [x] `npx eslint functions/index.js --no-ignore` passes with 0 errors (warnings are pre-existing)

## Deviations from Plan

1. **Trigger style:** The plan suggested using `onDocumentCreated` from `firebase-functions/v2/firestore`, but the existing codebase uses v1 triggers (`functions.firestore.document().onCreate()`). Matched the existing v1 pattern as instructed by the execution rules.

2. **Notification preferences check:** Added `notificationPreferences` checking (master `enabled` toggle + `directMessages` toggle) to match the pattern used by all other notification-sending functions in `index.js`. The plan did not explicitly mention this but it is required by the existing codebase conventions.

3. **Additional guards:** Added validation guards for message data shape, missing senderId, and invalid conversation ID format, matching the defensive coding pattern used in existing functions like `sendFriendRequestNotification`.
