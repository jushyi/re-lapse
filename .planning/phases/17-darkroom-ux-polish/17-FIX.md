---
phase: 17-darkroom-ux-polish
plan: 17-FIX
type: fix
---

<objective>
Fix 5 UAT issues from Phase 17 Darkroom UX Polish.

Source: 17-ISSUES.md
Priority: 1 blocker, 3 major, 1 minor
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-phase.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md

**Issues being fixed:**
@.planning/phases/17-darkroom-ux-polish/17-ISSUES.md

**Original plan for reference:**
@.planning/phases/17-darkroom-ux-polish/17-02-PLAN.md

**Key files:**
@src/components/SwipeablePhotoCard.js
@src/screens/DarkroomScreen.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix UAT-004 (BLOCKER) - Next photo card doesn't appear after swipe triage</name>
  <files>src/components/SwipeablePhotoCard.js, src/screens/DarkroomScreen.js</files>
  <action>
**Root cause:** After swipe animation completes and photo is removed from state, the SwipeablePhotoCard component for the next photo doesn't render because the current card's animated values persist (opacity = 0, position offscreen).

**Fix approach:**
1. In SwipeablePhotoCard, reset all animated values when photo prop changes:
   - Add useEffect that watches photo.id
   - When photo.id changes, reset translateX, translateY, cardOpacity to initial values
   - Reset actionInProgress to false

2. In DarkroomScreen, add a key prop to SwipeablePhotoCard based on currentPhoto.id:
   - This forces React to unmount/remount the component with fresh state
   - Pattern: `<SwipeablePhotoCard key={currentPhoto.id} photo={currentPhoto} ... />`

3. Ensure state update in handleTriage happens AFTER animation callback fires, not during.
  </action>
  <verify>
1. Open darkroom with 3+ photos
2. Swipe left to archive first photo
3. Next photo appears immediately with card at center position
4. Repeat for remaining photos - each transition works smoothly
  </verify>
  <done>Next photo card renders after each swipe triage, animations reset properly</done>
</task>

<task type="auto">
  <name>Task 2: Fix UAT-002 (MAJOR) - Remove down-swipe delete gesture</name>
  <files>src/components/SwipeablePhotoCard.js, src/screens/DarkroomScreen.js</files>
  <action>
**Issue:** Down-swipe delete is too easy to trigger accidentally during horizontal swipes, causing unintended photo deletion.

**Fix:**
1. In SwipeablePhotoCard.onEnd handler:
   - Remove the isDownSwipe detection entirely
   - Remove the down-swipe exit animation branch
   - Remove the translateY > VERTICAL_THRESHOLD condition
   - Keep only left/right swipe actions

2. Remove delete overlay (deleteOverlayStyle) from rendering - users won't see red overlay during swipes since down-swipe is disabled.

3. Keep the onSwipeDown prop but don't wire it to any gesture - it's only used by button now.

4. In onUpdate handler:
   - Still allow vertical finger movement (for natural gesture feel)
   - But don't trigger threshold haptic for vertical-only movement

5. Simplify threshold detection to only check horizontal: `if (absX > HORIZONTAL_THRESHOLD)`

**Result:** Delete is only available via button, no accidental deletions from swipes.
  </action>
  <verify>
1. Open darkroom with a photo
2. Attempt to swipe downward - card should spring back, no delete
3. Swipe left (archive) with finger drifting down - should archive, not delete
4. Swipe right (journal) with finger drifting down - should journal, not delete
5. Delete button still works
  </verify>
  <done>Down-swipe delete removed, accidental deletions prevented</done>
</task>

<task type="auto">
  <name>Task 3: Fix UAT-003 (MAJOR) - Button taps trigger flick animations</name>
  <files>src/components/SwipeablePhotoCard.js, src/screens/DarkroomScreen.js</files>
  <action>
**Issue:** Button taps immediately remove photo without flick animation, inconsistent with swipe UX.

**Fix approach:**
1. In SwipeablePhotoCard, expose imperative methods via forwardRef + useImperativeHandle:
   - `triggerArchive()` - Plays left-arc animation then calls onSwipeLeft
   - `triggerJournal()` - Plays right-arc animation then calls onSwipeRight
   - `triggerDelete()` - Plays down animation then calls onSwipeDown

2. These methods should:
   - Set actionInProgress to true
   - Animate translateX/translateY to exit positions (same as gesture release)
   - Fade out cardOpacity
   - On animation complete, call the appropriate callback

3. In DarkroomScreen:
   - Create cardRef using useRef
   - Pass ref to SwipeablePhotoCard: `ref={cardRef}`
   - Update button handlers to call cardRef.current?.triggerArchive() etc
   - Remove direct handleTriage calls from buttons - let animation callback trigger them

**Animation timing:**
- Archive button → same as left swipe exit animation (arc to bottom-left, 250ms)
- Journal button → same as right swipe exit animation (arc to bottom-right, 250ms)
- Delete button → same as down swipe exit animation (drop straight down, 250ms)
  </action>
  <verify>
1. Tap Archive button - photo flicks left with arc animation, overlay shows
2. Tap Journal button - photo flicks right with arc animation, overlay shows
3. Tap Delete button - photo drops down with animation, overlay shows
4. All button animations match corresponding swipe animations
  </verify>
  <done>Button taps trigger matching flick animations</done>
</task>

<task type="auto">
  <name>Task 4: Fix UAT-001 (MINOR) - Card follows fixed arc path instead of finger</name>
  <files>src/components/SwipeablePhotoCard.js</files>
  <action>
