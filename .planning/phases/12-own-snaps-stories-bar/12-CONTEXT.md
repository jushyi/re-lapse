# Phase 12: Own Snaps in Stories Bar - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<vision>
## How This Should Work

Your own snaps appear in the stories bar just like friends' stories — same card style, same visual treatment — but always positioned first (leftmost). Instead of your username, the label simply says "Me."

When you tap your story card, it opens the same full-screen viewer experience as friends' stories. You swipe through your snaps, see all the reactions and comments friends have left, and can add your own comments (either as personal notes/captions or replies to friends).

The key distinction: you can see the reaction bar, but it's grayed out — you can't react to your own photos. You CAN comment though. This keeps the UI consistent while making it clear that self-reactions don't make sense.

If you have no recent snaps, your card still appears in the stories bar (empty state), rather than disappearing entirely.

</vision>

<essential>
## What Must Be Nailed

- **Integrated but first** — Your story card matches friends' visual style exactly, just always positioned leftmost with "Me" label
- **Same viewer experience** — Tapping opens the same story viewer as friends, with full swipe navigation
- **Disabled reactions, enabled comments** — Reaction bar visible but non-interactive on own photos; commenting works for both notes and replies
- **See friend activity** — All reactions and comments from friends visible when viewing your own snaps

</essential>

<boundaries>
## What's Out of Scope

- No editing or deleting snaps — this is view-only
- No story archives or highlights — just current journaled snaps
- No activity indicator on the card — activity is visible when you open, not on the card itself
- No special styling or ring indicator — matches friends exactly

</boundaries>

<specifics>
## Specific Ideas

- Card label shows "Me" instead of username
- Empty card appears when no snaps (not hidden, not a "take photo" prompt)
- Snap order matches friends' story order (consistent experience)
- "Journaled snaps" = the same photos friends see in their feeds

</specifics>

<notes>
## Additional Context

The core goal is making your own content feel like a natural part of the stories bar without special treatment. You should be able to see how friends have engaged with your photos (reactions, comments) and add your own comments, but reacting to yourself doesn't make sense so that's disabled.

</notes>

---

_Phase: 12-own-snaps-stories-bar_
_Context gathered: 2026-01-30_
