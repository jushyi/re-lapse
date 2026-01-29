# Phase 8: User Albums Display - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<vision>
## How This Should Work

Users create personal photo albums that appear as a horizontal bar on their profile. The vibe is Pinterest board style — large, prominent square cards with the cover photo taking center stage. The title sits centered below each card.

When you tap an album, it opens a full-screen 3-column grid showing all the photos. Tap a photo to view it full-screen with swipe or tap navigation. Everything feels visual and photo-forward.

Albums are friends-only. If someone isn't your friend, they don't see your albums at all — the section simply doesn't appear for them.

Creating albums should be effortless. Two paths: tap the plus card in the album bar, or tap "Add to album" from any photo's 3-dot menu. Name the album first, then pick photos from your library. The picker shows all your photos (archived + journaled) with checkmarks on ones already added.

</vision>

<essential>
## What Must Be Nailed

- **Visual polish on album cards** — Large (140-160px) square covers with Pinterest board aesthetic. Title centered below, wraps to two lines if needed.
- **Easy creation flow** — Name first, then multi-select photos. Multiple entry points (album bar + photo menus) make it feel natural.
- **Smooth browsing** — Full-screen grid, swipe/tap through photos, clear position indicator (3 of 12), quick access to cover/remove actions.

</essential>

<boundaries>
## What's Out of Scope

- **Sharing albums publicly** — Albums are personal, friends-only visibility
- **Collaborative albums** — No inviting others to add photos to your album
- Users can only add their own photos to albums (not friends' photos)

</boundaries>

<specifics>
## Specific Ideas

**Album bar:**

- "Albums" section header label
- Large square cards (140-160px) with cover photo
- Title centered below, wraps to two lines max
- Album name: 24 characters max, required
- Add button: same size square with plus icon, dashed border pattern
- Albums ordered by recently updated (most active first)
- Uses existing placeholder position on profile

**Album creation:**

- Two entry points: plus button in bar, "Add to album" from photo 3-dot menu
- Flow: Name first → then select photos
- Must have at least 1 photo to create
- Multi-select from grid of all user's photos (archived + journaled)
- Photos already in album show checkmark, disabled (can't re-add)

**Album grid view:**

- Full-screen with back button/gesture to exit
- 3-column grid layout
- Header: album name + photo count + 3-dot menu + back
- Grid 3-dot menu: Rename (inline edit), Change cover, Delete album, Select mode
- Add photos: button at end of grid + floating button at bottom

**Full-screen photo view:**

- Swipe or tap to navigate between photos
- Header: album name + position (3 of 12)
- 3-dot menu: Remove from album, Set as cover
- Remove always shows confirmation

**Photo management:**

- Long-press album card: Edit cover, Rename, Delete
- Long-press photo in grid: Set as cover option
- Select mode: bulk remove photos
- Photos can be in multiple albums
- Photos ordered newest first within albums
- Removing last photo: warning that this deletes album
- Delete album: simple confirm, photos stay in app (just grouping removed)

**Viewing friend's albums:**

- Same grid view, no edit options (view only)
- No 3-dot menu, no add button

**Empty state:**

- Prompt text with add button (e.g., "Create your first album")

**No limits:**

- Unlimited albums, unlimited photos per album

</specifics>

<notes>
## Additional Context

The album feature is friends-only for privacy. Non-friends viewing a profile won't see the albums section at all.

Album picker shows "Add to album" option that opens existing albums list + "Create new album" option.

Cover photo must be from photos in that album (selected via long-press in grid view or from menu).

</notes>

---

_Phase: 08-user-albums_
_Context gathered: 2026-01-29_
