# Phase 42: Mutual Friends Suggestions - Context

**Gathered:** 2026-02-09
**Status:** Ready for planning

<vision>
## How This Should Work

The existing "People you may know" section on the Friends screen gets a new subsection for mutual friend suggestions. Currently the section shows contact-based suggestions — mutual friend suggestions should appear as a separate, distinct group alongside those.

Each suggestion card shows the person's info plus a simple "X mutual friends" count as the subtitle. No need to show the actual names of mutual friends — just the count keeps it clean.

The two subsections (contact-based and mutual friends-based) should feel like a natural part of the same screen — not bolted on, but native to the existing Friends screen design.

</vision>

<essential>
## What Must Be Nailed

- **Accurate, relevant suggestions** — The algorithm needs to surface genuinely relevant people based on mutual connections, quality over quantity
- **Seamless integration** — Must feel native to the existing Friends screen and "People you may know" section, not like an afterthought
- **Mutual friend count display** — Clean subtitle showing "X mutual friends" on each suggestion card

</essential>

<boundaries>
## What's Out of Scope

- Not sending notifications to users that they've been suggested to someone
- No complex recommendation algorithms beyond mutual connections
- No "suggested for you" push notifications

</boundaries>

<specifics>
## Specific Ideas

- Separate subsections within "People you may know": one for contact-based suggestions, one for mutual friend-based suggestions
- Mutual friend count shown as subtitle text (e.g., "3 mutual friends")
- Builds on the existing Friends screen and suggestion UI patterns

</specifics>

<notes>
## Additional Context

This is the final phase of v1.7 Engagement & Polish. The Friends screen already has a "People you may know" section from Phase 20 (Friend Suggestions via Contacts Sync). This phase extends that with a second source of suggestions based on mutual connections.

</notes>

---

_Phase: 42-mutual-friends-suggestions_
_Context gathered: 2026-02-09_