**Issue:** Card currently tracks finger position. User wants fixed predetermined arc paths regardless of actual finger movement.

**Fix approach - modify gesture behavior:**
1. Change onUpdate to only track horizontal finger position (translateX)
2. Derive translateY from a fixed arc formula based only on translateX:
   - `translateY = abs(translateX) * 0.4` (steeper arc than before)
   - This creates a consistent downward curve regardless of vertical finger position

3. For the arc shape during gesture:
   - Left swipe: Card curves down-left following `y = 0.4 * abs(x)`
   - Right swipe: Card curves down-right following `y = 0.4 * abs(x)`

4. Remove direct translateY tracking from onUpdate:
   - Don't read event.translationY during drag
   - Only use it for velocity calculation in onEnd

5. Keep exit animations the same - they already use fixed positions.

**Result:** Card follows a mathematically consistent arc path regardless of where user's finger goes vertically during the swipe.
  </action>
  <verify>
1. Start swiping left but move finger upward - card still curves downward
2. Start swiping right but zigzag finger - card follows smooth fixed arc
3. Arc motion feels natural and predictable
4. Exit animations still work correctly
  </verify>
  <done>Card follows fixed arc trajectory based only on horizontal position</done>
</task>

<task type="auto">
  <name>Task 5: Fix UAT-005 (MAJOR) - Implement stacked deck visual</name>
  <files>src/screens/DarkroomScreen.js, src/components/SwipeablePhotoCard.js</files>
  <action>
**Issue:** Only one card visible at a time. User wants stacked deck effect with cards peeking behind and cascade animation.

**Fix approach:**
1. In DarkroomScreen, render up to 3 cards stacked:
   ```jsx
   {photos.slice(0, 3).map((photo, index) => (
     <SwipeablePhotoCard
       key={photo.id}
       photo={photo}
       stackIndex={index}  // New prop: 0 = front, 1 = behind, 2 = furthest back
       isActive={index === 0}  // Only front card is swipeable
       onSwipeLeft={handleArchiveSwipe}
       onSwipeRight={handleJournalSwipe}
       onSwipeDown={handleDeleteSwipe}
     />
   ))}
   ```

2. In SwipeablePhotoCard, add stack styling based on stackIndex:
   - stackIndex 0 (front): Full size, full opacity, gestures enabled
   - stackIndex 1: Scale 0.95, offset up by -10px, opacity 0.7, gestures disabled
   - stackIndex 2: Scale 0.90, offset up by -20px, opacity 0.5, gestures disabled

3. Stack cards using absolute positioning:
   - All cards positioned absolutely in container
   - zIndex based on 3 - stackIndex (front card has highest z)
   - Behind cards have pointerEvents: 'none'

4. Cascade animation when front card exits:
   - Behind cards animate forward:
     * Card at index 1 → scale 0.95→1.0, translateY -10→0, opacity 0.7→1.0
     * Card at index 2 → scale 0.90→0.95, translateY -20→-10, opacity 0.5→0.7
   - This happens automatically due to re-render with new indices

5. Add spring animation for the cascade using withSpring on scale/translateY/opacity for non-active cards.
  </action>
  <verify>
1. Open darkroom with 3+ photos
2. See stack of cards (2-3 visible, peeking behind front card)
3. Swipe/tap to triage front card
4. Watch cascade animation as next card moves forward
5. Stack refills from remaining photos
6. Last card shows alone (no stack behind)
  </verify>
  <done>Stacked deck visual with cascade animation on triage</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Fixed all 5 UAT issues: card transitions, removed accidental delete, button animations, fixed arc paths, stacked deck visual</what-built>
  <how-to-verify>
    1. Run: npx expo start
    2. Navigate to Darkroom with 3+ photos

    **Test UAT-004 (Blocker - Next card appears):**
    3. Swipe to triage first photo
    4. Verify next photo appears immediately (not blank screen)
    5. Repeat for all photos

    **Test UAT-002 (Remove down-swipe delete):**
    6. Try swiping straight down - card should spring back, no delete
    7. Swipe left with downward drift - should archive (not delete)
    8. Delete button still works

    **Test UAT-003 (Button animations):**
    9. Tap Archive - photo flicks left with arc animation
    10. Tap Journal - photo flicks right with arc animation
    11. Tap Delete - photo drops down with animation

    **Test UAT-001 (Fixed arc path):**
    12. Swipe left but move finger up/down randomly
    13. Card should follow consistent downward arc regardless of finger movement

    **Test UAT-005 (Stacked deck):**
    14. Verify 2-3 cards visible in stack (behind cards peek above)
    15. Triage front card - watch cascade animation
    16. Stack refills, last card shows alone
  </how-to-verify>
  <resume-signal>Type "approved" or describe any remaining issues</resume-signal>
</task>

</tasks>

<verification>
Before declaring plan complete:
- [ ] UAT-004: Next photo card appears after swipe (BLOCKER)
- [ ] UAT-002: Down-swipe delete removed, no accidental deletions
- [ ] UAT-003: Button taps trigger matching flick animations
- [ ] UAT-001: Card follows fixed arc path regardless of finger movement
- [ ] UAT-005: Stacked deck visual with cascade animation
- [ ] All original swipe functionality (left=archive, right=journal) still works
- [ ] App builds without errors
</verification>

<success_criteria>
- All 5 UAT issues from 17-ISSUES.md addressed
- Tests pass
- Ready for re-verification
</success_criteria>

<output>
After completion, create `.planning/phases/17-darkroom-ux-polish/17-FIX-SUMMARY.md`

Update 17-ISSUES.md to move fixed issues to "Resolved Issues" section.
</output>
