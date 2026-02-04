# Phase 21: Remove/Block Friends - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<vision>
## How This Should Work

Users can manage their relationships through a three-dot menu that appears in two places:

1. **Friend cards** - Button on the right side of each friend card in the friends list
2. **Profile header** - Top-right corner when viewing someone else's profile

Both menus offer the same options: Remove Friend, Block User, Report User.

### Remove Friend

Tapping "Remove Friend" shows a simple confirmation dialog ("Remove [name]?"). Confirming removes the friendship - they can send a new request later if they want to reconnect. Their existing comments and reactions on your photos stay visible. They don't receive any notification.

### Block User

Blocking makes you completely invisible to that person. They can't see your profile (search returns nothing, direct links show "user not found"), they can't send you friend requests, and their comments/reactions on your photos are removed.

**Key behavior:** Block and remove are independent actions. You can block a friend without removing them - they'd still be in your friends list (appearing normal, no indicator), but they can't see you. Unblocking someone who was your friend restores the friendship automatically.

When YOU view a blocked person's profile, you see it normally - just with an "Unblock" option instead of friend actions. To unblock someone, you search for them and access their profile.

### Report User

Tapping "Report User" opens a full-screen reason picker with options: Spam, Harassment, Inappropriate content, Impersonation, Other. When a reason is selected, a details text field expands inline (optional). Submit button appears below the field. After submitting, a toast confirms "Report submitted" and user returns to the profile.

Reports are reviewed manually in Firebase Console. Each report stores: reporter ID, reported user ID, reason, details, timestamp, and a snapshot of the reported user's profile at time of report.

</vision>

<essential>
## What Must Be Nailed

- **Clean remove flow** - Simple confirmation dialog, silent action, no awkward feedback to the other person
- **True invisibility for block** - Blocked users must have zero way to see or interact with you
- **Independent block/remove** - Can block without removing, unblock restores friendship if it existed
- **Reliable report submission** - Reports must capture enough context for meaningful review

</essential>

<boundaries>
## What's Out of Scope

- No blocked users list in settings - users search for blocked profiles to manage them
- No in-app admin UI for reports - review in Firebase Console directly
- No notifications to the other person for any action (remove/block/report)

</boundaries>

<specifics>
## Specific Ideas

- Three-dot menu icon (consistent with profile menu pattern)
- Standard confirmation dialogs - no explanation text needed, just "[Action] [name]?"
- Report reason picker: inline text field expansion when reason selected
- X button AND back gesture both work to cancel report (no discard confirmation)
- Content from mutual friends showing blocked person still visible (block only affects direct interaction)

</specifics>

<notes>
## Additional Context

- Blocking a friend removes their comments/reactions from your photos, but unfriending alone keeps them
- Extended report data includes profile snapshot for evidence if user changes profile later
- Keep the UX minimal and clean - matches app's dark theme aesthetic

</notes>

---

_Phase: 21-remove-block-friends_
_Context gathered: 2026-02-04_
