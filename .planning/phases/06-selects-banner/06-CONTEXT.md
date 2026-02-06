# Phase 6: Selects Banner - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<vision>
## How This Should Work

The Selects banner lives in the existing container from Phase 5 at the top of the profile. It's an auto-playing slideshow that cycles through the user's selected photos with instant cuts — quick 1-2 second timing, no fancy transitions, just rapid flipping through the highlights.

**Core interactions:**

- **Hold-to-pause**: Press and hold anywhere on the banner to freeze on the current photo. Let go to resume. Works in both small banner and fullscreen.
- **Tap to expand**: Single tap opens fullscreen view. In fullscreen, tap anywhere to exit back to profile.

**Own profile vs viewing others:**

- **Own profile**: Tapping opens an edit interface — same components as the profile setup SelectsScreen. Bottom bar with thumbnail slots for reorder and add/remove, plus a "Save highlights" button underneath. This lets users update their Selects without navigating to settings.
- **Other's profile**: Tapping opens a simple fullscreen slideshow — auto-play continues, hold-to-pause works, tap anywhere to exit. View-only, no editing.

**Empty states:**

- **Own profile (no selects)**: Camera icon with "Tap to add highlights" — inviting them to set up their Selects
- **Other's profile (no selects)**: Sad icon with "This user has no highlights"

</vision>

<essential>
## What Must Be Nailed

- **Hold-to-pause interaction** — Being able to stop and look at a specific photo is key to the experience
- **Fullscreen expansion** — Tapping to see photos bigger and (on own profile) edit them
- **Auto-play smoothness** — The cycling should feel seamless, never janky or stuttering

All three aspects are equally important — they need to work together as a cohesive experience.

</essential>

<boundaries>
## What's Out of Scope

- Photo interactions (likes/comments) on the banner itself — no social features here
- Progress indicators/dots — no visual indication of which photo you're on or how many total
- Swipe-to-navigate — no manual swiping between photos (hold-to-pause is the control)

</boundaries>

<specifics>
## Specific Ideas

- Uses existing Selects container from Phase 5 — layout is already in place
- Edit mode reuses SelectsScreen components (bottom thumbnail bar, reorder capability, add/remove)
- "Save highlights" button appears below the thumbnail bar in edit mode
- Instant cut transitions (no fades, slides, or effects)
- Quick 1-2 second timing per photo

</specifics>

<notes>
## Additional Context

The Selects were set up during onboarding (Phase 4) but users haven't had a way to edit them since. This phase both displays the Selects prominently AND provides the editing pathway through the profile tap interaction.

Reusing SelectsScreen components from Phase 4 should make the edit mode implementation straightforward.

</notes>

---

_Phase: 06-selects-banner_
_Context gathered: 2026-01-28_
