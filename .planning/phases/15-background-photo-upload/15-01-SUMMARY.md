---
phase: 15-background-photo-upload
plan: 01
subsystem: camera
tags: [upload-queue, async-capture, animation, asyncstorage]

requires:
  - phase: 14-remote-notification-testing
    provides: production-ready foundation
provides:
  - background upload queue with persistence
  - instant camera capture (no blocking)
  - enhanced drop animation with flash/arc/bounce
affects: [camera, darkroom, photo-upload]

tech-stack:
  added: []
  patterns: [upload-queue-pattern, optimistic-ui-updates]

key-files:
  created: [src/services/uploadQueueService.js]
  modified: [src/screens/CameraScreen.js]

key-decisions:
  - "Use timestamp+random for queue item IDs instead of adding uuid dependency"
  - "Sequential queue processing to avoid badge count race conditions"
  - "Exponential backoff (2s, 4s, 8s) with 3 max retries for upload failures"

patterns-established:
  - "Upload queue pattern: AsyncStorage persistence + sequential processing"
  - "Optimistic UI: increment badge immediately, background sync later"
  - "Animation arc: multi-point bezier interpolation for curved paths"

issues-created: []

duration: 15min
completed: 2026-01-20
---

# Phase 15 Plan 01: Background Photo Upload Summary

**Camera now captures instantly - photos queue for background upload with enhanced arc animation and badge bounce feedback.**

## Performance

- **Duration:** 15 minutes
- **Started:** 2026-01-20T16:45:00Z
- **Completed:** 2026-01-20T17:00:00Z
- **Tasks:** 3/3
- **Files modified:** 2

## Accomplishments

- Created uploadQueueService for persistent background uploads with AsyncStorage
- Decoupled capture from upload - camera releases immediately after photo capture
- Enhanced drop animation with flash effect, curved arc trajectory, and badge bounce
- Implemented optimistic UI updates (badge increments immediately)
- Added exponential backoff retry for failed uploads (2s, 4s, 8s delays)

## Task Commits

1. **Task 1: Create upload queue service** - `c48af56` (feat)
2. **Task 2: Decouple CameraScreen capture from upload** - `32c7b2d` (feat)
3. **Task 3: Enhance drop animation** - `5e902a7` (feat)

## Files Created/Modified

### Created
- `src/services/uploadQueueService.js` - 373 lines
  - initializeQueue(): Load persisted queue, start processor
  - addToQueue(): Add photo, persist, trigger processor
  - processQueue(): Sequential processing with retry logic
  - uploadQueueItem(): Create Firestore doc, upload to Storage, init darkroom
  - getQueueLength(): Return pending count
  - clearFailedItems(): Cleanup permanently failed items

### Modified
- `src/screens/CameraScreen.js` - +97/-26 lines
  - Import uploadQueueService instead of createPhoto
  - Initialize queue on mount
  - takePicture() now queues instead of awaiting upload
  - Optimistic badge count update (+1 immediately)
  - Flash effect animation (150ms white overlay)
  - Curved arc trajectory with bezier-style interpolation
  - Badge bounce animation when photo "lands"
  - Subtle rotation during photo flight

## Decisions Made

1. **ID Generation**: Used timestamp+random instead of adding uuid package - reduces dependencies, sufficient uniqueness for queue items
2. **Sequential Processing**: Queue processes one item at a time to avoid race conditions with badge count updates
3. **Retry Strategy**: 3 attempts max with exponential backoff (2s, 4s, 8s) - balances reliability with user experience

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully without blockers.

## Animation Details

### Flash Effect
- White overlay, 150ms total (50ms fade in to 80% opacity, 100ms fade out)
- Simulates camera shutter feedback

### Arc Trajectory
- Photo rises slightly (-40px) at start
- Curves down through multiple interpolation points
- Subtle rotation (-5deg to +5deg) during flight
- Total arc duration: 600ms

### Badge Bounce
- Triggers when photo reaches destination (at 600ms)
- Scale: 1.0 -> 1.3 -> 1.0 with spring physics
- Friction: 3 (expand), 4 (settle)
- Tension: 200 (expand), 100 (settle)

## Next Phase Readiness

- Background upload infrastructure complete
- Camera feels instant - no blocking during capture
- Ready for Phase 16: Camera Capture Feedback (haptics, additional polish)

---
*Phase: 15-background-photo-upload*
*Completed: 2026-01-20*
