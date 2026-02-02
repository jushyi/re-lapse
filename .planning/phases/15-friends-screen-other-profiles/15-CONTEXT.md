# Phase 15: Friends Screen & Other Profiles - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<vision>
## How This Should Work

Three distinct implementations in this phase:

**1. Friends Screen UI Refresh**
The current friends screen is outdated and needs a fresh design. Card layout similar to the comments section — profile photo on the left, display name and username next to it, with a contextual action button on the right. The button changes based on relationship:

- "Add Friend" for non-friends
- "Accept" / "Deny" buttons for incoming requests
- "Cancel" button for outgoing pending requests

Two-tab structure: **Requests** | **Friends**

- Requests tab shows both incoming and outgoing requests in sections
- Friends tab shows your friends list
- Both tabs have search bars — Friends tab to filter existing friends, Requests tab to look up users to add

**2. View Other Profiles**
Tapping anyone's avatar anywhere in the app (story cards, comments, reactions, friend cards) opens their full profile. Universal, consistent navigation.

**3. Conditional Profile Display**
When viewing someone else's profile:

- **Friends:** See everything — selects, albums, monthly albums, profile song, bio
- **Non-friends:** See profile photo, display name, username, bio, selects, and profile song — but NO albums (user-made or monthly). No access to journaled/archived photos until friendship.

Where the albums section would normally appear for non-friends: a prominent "Add Friend" button. Clear call-to-action that also signals the content is locked.

</vision>

<essential>
## What Must Be Nailed

All three parts are equally critical:

- **Friends screen UX** — The card layout and interaction buttons feeling natural and consistent
- **Profile access control** — Friends vs non-friends visibility working correctly throughout
- **Navigation flow** — Smooth, universal access to profiles from anywhere avatars appear

</essential>

<boundaries>
## What's Out of Scope

- **Friend suggestions/discovery** — No "people you may know", no contact sync, no recommendation algorithms
- **Friend request notifications** — Just the list/buttons, not notification system changes
- **Blocking/privacy settings** — No block feature or granular privacy controls in this phase

Search in Requests tab is for manually looking up usernames, not auto-suggesting from contacts.

</boundaries>

<specifics>
## Specific Ideas

- **Non-friend profile indicator:** Prominent Add Friend button in the albums area — serves as both CTA and visual signal that content is locked
- **Card style:** Similar to comments section layout — avatar left, names middle, action button right
- **Tab structure:** Requests | Friends tabs to keep things organized and clean
- **Search bars:** Both tabs have search — filter friends in Friends tab, look up users in Requests tab

</specifics>

<notes>
## Additional Context

The friends screen needs to feel "fresh" — not necessarily matching the existing profile dark theme or feed style, but a new design that works well for this list/card context.

Priority is on all three implementations being solid. The profile viewing experience with proper friend/non-friend distinction is core to how the app will feel socially.

</notes>

---

_Phase: 15-friends-screen-other-profiles_
_Context gathered: 2026-02-02_
