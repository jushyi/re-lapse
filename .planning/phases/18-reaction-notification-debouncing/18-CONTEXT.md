# Phase 18: Reaction Notification Debouncing - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<vision>
## How This Should Work

When someone reacts to your photo, the app waits until they're done reacting (10 second timeout after their last tap) before sending a single notification summarizing all their reactions. No more notification spam from rapid tapping.

The notification shows what they actually reacted with: "Sarah reacted 😂×2 ❤️×1 🔥×3 to your photo" — each emoji with its count.

There's a new notifications feed accessible from a heart button on the feed page (Instagram-style). It's a vertical scrolling list with profile photos, notification text, and timestamps. Simple red dot indicator on the heart button when there are new notifications — no count badge, just presence.

</vision>

<essential>
## What Must Be Nailed

- **No notification spam** — The batching MUST work. One notification per user per reaction session, not per tap. This is the entire point of the phase.
- **Clear message format** — "Name reacted 😂×2 ❤️×1 to your photo" must be readable and make sense at a glance

</essential>

<boundaries>
## What's Out of Scope

- Other notification types — friend requests and photo reveals stay as-is, only reaction notifications get debounced
- Read/unread state tracking — not tracking which notifications have been viewed
- Tapping to navigate — tapping a notification in the feed doesn't navigate to the photo (can be added later)

</boundaries>

<specifics>
## Specific Ideas

- Heart button on feed page opens notifications feed (like Instagram)
- Instagram-style vertical list: profile photo, notification text, timestamp
- Small red dot badge on heart button for new notifications (not a count)
- 10 second timeout window to batch reactions from same user
- Emoji×count format in notification text

</specifics>

<notes>
## Additional Context

The current system sends a notification for every single reaction tap, which is spammy when users rapidly tap emojis. This phase fixes that by batching at the Cloud Function level with a timeout window.

</notes>

---

*Phase: 18-reaction-notification-debouncing*
*Context gathered: 2026-01-21*
