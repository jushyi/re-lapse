# Phase 38: Notification UI Polish - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<vision>
## How This Should Work

### In-App Banners

When a notification comes in while you're using the app, a small banner slides down from the top. It's unobtrusive but noticeable. Tap it and you go straight to the content — the photo, comment, or profile. No extra steps.

Critical behavior: When the app is open, only show in-app banners. No redundant push notifications hitting the lock screen while you're actively using the app.

The banners should match the app's custom dark aesthetic — not generic iOS system notifications.

### Notifications Screen

The Notifications screen (accessible from the feed) shows all your notifications in a clean list:

- Each item shows the user's avatar, the notification text, and a timestamp
- Text format: **bold username** followed by the action ("**john** liked your photo")
- Unread notifications have a small dot indicator
- Notifications are only marked as read when you tap them — not just by viewing the screen
- Items are in chronological order, no grouping

### Tab Badge

The notification tab shows a simple dot when there are unread notifications — no anxiety-inducing number counts.

</vision>

<essential>
## What Must Be Nailed

- **No notification duplication** — When app is in foreground, banners only. No push notifications while actively using the app.
- **Clear unread state** — Dot indicator on items, mark-as-read on tap (not on view)
- **Scannable list** — Bold usernames, avatar + text + timestamp, chronological order

</essential>

<boundaries>
## What's Out of Scope

- Notification grouping — combining multiple notifications into summaries (save for later)
- Sound customization — custom sounds per notification type (keep it simple)
- Swipe actions — swipe-to-delete or other gestures on notification items
- Mark all as read — bulk actions can come later

</boundaries>

<specifics>
## Specific Ideas

- Banner style: slides down from top, auto-dismisses, tap to navigate directly
- Custom dark aesthetic to match the app (not iOS system notification style)
- Dot-only tab badge (no number count)
- Text format: "**username** liked your photo" with bold username

</specifics>

<notes>
## Additional Context

This phase polishes the presentation layer — the triggers and backend are already built in Phases 34-36. Focus is on the user-facing experience: how notifications appear, how they're displayed in the list, and making sure the app doesn't spam users with duplicate notifications.

</notes>

---

_Phase: 38-notification-ui-polish_
_Context gathered: 2026-02-06_
