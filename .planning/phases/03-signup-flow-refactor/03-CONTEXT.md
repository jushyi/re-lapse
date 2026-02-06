# Phase 3: Signup Flow Refactor - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<vision>
## How This Should Work

Phone-based signup with a clean three-step progression: phone verification, profile setup, then Selects picking.

The phone verification step uses the existing AuthCodeInput pattern. Once verified, users move to the profile setup screen where they fill in their info (username, display name, bio, profile photo) AND select their profile song — all in one grouped screen rather than multiple steps.

After profile setup, the final step is Selects — users pick their highlighted photos on a dedicated screen.

The whole flow should feel natural and friction-free. Each step flows into the next without confusion.

</vision>

<essential>
## What Must Be Nailed

- **Smooth progression** - Each step feels natural, no friction or confusion between screens
- **Consistency** - Match the existing Login/Verification screens for a cohesive auth experience
- **Profile + Song together** - Song selection is part of the profile setup, not a separate step

</essential>

<boundaries>
## What's Out of Scope

- No specific exclusions — build what the signup flow needs
- Selects picking is the final step of signup (dedicated screen)

</boundaries>

<specifics>
## Specific Ideas

- Match the dark theme and styling of the existing Login/Verification screens
- Three-step flow: Phone → Profile (with song) → Selects
- Profile setup groups: username, display name, bio, profile photo, profile song

</specifics>

<notes>
## Additional Context

This is phone auth only — no email/password credentials to manage. The flow is simpler than traditional signup.

Song selection was originally planned for Phase 7, but user wants it integrated into the profile setup screen during signup.

</notes>

---

_Phase: 03-signup-flow-refactor_
_Context gathered: 2026-01-26_
