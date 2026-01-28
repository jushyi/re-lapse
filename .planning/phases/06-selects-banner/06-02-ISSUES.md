# UAT Issues: Phase 6 Plan 02

**Tested:** 2026-01-28
**Source:** .planning/phases/06-selects-banner/06-02-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

[None]

## Resolved Issues

### UAT-001: Edit overlay header clipped on first open

**Discovered:** 2026-01-28
**Phase/Plan:** 06-02
**Severity:** Major
**Feature:** SelectsEditOverlay
**Description:** When opening the edit overlay for the first time after a fresh app launch, the header bar is clipped into the top of the screen (appears to be under the status bar/notch area).
**Expected:** Header should be properly positioned below safe area on all opens
**Actual:** Header is clipped on first open; fixes itself after tapping "Save Changes" or navigating away and back
**Repro:**

1. Fresh open the app (force close and reopen)
2. Navigate to own profile
3. Tap Selects banner to open edit overlay
4. Observe header is clipped into top of screen
5. Tap "Save Changes" or navigate away and return
6. Issue resolves and doesn't recur until next fresh app open

**Resolution:** Fixed in 06-02-FIX plan (commit 687fd36)

- Replaced SafeAreaView edges with useSafeAreaInsets hook
- Applied explicit paddingTop: insets.top + 8 to header
- Applied explicit paddingBottom: insets.bottom + 24 to button container
  **Resolved:** 2026-01-28

---

_Phase: 06-selects-banner_
_Plan: 02_
_Tested: 2026-01-28_
