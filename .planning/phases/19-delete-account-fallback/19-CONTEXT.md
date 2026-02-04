# Phase 19: Delete Account Fallback - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<vision>
## How This Should Work

When a user decides to delete their account, they go through an Instagram-style flow with a clear confirmation screen explaining what will happen. The deletion is scheduled for 30 days out — not immediate — giving them a chance to change their mind.

Before finalizing, users can download all their photos to their camera roll with a single button tap. They shouldn't lose the memories they've captured just because they're leaving the app.

Once deletion is scheduled, the user is logged out entirely. If they open the app during the 30-day grace period and log back in, they see an explicit prompt asking whether they want to cancel the deletion or let it proceed. This makes recovery intentional, not accidental.

After the 30 days pass and deletion is final, the user is cleanly returned to the phone number screen — a fresh start if they ever want to come back.

</vision>

<essential>
## What Must Be Nailed

- **Easy recovery** — If users regret their decision within 30 days, logging in and canceling should be straightforward
- **Complete data removal** — When deletion is final, all personal data is thoroughly wiped (photos, profile, friends)
- **Clear communication** — User always knows exactly what's happening: what gets deleted, when it happens, how to undo

</essential>

<boundaries>
## What's Out of Scope

- Partial account deactivation — no "hide my account temporarily" feature
- Admin-side deletion tools — no backend dashboard for managing user deletions
- Selective photo download — users download all or nothing, no picker

</boundaries>

<specifics>
## Specific Ideas

- Instagram-style confirmation screen explaining consequences before scheduling deletion
- 30-day grace period (industry standard)
- Single "Download All Photos" button saves everything to camera roll before deletion
- User is logged out immediately after scheduling deletion
- On login during grace period: explicit prompt to cancel or continue with deletion
- After successful final deletion: navigate back to phone number input screen
- If deletion fails (network error, etc.): preserve account, notify user to try again
- Comments/reactions on friends' posts remain but display "Deleted User" instead of username
- Push notification reminder sent a few days before final deletion

</specifics>

<notes>
## Additional Context

The phase title mentions "fallback" — this is about ensuring the delete flow is robust with proper error handling and edge cases covered. The graceful degradation approach (preserve account on failure) is key.

User emphasized the importance of not losing photos — the download option before deletion is a must-have, not a nice-to-have.

</notes>

---

_Phase: 19-delete-account-fallback_
_Context gathered: 2026-02-04_
