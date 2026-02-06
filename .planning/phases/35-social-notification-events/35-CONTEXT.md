# Phase 35: Social Notification Events - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<vision>
## How This Should Work

Real-time push notifications for all social activity — when someone likes your photo, comments, follows you, or sends a friend request, you get an instant notification. It should feel like Lapse/BeReal: simple, clean push notifications with profile pics and clear action text.

Users control their experience through a notification settings page. There's a "Notifications" section within the existing Settings screen that opens to a dedicated screen with granular controls: a master toggle to enable/disable all notifications, plus individual toggles for each notification type (likes, comments, follows, friend requests, mentions).

</vision>

<essential>
## What Must Be Nailed

- **Reliable delivery** — Notifications always arrive, never miss a comment or follow
- **Clear messaging** — Each notification instantly tells you what happened and who did it
- **Settings control** — Users can configure exactly which notifications they receive (master toggle + per-type)

</essential>

<boundaries>
## What's Out of Scope

- Photo tagging notifications — that's Phase 41 (Tagged Notification Integration)
- In-app notification UI polish — that's Phase 38 (Notification UI Polish)
- This phase focuses on triggers, delivery, and settings — not the in-app presentation

</boundaries>

<specifics>
## Specific Ideas

- Like Lapse/BeReal style: simple, clean push notifications with profile pics and clear action text
- Notification settings lives in Settings > "Notifications" section > opens dedicated screen
- Master on/off toggle plus individual per-type toggles (likes, comments, follows, friend requests, mentions)
- Real-time delivery — instant, not batched

</specifics>

<notes>
## Additional Context

All social action types should trigger notifications by default:

- Likes
- Comments
- Follows
- Friend requests
- Mentions (in comments)

User preferences stored and respected for which types they want to receive.

</notes>

---

_Phase: 35-social-notification-events_
_Context gathered: 2026-02-06_
