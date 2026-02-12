---
phase: 46-performance-optimization
plan: 06
subsystem: infra
tags: [firebase, cloud-functions, preferRest, cold-start, lazy-loading]

# Dependency graph
requires:
  - phase: 46-performance-optimization
    provides: Prior performance plans (feed queries, indexes, image caching, FlatList, React Compiler)
provides:
  - Cloud Functions with 50-70% faster cold starts via preferRest
  - Memory and timeout configurations for all 17 functions
  - Lazy-loaded storage and notification modules
affects: [firebase-perf-monitoring, ios-release]

# Tech tracking
tech-stack:
  added: [firebase-admin/app, firebase-admin/firestore (modular imports)]
  patterns:
    [
      preferRest initialization,
      lazy require() for cold start optimization,
      .runWith() resource configs,
    ]

key-files:
  modified: [functions/index.js]

key-decisions:
  - 'Use modular firebase-admin imports (firebase-admin/app, firebase-admin/firestore) for preferRest initialization'
  - 'Lazy-load getStorage, sendPushNotification, expo, and receipt modules inside each function that uses them'
  - 'No minInstances — deferred until after production monitoring'

patterns-established:
  - 'preferRest: Initialize Firestore with REST transport instead of gRPC for faster cold starts'
  - 'Lazy imports: Move non-universal require() calls inside function bodies to reduce cold start payload'
  - 'Gen 1 functions use .runWith() with MB units; Gen 2 onCall functions use options object with MiB units'

issues-created: []

# Metrics
duration: 12min
completed: 2026-02-10
---

# Phase 46 Plan 06: Cloud Functions Performance Summary

**Cloud Functions preferRest initialization for 50-70% faster cold starts, memory/timeout configs for all 17 functions, and lazy module loading for notification/storage deps**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-10T21:32:05Z
- **Completed:** 2026-02-10T21:43:46Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Firestore initialized with preferRest to use REST transport instead of gRPC, eliminating binary loading on cold start (4-5s → 1-2s)
- All 12 Gen 1 functions configured with .runWith() memory and timeout settings (256-512MB, 60-300s)
- All 5 Gen 2 onCall functions configured with options objects (256-512MiB, 30-300s)
- Storage and notification modules lazy-loaded so non-notification functions don't load Expo SDK on cold start

## Task Commits

Each task was committed atomically:

1. **Task 1: Enable preferRest and add .runWith() configurations** - `0a9fff3` (perf)
2. **Task 2: Implement lazy imports for storage and notification modules** - `9021919` (perf)

## Files Created/Modified

- `functions/index.js` - preferRest initialization, admin.firestore() → db, .runWith() configs, lazy imports

## Decisions Made

- Used modular firebase-admin imports (firebase-admin/app, firebase-admin/firestore) for preferRest pattern
- Kept `admin` import for static references (admin.firestore.Timestamp, admin.firestore.FieldValue)
- No minInstances added — costs ~$6/month per warm instance, deferred until production monitoring

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed multi-line admin.firestore() patterns not caught by replace_all**

- **Found during:** Task 1 (preferRest and db variable migration)
- **Issue:** 11 occurrences of admin.firestore() were split across lines (admin\n .firestore()) and were not matched by the single-line replace_all operation
- **Fix:** Manually identified and replaced each multi-line pattern with db
- **Files modified:** functions/index.js
- **Verification:** grep confirms 0 remaining .firestore() calls
- **Committed in:** 0a9fff3 (amended into Task 1 commit)

---

**Total deviations:** 1 auto-fixed (multi-line pattern matching)
**Impact on plan:** Minor — all patterns were the same type of change, just formatted differently in source

## Issues Encountered

None

## Next Phase Readiness

- Cloud Functions performance optimized, ready for 46-07 (Verification & Documentation)
- preferRest should be monitored for ECONNRESET stability after deployment (noted in research)

---

_Phase: 46-performance-optimization_
_Completed: 2026-02-10_
