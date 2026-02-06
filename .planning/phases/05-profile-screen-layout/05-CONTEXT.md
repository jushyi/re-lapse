# Phase 5: Profile Screen Layout - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<vision>
## How This Should Work

The profile screen has a layered, stacked layout:

1. **Selects Banner (~1/3 of screen top)**: Photo selects rotating slideshow-style with jump cuts between photos. For now, just a placeholder — actual animation comes in Phase 6.

2. **Profile Photo**: Medium-sized (~80px) circular photo that overlaps — half sitting on the Selects banner, half on the profile info section below. Creates visual connection between sections.

3. **Profile Info Section (~1/3 of screen)**: Display name, username, and bio. Edit button (small icon) sits next to the username for quick access.

4. **Below Profile Info (stacked placeholders)**:
   - Profile song placeholder (Phase 7)
   - User albums placeholder (Phase 8)
   - Monthly albums placeholder (Phase 9)

5. **Header (like Feed header)**:
   - **Left**: Friends icon → opens Friends screen (exists)
   - **Center**: User's username in bold
   - **Right**: Settings icon → existing Settings screen

6. **Nav Bar**: Replace current profile icon with circular thumbnail of user's profile photo (Instagram-style).

**Scrolling**: Everything scrolls together as one page.

**Other Users' Profiles**: Same layout adapts when viewing someone else:

- Header: Back arrow (left), their username (center), no settings icon
- No edit button visible
- Social action buttons (Add Friend, etc.) are future phase — view-only for now

</vision>

<essential>
## What Must Be Nailed

- **Complete layout structure** — All sections (Selects, profile photo overlap, info, placeholders) positioned correctly
- **Header + navigation** — Friends/settings icons working, profile thumbnail in nav bar
- **Own vs. other profile adaptation** — Layout adjusts appropriately for self-view vs. viewing others
- **Scrollable structure** — Everything stacks and scrolls properly with placeholders ready for future phases

All equally important — the whole layout needs to come together as one cohesive screen.

</essential>

<boundaries>
## What's Out of Scope

- **Working Selects slideshow** — Just placeholder, actual rotation animation is Phase 6
- **Profile song functionality** — Just placeholder section, music integration is Phase 7
- **Album content/queries** — Just placeholder sections, album logic is Phases 8-9
- **Social action buttons** — No Add Friend/Follow buttons, view-only for other profiles (future phase)

This phase is layout scaffolding. Functionality comes in later phases.

</boundaries>

<specifics>
## Specific Ideas

- Match the app's current dark aesthetic
- Slightly rounded edges for rectangular elements
- **Use color constants from colors.js** — no hardcoded hex values
- Profile photo: medium and balanced (~80px), not too dominant
- Placeholders: bordered/shaded empty containers with labels (e.g., "Selects", "Profile Song", "Albums")
- Edit profile: small icon next to username, not a big button

</specifics>

<notes>
## Additional Context

- Friends screen already exists — just wire up navigation
- Settings screen already exists — just wire up navigation
- This is both the "Me" tab (own profile) and the screen for viewing other users' profiles
- The overlapping profile photo is key to the visual design — anchors Selects banner to info section

</notes>

---

_Phase: 05-profile-screen-layout_
_Context gathered: 2026-01-27_
