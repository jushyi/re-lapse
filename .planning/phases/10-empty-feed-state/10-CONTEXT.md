# Phase 10: Empty Feed State UI Change - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<vision>
## How This Should Work

When users open their feed, the empty state should guide them toward meaningful actions rather than just showing blank space.

**New user empty state** (no friends, no photos):

- Stories bar shows an empty "story" circle with a plus icon inside
- Username label shows "Add friends"
- Tapping the circle navigates to the friends screen
- Feed area shows a mock feed card with "take your first photo" inside
- Tapping the card navigates to the camera

**Established user empty state** (has friends but no posts to show):

- Feed shows a sad react icon
- Text says "Nothing yet, tell your friends to post"
- Simple message acknowledging the user has set things up, just waiting on friends

</vision>

<essential>
## What Must Be Nailed

- Both empty state scenarios must work correctly (new user vs established user)
- "Add friends" prompt in stories bar taps to friends screen
- "Take your first photo" mock card taps to camera
- Both prompts are equally important — neither takes priority

</essential>

<boundaries>
## What's Out of Scope

- Friends screen changes — this phase just adds the prompt that links there
- Animations/transitions — keep it simple, no fancy effects when prompts appear/disappear
- Changes to camera screen or friends screen themselves

</boundaries>

<specifics>
## Specific Ideas

- Match existing story circle styling for the "Add friends" prompt
- Match existing feed card styling for the "take your first photo" prompt
- Use sad react icon (existing emoji) for the "has friends but empty" state
- Keep visual consistency with the app's dark theme

</specifics>

<notes>
## Additional Context

Two distinct empty states based on user state:

1. Completely new user → onboarding prompts to add friends + take first photo
2. Established user with friends but empty feed → encouraging message to get friends to post

The prompts should feel like natural parts of the UI, not intrusive overlays.

</notes>

---

_Phase: 10-empty-feed-state_
_Context gathered: 2026-01-29_
