# UAT Issues: Phase 36 Plan 03

**Tested:** 2026-01-26
**Source:** .planning/phases/36-comments-feature/36-03-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-002: Comment doesn't appear in list after submitting

**Discovered:** 2026-01-26
**Phase/Plan:** 36-03
**Severity:** Major
**Feature:** CommentsBottomSheet comment submission
**Description:** When user types and submits a comment, it saves but doesn't appear in the comments list within the bottom sheet.
**Expected:** New comment immediately appears in the comments list
**Actual:** Comment doesn't show in the list (but may be saving to Firestore)
**Status:** Needs verification - real-time subscription code appears correct, UX fixes may resolve this
**Update 2026-01-26:** User reports submit now works and comments appear in list. May be resolved.

### UAT-009: CommentsBottomSheet cannot be closed (BLOCKER)

**Discovered:** 2026-01-26
**Phase/Plan:** 36-03
**Severity:** Blocker
**Feature:** CommentsBottomSheet
**Description:** Once the CommentsBottomSheet is opened, it cannot be closed. Every attempt to close it (swipe down, tap outside, any method) results in the sheet immediately reopening.
**Expected:** User can close the bottom sheet by swiping down or tapping outside
**Actual:** Sheet keeps reopening after every close attempt
**Repro:**

1. Open a photo from the feed (or tap comment preview on feed card)
2. Tap on the comment area in the footer to open CommentsBottomSheet
3. Try to close by swiping down or tapping outside
4. Sheet immediately reopens

### UAT-010: Comment input clips into bottom safe area

**Discovered:** 2026-01-26
**Phase/Plan:** 36-03
**Severity:** Minor
**Feature:** CommentsBottomSheet input area
**Description:** The comment input box and send button are clipping into the bottom of the phone screen (safe area issue). Additionally, the send button is not vertically aligned with the comment input box.
**Expected:** Input area respects safe area insets, send button vertically centered with input
**Actual:** Elements clip into bottom safe area, send button misaligned
**Repro:**

1. Open CommentsBottomSheet
2. Look at the bottom input area

### UAT-011: Comment preview still misaligned with username

**Discovered:** 2026-01-26
**Phase/Plan:** 36-03
**Severity:** Minor
**Feature:** Comment preview in PhotoDetailModal
**Description:** Despite fix in commit 3732516, user reports comment preview in modal still does not align with the username. It's positioned too far to the left.
**Expected:** Comment preview should align with the username/user info
**Actual:** Preview is offset to the left
**Note:** May need different fix approach than UAT-004

### UAT-012: Show single rotating comment preview instead of multiple

**Discovered:** 2026-01-26
**Phase/Plan:** 36-03
**Severity:** Minor
**Feature:** Comment preview in PhotoDetailModal
**Description:** User feedback - should only show one comment preview at a time and rotate through comments if there are multiple, rather than showing multiple previews at once.
**Expected:** Single comment preview that cycles through available comments
**Actual:** Multiple comment previews shown simultaneously
**Repro:**

1. Open a photo modal with multiple comments
2. Observe preview area shows multiple comments

### UAT-013: Keyboard covers comment input when typing

**Discovered:** 2026-01-26
**Phase/Plan:** 36-03
**Severity:** Major
**Feature:** CommentsBottomSheet keyboard handling
**Description:** When the keyboard opens in CommentsBottomSheet, it covers the comment input area and send button. The sheet should move up when keyboard is open so the input remains visible above the keyboard.
**Expected:** Comment input and send button stay visible above keyboard
**Actual:** Keyboard covers the input area, user can't see what they're typing
**Repro:**

1. Open CommentsBottomSheet
2. Tap on comment input to open keyboard
3. Keyboard covers the input area

### UAT-014: Comment tap doesn't open sheet in feed mode (only stories work)

**Discovered:** 2026-01-26
**Phase/Plan:** 36-03
**Severity:** Major
**Feature:** PhotoDetailModal comment trigger in feed mode
**Description:** When opening a photo modal from feed cards, tapping the comment area in the footer doesn't open CommentsBottomSheet. However, the same action works correctly when viewing stories.
**Expected:** Tapping comment area opens CommentsBottomSheet in both feed and stories mode
**Actual:** Comment tap only works in stories mode, not feed mode
**Repro:**

1. On Feed, tap a photo to open PhotoDetailModal (feed mode)
2. Tap the comment area in the footer
3. CommentsBottomSheet does NOT open
4. Now open a story (stories mode)
5. Tap the comment area
6. CommentsBottomSheet opens correctly

## Resolved Issues

### UAT-001: Footer layout is ~1/3 not 50/50 as designed

**Discovered:** 2026-01-26
**Resolved:** 2026-01-26
**Commit:** 3732516
**Fix:** Changed `commentInputTrigger` and `emojiPickerScrollView` to `flex: 1` for equal 50/50 split

### UAT-003: CommentsBottomSheet closes on comment send

**Discovered:** 2026-01-26
**Resolved:** 2026-01-26
**Commit:** 1925bf2
**Fix:** Removed close behavior, added refocus to input after successful comment submit

### UAT-004: Preview comments overlap with user's name in modal

**Discovered:** 2026-01-26
**Resolved:** 2026-01-26
**Commit:** 3732516
**Fix:** Adjusted userInfoOverlay to bottom: 140 and commentPreviewContainer to absolute positioning at bottom: 100

### UAT-005: Comment button on feed cards doesn't open CommentsBottomSheet

**Discovered:** 2026-01-26
**Resolved:** 2026-01-26
**Commit:** d1757f0
**Fix:** Added `onCommentPress` prop to FeedPhotoCard, `initialShowComments` prop to PhotoDetailModal

### UAT-006: Client-side filtering is a bandaid for Firestore composite index issue

**Discovered:** 2026-01-26
**Resolved:** 2026-01-26
**Commit:** 0954989
**Fix:** Created firestore.indexes.json with composite index, updated getPreviewComments to use server-side filtering
**Deploy:** Run `firebase deploy --only firestore:indexes` to activate

### UAT-007: Keyboard doesn't auto-open when CommentsBottomSheet appears

**Discovered:** 2026-01-26
**Resolved:** 2026-01-26
**Commit:** 1925bf2
**Fix:** Added auto-focus to inputRef after sheet animation completes with 100ms delay

### UAT-008: CommentsBottomSheet has poor empty state

**Discovered:** 2026-01-26
**Resolved:** 2026-01-26
**Commit:** 1925bf2
**Fix:** Added MIN_SHEET_HEIGHT (50% screen) to sheet and emptyContainer styles for consistent height

---

_Phase: 36-comments-feature_
_Plan: 03_
_Tested: 2026-01-26_
_Fixed: 2026-01-26_
