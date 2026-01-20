# UAT Issues: Phase 15 Plan 01

**Tested:** 2026-01-20
**Source:** .planning/phases/15-background-photo-upload/15-01-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

[None - all issues resolved]

## Resolved Issues

### UAT-001: Camera still shows loading spinner and delay after capture

**Discovered:** 2026-01-20
**Resolved:** 2026-01-20
**Phase/Plan:** 15-01
**Severity:** Major
**Feature:** Instant camera capture
**Description:** Despite the background upload queue, the camera still shows a loading spinner and noticeable delay after pressing the shutter button.
**Expected:** Camera should capture instantly with no spinner or blocking - upload happens entirely in background
**Actual:** Both a loading spinner appears AND there's a delay before the user can take another photo
**Resolution:** Removed ActivityIndicator from capture button entirely. Flash animation provides instant visual feedback on capture, eliminating perceived delay. Camera returns to ready state immediately after takePictureAsync completes (~100ms).
**Commit:** 96183f8

### UAT-002: Arc animation goes to wrong location

**Discovered:** 2026-01-20
**Resolved:** 2026-01-20
**Phase/Plan:** 15-01
**Severity:** Minor
**Feature:** Arc animation (photo flying to darkroom)
**Description:** The photo thumbnail animation doesn't fly to the correct destination (darkroom badge).
**Expected:** Photo should animate in a curved arc ending at the darkroom badge location
**Actual:** Photo animates but ends up at a different location on screen
**Resolution:** Fixed animation destination calculation. The darkroom button is on the LEFT side of the footer controls (first item), but animation was moving RIGHT. Updated photoTranslateX to move LEFT (negative offset) and calculated precise position from layout constants: DARKROOM_BUTTON_OFFSET_X = -108 (gap + button widths).
**Commit:** 96183f8

---

*Phase: 15-background-photo-upload*
*Plan: 01*
*Tested: 2026-01-20*
