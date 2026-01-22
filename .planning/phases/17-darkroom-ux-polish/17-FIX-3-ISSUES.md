# UAT Issues: Phase 17 Plan FIX-3

**Tested:** 2026-01-22
**Source:** .planning/phases/17-darkroom-ux-polish/17-FIX-3-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-012: Gray flash in front card placeholder during cascade

**Discovered:** 2026-01-22
**Phase/Plan:** 17-FIX-3
**Severity:** Blocker
**Feature:** Card cascade animation
**Description:** When swiping a card away, gray is visible in the area where the front card was positioned before the next card animates into place. The gray appears to be from the container/placeholder background behind the front card position.
**Expected:** Seamless transition with no visible gray - the background cards should smoothly fill the space
**Actual:** Brief gray flash visible in the empty front card slot during cascade animation
**Repro:**
1. Open darkroom with 2+ revealed photos
2. Swipe front card left or right
3. Observe the area where the front card was - gray is briefly visible

### UAT-013: Stack blur overlay not visible on background cards

**Discovered:** 2026-01-22
**Phase/Plan:** 17-FIX-3
**Severity:** Major
**Feature:** Depth-of-field blur overlay
**Description:** Background stack cards do not show any visible dark overlay for depth-of-field effect. Cards in the stack look identical to the front card.
**Expected:** Background cards should have subtle dark overlay (15% for stack index 1, 30% for stack index 2)
**Actual:** No overlay visible - all cards appear the same brightness
**Repro:**
1. Open darkroom with 3+ revealed photos
2. Look at cards peeking from behind the front card
3. No darkening visible on background cards

### UAT-014: Card border radius too prominent

**Discovered:** 2026-01-22
**Phase/Plan:** 17-FIX-3
**Severity:** Minor
**Feature:** Photo card styling
**Description:** The rounded corners on photo cards are too prominent. User prefers approximately 1/4 of the current radius while still maintaining rounded edges.
**Expected:** Subtle rounded corners (reduced radius)
**Actual:** Current radius is too large/prominent
**Repro:**
1. Open darkroom with any revealed photos
2. Observe the corner radius on photo cards - appears too rounded

## Resolved Issues

[None yet]

---

*Phase: 17-darkroom-ux-polish*
*Plan: FIX-3*
*Tested: 2026-01-22*
