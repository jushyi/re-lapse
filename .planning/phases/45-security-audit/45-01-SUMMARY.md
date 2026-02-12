---
phase: 45-security-audit
plan: 01
subsystem: security
tags: [firebase, storage-rules, firestore-rules, access-control, security-audit]

# Dependency graph
requires:
  - phase: 23
    provides: Initial Firestore rules hardening (self-reaction prevention, immutable fields, friendship restrictions)
  - phase: 21
    provides: Blocks and reports collection rules
provides:
  - Storage rules require authentication for all reads (no public access)
  - Storage rules restrict photo reads to owner only (Cloud Functions bypass via Admin SDK)
  - Storage rules validate file type and size on all upload paths
  - Firestore comment/like subcollections enforce parent photo access hierarchy
  - Firestore album updates protect immutable fields (userId, createdAt)
  - Removed unused photoViews collection rules
affects: [45-02, 45-03, 45-04]

# Tech tracking
tech-stack:
  added: []
  patterns: [parent-document-access-check-for-subcollections, immutable-field-protection-on-updates]

key-files:
  created: []
  modified: [storage.rules, firestore.rules]

key-decisions:
  - 'Profile photos require authentication (not public) — app only shows them to logged-in users'
  - 'Main photos owner-only in Storage — friends access via getSignedPhotoUrl Cloud Function'
  - '10MB upload limit matches MAX_PHOTO_SIZE constant in validation.js'
  - 'photoViews collection rules removed — collection unused in codebase'

patterns-established:
  - 'Parent access check: subcollection reads verify access to parent document via get()'
  - 'Immutable field protection: use affectedKeys().hasAny() to block field changes'

issues-created: []

# Metrics
duration: 5min
completed: 2026-02-09
---

# Phase 45 Plan 01: Firebase Security Rules Hardening Summary

**Closed public photo access and cross-user Storage access vulnerabilities, enforced comment/like access hierarchy via parent photo checks, protected album immutable fields**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-09
- **Completed:** 2026-02-09
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Closed CRITICAL vulnerability: profile photos were publicly accessible without authentication
- Closed CRITICAL vulnerability: any authenticated user could access any user's photos in Storage
- Enforced comment/like read access to match parent photo restrictions (owner/journal/friends)
- Protected album userId and createdAt fields from modification
- Removed unused photoViews collection rules (dead code cleanup)
- Added file type (image/\*) and size (10MB) validation on all Storage upload paths

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix Storage security rules** - `c36d982` (fix)
2. **Task 2: Fix Firestore security rules** - `18c5414` (fix)

## Files Created/Modified

- `storage.rules` - Hardened read access (auth-only for profile-photos, owner-only for photos), added content type and size validation on uploads
- `firestore.rules` - Comment/like subcollection reads check parent photo access, album update protects immutable fields, removed unused photoViews block

## Decisions Made

- Profile photos require authentication for read — the app only shows them to logged-in users, public access was unnecessary
- Main photos restricted to owner-only direct Storage read — other users access photos through getSignedPhotoUrl Cloud Function which uses Admin SDK (bypasses Storage rules)
- 10MB size limit chosen to match existing MAX_PHOTO_SIZE constant in src/utils/validation.js
- photoViews rules removed entirely rather than commented — collection is unused, can be re-added if needed later

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Storage and Firestore rules hardened, ready for Cloud Functions access control (45-02)
- getSignedPhotoUrl is the next target — needs auth verification since it's now the sole path for non-owner photo access

---

_Phase: 45-security-audit_
_Completed: 2026-02-09_
