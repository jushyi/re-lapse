# Phase 32: Photo Issues Fix - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<vision>
## How This Should Work

Two separate, unrelated fixes that both need to feel polished and consistent with the app's dark aesthetic.

**Photo Capture (ISS-001):**
Photos taken in-app should match the screen's aspect ratio. When viewing photos in full-screen modes (stories, albums), they should fill the screen completely without any cropping or black bars. The experience should be seamless — the camera viewfinder already shows exactly what will be captured, so there are no surprises when viewing later.

**Profile Photo Crop (ISS-011):**
When selecting a profile photo, users get a proper crop UI. The full photo is visible with a circle overlay highlighting the selected area, and the area outside the circle is dimmed. Users can pinch to zoom and drag to position. The circle preview shows exactly what their profile picture will look like. Explicit Confirm and Cancel buttons let users commit when they're happy with the crop.

</vision>

<essential>
## What Must Be Nailed

- **Visual consistency** — Both fixes must maintain the app's dark aesthetic and feel polished
- **Seamless capture** — Viewfinder shows exactly what gets captured, no surprises in full-screen views
- **Circle preview accuracy** — Profile crop shows exactly what the actual profile picture will look like

</essential>

<boundaries>
## What's Out of Scope

- No photo editing features (filters, adjustments, effects)
- Only affects new photos — existing photos in the app remain unchanged
- Keep current behavior for photo source (don't change where profile photos come from)

</boundaries>

<specifics>
## Specific Ideas

**Profile Crop UI:**

- Full photo visible with circle overlay, dimmed areas outside
- Confirm/Cancel buttons (explicit commit, not auto-save)
- Always show crop UI — both when first setting and when changing profile photo
- Background style matches current screens in the app
- Reasonable zoom limits: minimum shows full photo in circle, maximum prevents pixelation
- Crisp, direct gesture response — photo moves exactly with finger, no bouncy animations

**Photo Capture:**

- Viewfinder shows what will be captured (seamless experience)
- Photos taken at screen aspect ratio for full-screen display

</specifics>

<notes>
## Additional Context

These are two completely separate issues:

- ISS-001 is only for photos taken in the app
- ISS-011 is only for profile pictures

Both were deferred from earlier work and scheduled for this phase.

</notes>

---

_Phase: 32-photo-issues-fix_
_Context gathered: 2026-02-06_
