---
phase: 17-darkroom-ux-polish
plan: FIX-4
type: fix
---

<objective>
Fix 3 UAT issues from plan FIX-3.

Source: 17-FIX-3-ISSUES.md
Priority: 1 blocker, 1 major, 1 minor
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-phase.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md

**Issues being fixed:**
@.planning/phases/17-darkroom-ux-polish/17-FIX-3-ISSUES.md

**Key files:**
@src/components/SwipeablePhotoCard.js
@src/screens/DarkroomScreen.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix UAT-012 - Gray flash in front card placeholder</name>
  <files>src/screens/DarkroomScreen.js</files>
  <action>
The gray flash appears because `photoCardContainer` style has no background color. When the front card animates away, the container behind it is visible before the next card fills the space.

Fix: Add `backgroundColor: '#000000'` to the `photoCardContainer` style in DarkroomScreen.js (line ~384). This ensures the container matches the screen background (#000000) and eliminates any visible flash during cascade.
  </action>
  <verify>Run app, open darkroom with 2+ photos, swipe to triage - no gray flash visible during cascade</verify>
  <done>photoCardContainer has black background, no gray flash during card transitions</done>
</task>

<task type="auto">
  <name>Task 2: Fix UAT-013 - Stack blur overlay not visible</name>
  <files>src/components/SwipeablePhotoCard.js</files>
  <action>
The blur overlay is being rendered but not visible. Looking at the code:
- stackBlurOverlayStyle uses stackBlurOpacityAnim (correct)
- The overlay View is rendered at line 415 with `!isActive` condition (correct for stack cards)

The issue is the overlay may be rendering behind the Image or z-index is incorrect.

Fix:
1. Add `position: 'absolute'` and higher z-index to the stackBlurOverlay style
2. Remove the `borderRadius` from stackBlurOverlay (it's redundant since container has overflow:hidden)
3. Increase opacity values for more visible effect: change from 0.15/0.30 to 0.25/0.45

In getStackBlurOpacity function (line ~71), change:
- Index 1: from 0.15 to 0.25
- Index 2: from 0.30 to 0.45

In stackBlurOverlay style (line ~491), ensure:
```javascript
stackBlurOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: '#000000',
  zIndex: 1,
},
```
  </action>
  <verify>Run app, open darkroom with 3+ photos, background cards should be visibly darker than front card</verify>
  <done>Background stack cards have visible dark overlay creating depth-of-field effect</done>
</task>

<task type="auto">
  <name>Task 3: Fix UAT-014 - Reduce card border radius</name>
  <files>src/components/SwipeablePhotoCard.js</files>
  <action>
User wants border radius reduced to approximately 1/4 of current value.

Current value in cardContainer style (line ~472): borderRadius: 24

Fix: Change to borderRadius: 6 (24 / 4 = 6)

Also update:
- photoImage borderRadius if it has one (check if it does)
- overlay styles borderRadius: 24 → 6 (line ~500)
  </action>
  <verify>Run app, open darkroom, observe photo cards have subtler rounded corners</verify>
  <done>Card border radius reduced from 24 to 6, subtle rounded edges maintained</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Fixed all 3 UAT issues: gray flash, blur overlay, border radius</what-built>
  <how-to-verify>
    1. Run app: npx expo start
    2. Open darkroom with 3+ revealed photos
    3. Verify UAT-012: Swipe a card away - NO gray flash during cascade
    4. Verify UAT-013: Look at background stack cards - visibly darker than front card
    5. Verify UAT-014: Card corners have subtle rounding (much less than before)
  </how-to-verify>
  <resume-signal>Type "approved" or describe any remaining issues</resume-signal>
</task>

</tasks>

<verification>
Before declaring plan complete:
- [ ] Gray flash eliminated during cascade (UAT-012 - Blocker)
- [ ] Background cards have visible blur/dark overlay (UAT-013 - Major)
- [ ] Card border radius reduced (UAT-014 - Minor)
- [ ] App builds without errors
</verification>

<success_criteria>
- All 3 UAT issues from 17-FIX-3-ISSUES.md addressed
- Visual polish improved for darkroom card stack
- Ready for re-verification
</success_criteria>

<output>
After completion, create `.planning/phases/17-darkroom-ux-polish/17-FIX-4-SUMMARY.md`
</output>
