# Phase 13: Split Activity into Notifications & Friends - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<vision>
## How This Should Work

Instagram-style separation for activity and social connections. The feed header gets two icons:

- Heart icon → notifications screen (reactions and comments on your photos)
- New friend icon on left side of header → friends list screen

Both screens already exist in the app. This phase is purely about navigation restructuring — wiring up the existing screens to new entry points in the feed header. The notifications screen will be updated in a future milestone, so no content changes are needed now.

The goal is a cleaner navigation model where notifications and friend management have distinct, intuitive entry points.

</vision>

<essential>
## What Must Be Nailed

- **Feed header layout** - Two icons clearly positioned: friend icon on left, heart icon in its place
- **Navigation wiring** - Both icons correctly navigate to their respective existing screens
- Both are equally important — the navigation pattern and screen access must feel natural

</essential>

<boundaries>
## What's Out of Scope

- Push notifications — just in-app display, no system notifications
- Read/unread state tracking — no tracking which notifications have been seen
- Screen content changes — existing notifications and friends screens stay as-is
- Notifications screen redesign — deferred to a future milestone

</boundaries>

<specifics>
## Specific Ideas

- Instagram-style icon placement pattern in header
- Existing friends screen accessible from new friend icon
- Existing notifications screen accessible from heart icon
- No modifications to the screen contents themselves

</specifics>

<notes>
## Additional Context

This is a navigation-focused phase. Both destination screens already exist and function correctly. The work is limited to header UI changes and navigation wiring. Future milestone will address notifications screen improvements.

</notes>

---

_Phase: 13-split-activity-notifications-friends_
_Context gathered: 2026-01-30_
