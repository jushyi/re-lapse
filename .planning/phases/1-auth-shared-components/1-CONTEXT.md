# Phase 1: Auth Shared Components - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<vision>
## How This Should Work

The auth screens should feel like opening a premium camera app — minimal, sleek, dark, and confident. They need to match the existing Camera/Feed/Darkroom aesthetic so it feels like one cohesive experience from the first interaction.

The current auth screens feel generic — they could be any app. The shared components should establish the Lapse identity immediately.

This is phone-based authentication with a unified flow:

- Enter phone number → Verification code → Done (existing users go to home)
- Enter phone number → Verification code → Profile setup (new users)

No passwords, no separate login/signup — just one clean flow.

</vision>

<essential>
## What Must Be Nailed

- **Dark theme foundation** — Pull exact colors, grays, blacks from existing screens
- **Typography system** — Font sizes, weights, spacing that feel cohesive
- **Basic reusable components** — Buttons, text inputs, headers that carry the Lapse look
- **Phone input style** — Large, centered, focused. The number is the hero of the screen.
- **Verification code input** — Individual boxes for each digit, must work with iOS autofill

</essential>

<boundaries>
## What's Out of Scope

- Flexible scope — build what's needed for the foundation
- Actual screen assembly happens in Phase 2/3
- Animations and transitions can be added later if needed

</boundaries>

<specifics>
## Specific Ideas

- Phone number entry: Large, centered, the focal point of the screen
- Verification code: Individual digit boxes with auto-advance, iOS autofill compatible
- Overall feel: Minimal and sleek, like a high-end camera app
- Components needed: The basics — buttons, text inputs, header style

</specifics>

<notes>
## Additional Context

The auth flow is simpler than originally scoped — phone auth only, no passwords. Phases 2 and 3 (Login and Signup refactor) may actually be a combined single phase since they're the same flow for phone auth.

The profile creation onboarding (Phase 4) follows verification for new users only.

</notes>

---

_Phase: 1-auth-shared-components_
_Context gathered: 2026-01-26_
