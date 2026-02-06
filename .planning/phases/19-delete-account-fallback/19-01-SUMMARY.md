---
phase: 19-delete-account-fallback
plan: 01
subsystem: auth
tags: [firebase, cloud-functions, account-deletion, scheduled-deletion]

# Dependency graph
requires:
  - phase: 18-content-visibility-duration
    provides: Core infrastructure complete
provides:
  - Scheduled deletion infrastructure (30-day grace period)
  - scheduleAccountDeletion, cancelAccountDeletion, checkDeletionStatus methods
  - Cloud Functions for server-side deletion processing
affects: [19-02, settings-ui, auth-flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Scheduled deletion with grace period
    - Firestore field deletion using FieldValue.delete()
    - pubsub.schedule for daily cron jobs

key-files:
  created: []
  modified:
    - src/services/firebase/accountService.js
    - functions/index.js

key-decisions:
  - '30-day grace period for account deletion recovery'
  - 'FieldValue.delete() to fully remove fields when canceling'
  - 'Daily 3 AM UTC cron job for processing scheduled deletions'

patterns-established:
  - 'Scheduled deletion pattern: scheduledForDeletionAt + deletionScheduledAt fields'
  - "Graceful batch processing: one user failure doesn't block others"

issues-created: []

# Metrics
duration: 8min
completed: 2026-02-04
---

# Phase 19 Plan 01: Scheduled Deletion Infrastructure Summary

**30-day grace period deletion infrastructure with Cloud Functions for schedule/cancel/process operations**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-04T22:00:00Z
- **Completed:** 2026-02-04T22:08:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added 3 new accountService methods: scheduleAccountDeletion, cancelAccountDeletion, checkDeletionStatus
- Created 3 Cloud Functions: scheduleUserAccountDeletion, cancelUserAccountDeletion, processScheduledDeletions
- Daily scheduled function (3 AM UTC) processes accounts past their deletion date
- Uses same deletion cascade as immediate deletion (storage, photos, friendships, darkroom, user, auth)

## Task Commits

Each task was committed atomically:

1. **Task 1: Update accountService methods** - `58f4954` (feat)
2. **Task 2: Create Cloud Functions** - `8ccb533` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `src/services/firebase/accountService.js` - Added scheduleAccountDeletion, cancelAccountDeletion, checkDeletionStatus methods
- `functions/index.js` - Added scheduleUserAccountDeletion, cancelUserAccountDeletion, processScheduledDeletions functions

## Decisions Made

- **30-day grace period:** Industry standard matching Instagram/other social apps
- **FieldValue.delete():** Used to completely remove fields when canceling deletion (not just set to null)
- **3 AM UTC daily cron:** Off-peak hours for server processing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Scheduled deletion infrastructure is complete
- Ready for Plan 02: UI for scheduling/canceling deletion
- User schema supports scheduledForDeletionAt and deletionScheduledAt fields
- Functions need to be deployed to Firebase before UI testing

---

_Phase: 19-delete-account-fallback_
_Completed: 2026-02-04_
