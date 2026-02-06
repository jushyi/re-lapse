# Phase 2: Login Screen Refactor - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<vision>
## How This Should Work

Clean and minimal — just phone number entry, no distractions, focused on getting the user in quickly. The login flow should feel seamless with the rest of the app, like you're already inside the Lapse experience.

Two-step flow:

1. Phone number entry screen — enter number, tap to send code
2. Code verification screen — enter the 6-digit code, get into the app

No extra options cluttering the screen. Phone auth is the only path in.

</vision>

<essential>
## What Must Be Nailed

All three are equally critical for this phase:

- **Dark theme consistency** — Must look seamless with Camera/Feed/Darkroom screens. Same colors, same feel.
- **Fast & frictionless** — Smooth transitions between phone entry and code verification, no loading friction, get in quick.
- **Professional first impression** — Login is the first thing users see. It needs to feel polished and set the tone for the rest of the app.

</essential>

<boundaries>
## What's Out of Scope

- Password/biometric login — No Face ID, Touch ID, or password options
- This is phone auth only for now
- Not changing the underlying auth mechanism, just restyling the screens

</boundaries>

<specifics>
## Specific Ideas

- Match existing app screens (Camera, Darkroom, Feed) for styling cues
- Use the dark theme components from Phase 1 (Button, Input, AuthCodeInput)
- Two distinct screens, not a single-screen flow

</specifics>

<notes>
## Additional Context

The documentation mentions email and Apple Sign-In, but the actual app uses phone auth only. This phase focuses on restyling the existing phone auth flow with the dark theme established in Phase 1.

</notes>

---

_Phase: 2-login-screen-refactor_
_Context gathered: 2026-01-26_
