# UAT Issues: Phase 17 Plan FIX-5 (Post-FIX-4 Verification)

**Tested:** 2026-01-22
**Source:** .planning/phases/17-darkroom-ux-polish/17-FIX-4-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-015: Black flash after cascade animation completes

**Discovered:** 2026-01-22
**Phase/Plan:** 17-FIX-4
**Severity:** Major
**Feature:** Card cascade animation
**Description:** The cascade animation plays smoothly and works perfectly, but after it completes, the screen flashes black briefly before the card is fully shown. This appears to happen at the end of the animation sequence, not during.
**Expected:** Seamless transition with no flash - card should be fully visible as animation completes
**Actual:** Brief black flash appears after animation plays before the new front card is fully rendered
**Repro:**
1. Open darkroom with 2+ revealed photos
2. Swipe or tap to remove front card
3. Watch the cascade animation complete
4. Observe brief black flash before next card is fully shown

### UAT-016: Button-triggered animations too fast

**Discovered:** 2026-01-22
**Phase/Plan:** 17-FIX-4
**Severity:** Major
**Feature:** Button triage animations
**Description:** When using the Archive/Journal buttons to trigger triage, the card exit animation is way too fast. User suggests it needs to be approximately 0.3x the current speed (i.e., 3x slower/longer duration).
**Expected:** Button-triggered animation should have the same satisfying pace as swipe gestures
**Actual:** Button animation is much faster than swipe animation, feels abrupt and unsatisfying
**Repro:**
1. Open darkroom with revealed photos
2. Tap Archive or Journal button
3. Observe the card exit animation - noticeably faster than swipe animation

## Resolved Issues

[None yet]

---

*Phase: 17-darkroom-ux-polish*
*Plan: FIX-5*
*Tested: 2026-01-22*
