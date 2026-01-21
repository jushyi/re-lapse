# Phase 17: Darkroom UX Polish - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<vision>
## How This Should Work

The darkroom triage experience should feel **snappy and responsive** — no unnecessary friction. The main pain point is the confirmation popups between each triage action. They make the flow feel clunky when you're quickly sorting through photos.

**New swipe animation:** Replace the current Mail-style horizontal swipes with a **downward arc motion** — like flicking a card out of your wrist. The card should arc down and off screen in a satisfying flick gesture.

**Swipe directions:**
- Swipe left = Archive (gray overlay with box icon fades in as card exits)
- Swipe right = Journal (green overlay with checkmark circle fades in as card exits)
- Swipe down = Delete (overlay with X icon fades in as card exits)

**Confirmation overlays:** Instead of popup dialogs, the confirmation appears as an overlay ON the card itself as it's being flicked away. Simple icons (checkmark circle, box, X) — no emojis.

**Button triage alternative:** For users who don't want to swipe:
- Delete button: circle in the middle
- Journal button: rounded rectangle on the right side
- Archive button: rounded rectangle on the left side

The photo preview cards should be **taller and wider** with a slight black border maintained around them.

</vision>

<essential>
## What Must Be Nailed

- **Remove all confirmation popups** — swipes should feel instant with no interruption
- **New flick animation** — downward arc motion that feels satisfying and natural
- **On-card confirmation overlays** — visual feedback without blocking dialogs
- **Better haptic feedback** — satisfying vibrations on swipes
- **Button triage options** — accessible alternative to swipe gestures

</essential>

<boundaries>
## What's Out of Scope

- Undo functionality — that's Phase 18.1, not this phase
- Reveal animations — how photos first appear when revealed
- Batching/session persistence — that's Phase 18.1
- Changes to the darkroom entry/exit transitions

</boundaries>

<specifics>
## Specific Ideas

**Swipe animation:**
- Arc motion like flicking a card from your wrist
- Card curves downward as it exits screen
- Smooth, quick animation — should feel snappy

**Confirmation icons (replace emojis):**
- Journal: circle with checkmark (green)
- Archive: box icon (gray)
- Delete: X icon

**Button layout:**
- Delete: circle button, centered
- Journal: rounded rectangle, right side
- Archive: rounded rectangle, left side

**Photo cards:**
- Taller and wider than current
- Maintain slight black border

**Remove:**
- Debug button from darkroom
- Confirmation popup dialogs
- Emojis from confirmations

</specifics>

<notes>
## Additional Context

User wants speed over safety for this phase. The undo capability in Phase 18.1 will serve as the safety net, so removing confirmations now is acceptable.

The "flick from wrist" animation should feel like physically discarding a card — satisfying and quick.

</notes>

---

*Phase: 17-darkroom-ux-polish*
*Context gathered: 2026-01-21*
