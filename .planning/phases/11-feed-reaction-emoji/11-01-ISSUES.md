# UAT Issues: Phase 11 Plan 01

**Tested:** 2026-01-30
**Source:** .planning/phases/11-feed-reaction-emoji/11-01-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

[None - all issues resolved]

## Resolved Issues

### UAT-001: Emoji picker has white/light theme instead of dark

**Discovered:** 2026-01-30
**Resolved:** 2026-01-30
**Phase/Plan:** 11-01
**Severity:** Cosmetic
**Feature:** Custom emoji picker (rn-emoji-keyboard)
**Description:** The emoji picker opens with a white/light theme, which doesn't match the app's dark aesthetic
**Expected:** Emoji picker should use dark theme colors to match the rest of the app
**Actual:** Emoji picker displays with light/white background
**Repro:** Tap "+" button on any photo's emoji row
**Resolution:** Applied dark theme configuration to EmojiPicker component using theme prop with dark colors (#1a1a1a, #2a2a2a) and brand purple accents
**Commit:** 064f75a

### UAT-002: Custom emoji disappears after reacting, can't re-use

**Discovered:** 2026-01-30
**Resolved:** 2026-01-30
**Phase/Plan:** 11-01
**Severity:** Major
**Feature:** Custom emoji picker behavior
**Description:** When selecting a custom emoji from the picker, it reacts once and then disappears. User cannot react multiple times with the same custom emoji, and the emoji doesn't persist in the picker row for others to use.
**Expected:**

1. User selects custom emoji from picker
2. Emoji gets added to the reaction row (persists visibly)
3. Automatically reacts once
4. Emoji stays in the row so user can tap again to add more reactions
5. Other users can see and react with the same custom emoji
   **Actual:** Custom emoji reacts once and vanishes from view. Cannot add multiple reactions or let others use the same emoji.
   **Repro:**
6. Tap "+" to open emoji picker
7. Select any emoji
8. Observe it reacts and disappears
9. Cannot tap the same emoji again to add more reactions
   **Resolution:** Implemented activeCustomEmojis state to track confirmed custom emojis, with immediate selection flow (no preview/confirm step). Custom emojis appear at FRONT of row with purple highlight animation (1-second fade) for visual feedback. Same highlight applies to all emoji taps.
   **Commits:** ee861b8, 8b2c67a, 456276f, 3ce0223, ab40675

---

_Phase: 11-feed-reaction-emoji_
_Plan: 01_
_Tested: 2026-01-30_
_Fixed: 2026-01-30_
