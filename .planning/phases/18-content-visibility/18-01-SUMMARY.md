---
phase: 18-content-visibility
plan: 01
subsystem: feed
tags: [firestore, timestamp, visibility, feed, stories]

# Dependency graph
requires:
  - phase: 17
    provides: Nested reply comments system
provides:
  - Server-side visibility filtering for feed and stories
  - STORIES_VISIBILITY_DAYS (7) and FEED_VISIBILITY_DAYS (1) constants
  - getCutoffTimestamp helper for time-based Firestore queries
affects: [19-delete-account, feed, stories]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server-side Firestore timestamp filtering with getCutoffTimestamp helper

key-files:
  created: []
  modified:
    - src/services/firebase/feedService.js

key-decisions:
  - 'Feed shows friends only (own posts excluded for 100% friend activity focus)'
  - 'Stories visible for 7 days, feed posts visible for 1 day'
  - 'Profile views (albums, monthly albums) unaffected by visibility rules'

patterns-established:
  - 'getCutoffTimestamp(days) pattern for server-side time filtering'

issues-created: []

# Metrics
duration: 4min
completed: 2026-02-04
---

# Phase 18 Plan 01: Content Visibility Duration Summary

**Server-side Firestore filtering with 7-day stories and 1-day feed visibility, own posts excluded from feed**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-04T14:39:55Z
- **Completed:** 2026-02-04T14:44:04Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added STORIES_VISIBILITY_DAYS (7) and FEED_VISIBILITY_DAYS (1) constants
- Created getCutoffTimestamp helper for Firestore time-based queries
- Applied server-side visibility filtering to feed (1-day) and stories (7-day)
- Excluded own posts from feed (feed is 100% friend activity)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add visibility duration constants and cutoff timestamp helper** - `824adcc` (feat)
2. **Task 2: Apply server-side visibility filtering to Firestore queries** - `1eb3f8c` (feat)

**Plan metadata:** `923b131` (docs: complete plan)

## Files Created/Modified

- `src/services/firebase/feedService.js` - Added visibility constants, getCutoffTimestamp helper, and applied filtering to getFeedPhotos, subscribeFeedPhotos, getUserStoriesData, and getFriendStoriesData

## Decisions Made

- Feed excludes current user's own photos (friends only) - reinforces that feed is for discovering friend activity, not reviewing your own
- Stories use 7-day visibility window (more time to be seen than feed)
- Feed uses 1-day visibility window (keeps feed fresh with recent activity)
- Profile views (getTopPhotosByEngagement, getUserFeedPhotos) remain unchanged - all photos visible regardless of age

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Content visibility duration implemented and ready for testing
- Feed shows only friend posts from last 24 hours
- Stories bar shows friend stories from last 7 days
- "Me" story card shows own photos from last 7 days
- Ready for Phase 19: Delete Account Fallback

---

_Phase: 18-content-visibility_
_Completed: 2026-02-04_
