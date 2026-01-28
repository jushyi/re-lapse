# UAT Issues: Phase 7 Plan 04

**Tested:** 2026-01-28
**Source:** .planning/phases/07-profile-song/07-04-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-001: Clip selection limited to 30-second preview instead of full song

**Discovered:** 2026-01-28
**Phase/Plan:** 07-04
**Severity:** Major
**Feature:** WaveformScrubber / Clip Selection
**Description:** User should be able to select any 30-second clip from the FULL song duration, not just adjust handles within the 30-second iTunes preview. Currently the waveform only represents the preview snippet.
**Expected:** Scrollable/draggable waveform representing the entire song, with a timeline indicator showing position, allowing selection of any 30-second range from the full track
**Actual:** Waveform only shows the 30-second preview; user can only pick a range within that limited window

### UAT-007: Clip selection should overlay song search instead of replacing it

**Discovered:** 2026-01-28
**Phase/Plan:** 07-04
**Severity:** Major
**Feature:** Song selection flow / modal navigation
**Description:** When user selects a song from search, the clip selection modal should appear OVER the search modal, not replace it. Current sequential flow (close search → open clip selection) feels disconnected. Suggested fix: convert SongSearchModal to a screen so ClipSelectionModal can stack on top.
**Expected:** Clip selection pops up over song search; user sees both layers
**Actual:** Song search closes before clip selection opens (sequential modal flow)
**Suggested approach:** Convert SongSearchModal to a screen in navigation stack

## Resolved Issues

### UAT-002: ClipSelectionModal should be partial height, not full screen

**Discovered:** 2026-01-28
**Phase/Plan:** 07-04
**Severity:** Minor
**Resolved:** 2026-01-28 - Fixed in 07-04-FIX.md
**Commit:** da2120b

### UAT-003: Waveform needs playback position indicator during preview

**Discovered:** 2026-01-28
**Phase/Plan:** 07-04
**Severity:** Minor
**Resolved:** 2026-01-28 - Fixed in 07-04-FIX.md
**Commit:** 1cd55f9, 9e01022

### UAT-004: Cancel in clip selection should return to song search

**Discovered:** 2026-01-28
**Phase/Plan:** 07-04
**Severity:** Minor
**Resolved:** 2026-01-28 - Fixed in 07-04-FIX.md
**Commit:** fc3544b

### UAT-005: Playback position indicator jumps instead of sliding smoothly

**Discovered:** 2026-01-28
**Phase/Plan:** 07-04-FIX
**Severity:** Minor
**Resolved:** 2026-01-28 - Fixed in 07-04-FIX2.md
**Commit:** a78a13f, 2981cf0, 1bdc6bb

### UAT-006: Song audio should play even when phone is in silent mode

**Discovered:** 2026-01-28
**Phase/Plan:** 07-04
**Severity:** Major
**Resolved:** 2026-01-28 - Fixed in 07-04-FIX2.md
**Commit:** 82ceb4b

---

_Phase: 07-profile-song_
_Plan: 04_
_Tested: 2026-01-28_
