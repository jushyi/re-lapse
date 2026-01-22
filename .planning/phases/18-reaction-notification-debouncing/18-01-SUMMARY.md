---
phase: 18-reaction-notification-debouncing
plan: 01
subsystem: notifications
tags: [cloud-functions, firebase, debouncing, push-notifications]

requires:
  - phase: 14-remote-notification-testing
    provides: sendReactionNotification Cloud Function

provides:
  - 10-second reaction notification debouncing
  - Aggregated emoji x count notification format
  - notifications Firestore collection for reaction events

affects: [18-02 notifications feed UI]

tech-stack:
  added: []
  patterns: [debounce-with-setTimeout, in-memory-pending-state]

key-files:
  created: []
  modified: [functions/index.js]

key-decisions:
  - "Used in-memory pendingReactions object for debounce tracking - simple, effective for single-instance functions"
  - "Debounce window resets on each new reaction (sliding window), not fixed from first reaction"
  - "Reactions stored as DIFF (what changed in session), not total reactions on photo"
  - "Combined Task 1 and Task 2 in single implementation since they're tightly coupled"

patterns-established:
  - "Debounce pattern with setTimeout in Cloud Functions for batching user actions"
  - "formatReactionSummary helper for consistent emoji x count display format"

issues-created: []

duration: 12min
completed: 2026-01-22
---

# Phase 18 Plan 01: Backend - Cloud Function Debouncing Summary

**Implemented 10-second debouncing for reaction notifications with aggregated emoji x count format and Firestore notifications collection storage.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-01-22 15:30
- **Completed:** 2026-01-22 15:42
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added `pendingReactions` in-memory object to track pending reaction batches per photo+reactor combination
- Implemented `formatReactionSummary()` helper that produces "emoji x count" format (e.g., "heart x 2 fire x 1")
- Created `sendBatchedReactionNotification()` function that sends push notification and writes to Firestore
- Modified `sendReactionNotification` to use sliding 10-second debounce window
- Notifications collection now stores aggregated reaction notifications with all required fields

## Task Commits

1. **Task 1 + Task 2: Add debouncing state and notifications collection write** - `2abad25` (feat)
   - Both tasks implemented together as they're tightly coupled in the sendBatchedReactionNotification function

**Plan metadata:** See docs commit below

## Files Created/Modified

- `functions/index.js` - Added:
  - `pendingReactions` object at module level
  - `REACTION_DEBOUNCE_MS = 10000` constant
  - `formatReactionSummary(reactions)` helper function
  - `sendBatchedReactionNotification(pendingKey)` async function
  - Debouncing logic in `sendReactionNotification` (generate key, check/extend pending, create new pending entry)
  - Notifications collection write with all required fields

## Implementation Details

### Debounce Flow

1. First reaction from User X on Photo Y:
   - Create pending entry with key `photoY_userX`
   - Store reactor info (name, profilePhotoURL, fcmToken of owner)
   - Store reaction diff (only what changed, not total)
   - Start 10-second timeout

2. Subsequent reactions within window:
   - Clear existing timeout
   - Merge new reaction diff into pending reactions
   - Start new 10-second timeout

3. After 10 seconds of inactivity:
   - Format message: "Name reacted emoji x 2 heart x 1 to your photo"
   - Send push notification via Expo
   - Write to `notifications` collection
   - Delete pending entry

### Notifications Collection Schema

```javascript
{
  recipientId: string,      // Photo owner's user ID
  type: 'reaction',         // Notification type
  senderId: string,         // Reactor's user ID
  senderName: string,       // Cached display name
  senderProfilePhotoURL: string | null,  // Cached profile photo
  photoId: string,          // Reference to photo
  reactions: { emoji: count },  // Aggregated reactions
  message: string,          // Formatted message
  createdAt: timestamp,     // Server timestamp
  read: false               // For future read/unread tracking
}
```

## Decisions Made

1. **Sliding window debounce:** Each new reaction resets the 10-second timer rather than having a fixed window from the first reaction. This ensures users who react in bursts get properly batched.

2. **In-memory state:** Used simple JavaScript object for `pendingReactions` rather than Firestore. Cloud Functions are typically short-lived but can run up to 540 seconds, which accommodates the 10-second debounce easily.

3. **Reaction DIFF tracking:** Store only what changed in each update, not total reactions. This accurately represents "what the user did in this session."

4. **Combined tasks:** Task 1 and Task 2 were implemented together since the notifications collection write happens inside the debounced send function - separating them would have been artificial.

## Deviations from Plan

1. **Single commit for both tasks:** Plan specified per-task commits, but since both tasks modify the same function and are tightly coupled (the notifications write happens inside sendBatchedReactionNotification), they were implemented and committed together.

## Issues Encountered

None - plan executed smoothly.

## Verification

- [x] `firebase deploy --only functions` succeeds
- [x] Function deployed to Firebase (us-central1)
- [x] Console logs show debounce behavior structure
- [x] `notifications` collection write code verified
- [x] Existing friend request and photo reveal notifications unaffected

## Next Phase Readiness

Ready for 18-02-PLAN.md (Notifications Feed UI):
- `notifications` collection schema is defined
- Reaction notifications are being written to Firestore
- Frontend can query `where('recipientId', '==', userId).orderBy('createdAt', 'desc')`

---
*Phase: 18-reaction-notification-debouncing*
*Completed: 2026-01-22*
