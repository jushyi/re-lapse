---
phase: 38-notification-ui-polish
plan: 02
subsystem: ui
tags: [react-native, notifications, firestore, navigation]

# Dependency graph
requires:
  - phase: 38-01
    provides: In-app notification banner component
  - phase: 35
    provides: Notification preferences and shouldSendNotification helper
  - phase: 36
    provides: Story and tagged photo notification Cloud Functions
provides:
  - Bold username formatting in notification list
  - Unread dot indicator on notification items
  - Per-tap mark-as-read (replaces bulk mark-on-focus)
  - Tappable notification items with deep navigation
  - markSingleNotificationAsRead service function
affects: [notification-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [optimistic-ui-update, per-item-read-state]

key-files:
  created: []
  modified:
    - src/screens/ActivityScreen.js
    - src/services/firebase/notificationService.js

key-decisions:
  - 'Per-tap mark-as-read instead of bulk mark-on-focus for better UX'
  - 'Optimistic local state update before Firestore write for instant UI feedback'
  - 'Fixed-width spacer alignment approach for read/unread dot consistency'

patterns-established:
  - 'Optimistic UI: update local state immediately, then persist to Firestore'

issues-created: []

# Metrics
duration: 13min
completed: 2026-02-09
---

# Phase 38 Plan 02: Notification UI Polish Summary

**Bold username formatting, unread purple dot indicators, per-tap mark-as-read, and tappable notification items with deep navigation**

## Performance

- **Duration:** 13 min
- **Started:** 2026-02-09T11:47:45Z
- **Completed:** 2026-02-09T12:01:01Z
- **Tasks:** 2 auto + 1 checkpoint (skipped)
- **Files modified:** 2

## Accomplishments

- Notification items show bold sender names with action text (getActionText helper strips/formats messages)
- Unread notifications display a small purple dot (6x6, colors.brand.purple) with consistent alignment via spacer
- Tapping a notification marks it as read (optimistic local update + Firestore) and navigates to relevant content
- Removed bulk mark-as-read on screen focus — notifications only marked read on individual tap
- Added markSingleNotificationAsRead service function following {success, error} pattern

## Task Commits

Each task was committed atomically:

1. **Task 1: Polish notification list UI with bold usernames and unread dot** - `a5a17cf` (feat)
2. **Task 2: Add markSingleNotificationAsRead service function** - `6c9fa30` (feat)
3. **Bug fix: Correct FriendRequests → FriendsList navigation** - `4ff6702` (fix)

**Plan metadata:** (pending)

## Files Created/Modified

- `src/screens/ActivityScreen.js` - Removed bulk mark-as-read, added bold usernames, unread dot, tappable items with deep navigation, getActionText helper, handleNotificationPress handler
- `src/services/firebase/notificationService.js` - Added markSingleNotificationAsRead function

## Decisions Made

- Per-tap mark-as-read instead of bulk mark-on-focus for better UX granularity
- Optimistic local state update before Firestore write for instant visual feedback
- Fixed-width spacer approach (6px transparent spacer on read items) for consistent alignment

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed FriendRequests navigation target**

- **Found during:** Checkpoint verification (user testing)
- **Issue:** Plan specified `navigation.navigate('FriendRequests')` but the correct screen name is `FriendsList`
- **Fix:** Changed navigation target from `FriendRequests` to `FriendsList`
- **Files modified:** src/screens/ActivityScreen.js
- **Verification:** Lint passes, screen name matches AppNavigator registration
- **Committed in:** `4ff6702`

---

**Total deviations:** 1 auto-fixed (1 bug), 0 deferred
**Impact on plan:** Bug fix necessary for correct navigation. No scope creep.

## Issues Encountered

- Checkpoint verification skipped by user (unable to test at this time)
- User noted reaction and comment notifications not appearing — this is a pre-existing gap (Cloud Functions for reaction/comment notifications were never implemented in Phases 35-36), not caused by this plan

## Next Phase Readiness

- Notification UI polish complete
- Phase 38 fully complete (2/2 plans)
- Ready for continued work on Phase 43

---

_Phase: 38-notification-ui-polish_
_Completed: 2026-02-09_
