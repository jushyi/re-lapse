# Phase 34: Push Infrastructure - Context

**Gathered:** 2026-02-06
**Status:** Ready for research

<vision>
## How This Should Work

Start with a full audit of the existing push notification code — understand what's there, what works, what's broken. The current setup is probably half-working, so we need the complete picture before touching anything.

The architecture should be: **Firebase backend decides when to send, Expo delivers to devices.** Firebase handles the business logic (when to trigger notifications), and Expo's push service handles the actual delivery to Apple/Google.

This phase is purely infrastructure — building the foundation that all the exciting notification features (social, photo tagging, Live Activities) will build on. Get the plumbing right so the later phases can focus on the user-facing features.

</vision>

<essential>
## What Must Be Nailed

All three are equally important for a solid foundation:

- **Rock-solid token management** — Tokens captured on signup, refreshed properly, never lost. No silent failures.
- **Clear notification triggers** — Know exactly where and when notifications should fire across the app. Clean code paths for adding triggers later.
- **Working end-to-end flow** — Trigger a push from Firebase, see it on the device. Verified manually.

</essential>

<boundaries>
## What's Out of Scope

This phase is purely infrastructure:

- Social notifications (likes, comments, follows) — Phase 35
- Photo notification events — Phase 36
- iOS Live Activities — Phase 37
- In-app notification UI polish — Phase 38
- No user-facing notification features in this phase

</boundaries>

<specifics>
## Specific Ideas

- Audit first: token reliability, delivery gaps, infrastructure health
- Firebase backend controls notification logic
- Expo Push service handles delivery to APNs/FCM
- Confidence markers: manual test works, code is clean, token lifecycle is bulletproof
- Most excited about: Live Activities on Lock Screen/Dynamic Island (Phase 37) — this foundation enables that

</specifics>

<notes>
## Additional Context

Current push code is suspected to be "probably half-working" — pieces exist but likely incomplete or not fully connected. This phase should establish a solid, audited foundation.

The real excitement is for Live Activities showing darkroom status on the Lock Screen and Dynamic Island. This infrastructure phase is the essential groundwork for that premium feature.

</notes>

---

_Phase: 34-push-infrastructure_
_Context gathered: 2026-02-06_
