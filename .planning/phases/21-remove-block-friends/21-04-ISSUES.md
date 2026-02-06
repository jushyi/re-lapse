# UAT Issues: Phase 21 Plan 04

**Tested:** 2026-02-04
**Source:** .planning/phases/21-remove-block-friends/21-04-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-004: ReportUserScreen keyboard UX issues

**Discovered:** 2026-02-04
**Phase/Plan:** 21-03
**Severity:** Minor
**Feature:** Report User
**Description:** When typing in the details field:

1. Screen doesn't auto-scroll to keep input visible above keyboard
2. Submit button is partially blocked by iOS keyboard suggestions bar
   **Expected:** Input stays visible, submit button accessible
   **Actual:** Need to manually scroll; submit partially obscured

### UAT-006: FriendCard menu doesn't update to show Unblock after blocking

**Discovered:** 2026-02-04
**Phase/Plan:** 21-02
**Severity:** Minor
**Feature:** Block/Unblock
**Description:** After blocking a user from FriendCard menu, the menu still shows "Block" instead of "Unblock". Need to navigate to their profile to access Unblock option.
**Expected:** Menu updates to show "Unblock" for blocked users
**Actual:** Menu still shows "Block" until page refresh or profile navigation

## Resolved Issues

### UAT-001: Missing Firestore security rules for blocks collection

**Discovered:** 2026-02-04
**Resolved:** 2026-02-04 - Fixed inline during UAT
**Phase/Plan:** 21-04
**Severity:** Blocker
**Feature:** Block Enforcement
**Description:** The `blocks` collection has no security rules defined in `firestore.rules`. The default deny rule blocks all read/write access, causing `getBlockedByUserIds` and all block-related queries to fail with permission denied errors.
**Root Cause:** Phase 21-01 created the `blocks` collection and blockService.js but did not update `firestore.rules` to allow access.
**Fix Applied:**

1. Added security rules for `blocks` collection - blocker/blocked can read, blocker can create/delete
2. Added `isBlockMemberById` helper function to allow reading non-existent documents (needed for `isBlocked` checks)

### UAT-002: Missing Firestore security rules for reports collection

**Discovered:** 2026-02-04
**Resolved:** 2026-02-04 - Fixed inline during UAT
**Phase/Plan:** 21-04
**Severity:** Blocker
**Feature:** Report User
**Description:** The `reports` collection (created in 21-01) also had no security rules.
**Fix Applied:** Added security rules for `reports` collection - reporter can create, reports are immutable after creation.

### UAT-003: Feed doesn't update after removing friend until app restart

**Discovered:** 2026-02-04
**Resolved:** 2026-02-04 - Fixed inline during UAT
**Phase/Plan:** 21-04 (affects feed refresh behavior)
**Severity:** Major
**Feature:** Remove Friend
**Description:** After removing a friend, their posts still appeared in feed even after pull-to-refresh. Only app restart removed them.
**Root Cause:** `useFeedPhotos.refreshFeed()` and `loadFeedPhotos()` had a closure stale state bug - called `fetchFriendships()` to update state, but then immediately used the OLD `friendUserIds` from closure instead of the new value.
**Fix Applied:** Modified `fetchFriendships()` to return the friend IDs directly in addition to updating state. Updated `refreshFeed()` and `loadFeedPhotos()` to use the returned value immediately rather than relying on stale closure state.

### UAT-005: Archive photos fallback not filtering blocked users

**Discovered:** 2026-02-04
**Resolved:** 2026-02-04 - Fixed inline during UAT
**Phase/Plan:** 21-04
**Severity:** Major
**Feature:** Block Enforcement
**Description:** When blocked user A's photos were filtered from feed, the archive photos fallback (historical photos shown when feed is empty) still loaded and displayed A's photos.
**Root Cause:** `feedService.getRandomFriendPhotos()` didn't query or filter blocked users - it only filtered by friend IDs.
**Fix Applied:** Added `currentUserId` parameter to `getRandomFriendPhotos()`, added `getBlockedByUserIds()` call and filter logic. Updated FeedScreen to pass `user.uid` when calling.

---

_Phase: 21-remove-block-friends_
_Plan: 04_
_Tested: 2026-02-04_
