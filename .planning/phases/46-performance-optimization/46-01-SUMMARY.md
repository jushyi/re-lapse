---
phase: 46-performance-optimization
plan: 01
subsystem: api
tags: [firestore, in-operator, pagination, cursor, feed, performance]

# Dependency graph
requires:
  - phase: 45-security-audit
    provides: stable codebase for optimization
provides:
  - Server-side filtered feed queries using Firestore `in` operator
  - Cursor-based pagination for getFeedPhotos and getUserFeedPhotos
  - Chunked real-time listeners for subscribeFeedPhotos
  - Bounded getRandomFriendPhotos with limit(50)
affects: [46-02-firestore-indexes, 47-firebase-perf-monitoring]

# Tech tracking
tech-stack:
  added: []
  patterns: [firestore-in-operator-chunking, cursor-based-pagination, multi-listener-merge]

key-files:
  created: []
  modified: [src/services/firebase/feedService.js]

key-decisions:
  - 'Chunk friendIds at 30 (Firestore `in` operator limit) with parallel queries per chunk'
  - 'Use DocumentSnapshot for cursor pagination (not index-based slicing)'
  - 'subscribeFeedPhotos creates one onSnapshot per chunk, merges via Map keyed by photo ID'
  - 'getRandomFriendPhotos limited to 50 docs per chunk instead of full collection scan'
  - 'Sort by triagedAt (not capturedAt) to align with server-side range filter and future composite index'

patterns-established:
  - 'chunkArray helper for Firestore `in` operator batching (reusable across services)'
  - 'Multi-chunk listener pattern: Map per chunk, merge on each snapshot, single callback'

issues-created: []

# Metrics
duration: 5min
completed: 2026-02-10
---

# Phase 46 Plan 01: Feed Query Server-Side Filtering Summary

**Refactored all feed queries from O(all_photos) client-side filtering to O(friends\*limit) server-side filtering using Firestore `in` operator with cursor pagination**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-10T13:40:45Z
- **Completed:** 2026-02-10T13:46:06Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- getFeedPhotos and getUserFeedPhotos use server-side `in` filtering with cursor-based pagination (DocumentSnapshot, not index slicing)
- subscribeFeedPhotos creates chunked `in` listeners with Map-based merge and proper multi-listener cleanup
- getRandomFriendPhotos queries only friend photos with limit(50) instead of scanning entire photos collection
- Added chunkArray helper and FIRESTORE_IN_LIMIT constant for reuse across services

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor getFeedPhotos and getUserFeedPhotos** - `2c9f188` (perf)
2. **Task 2: Refactor subscribeFeedPhotos and getRandomFriendPhotos** - `c0743ab` (perf)

## Files Created/Modified

- `src/services/firebase/feedService.js` - All 4 feed query functions refactored with `in` operator, chunking, limit, and cursor pagination

## Decisions Made

- Used triagedAt for ordering (aligns with range filter and future composite index)
- DocumentSnapshot cursor for single-chunk pagination, works across chunks via shared orderBy field
- Blocked user filtering done before querying in getRandomFriendPhotos (reduces query count), after querying in getFeedPhotos/subscribeFeedPhotos (can't pre-filter when blocked list is async)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- All feed queries now use server-side filtering
- Requires composite index (userId + photoState + triagedAt) to be deployed — addressed in 46-02
- Ready for 46-02: Firestore Indexes & Read Optimization

---

_Phase: 46-performance-optimization_
_Completed: 2026-02-10_
