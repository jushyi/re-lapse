# Phase 15: Background Photo Upload - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<vision>
## How This Should Work

When you tap the shutter, the camera snaps instantly — no waiting, no spinners, no "uploading..." messages. You get a quick visual flash/snapshot effect, then the captured photo shrinks from center and arcs/flies down into the darkroom icon like you're dropping a physical photo into a development tray.

The camera is immediately ready for the next shot. The upload happens completely in the background, invisible to the user. It should feel like a film camera — you take the shot, it's captured, done. The technical details of getting it to the cloud are none of the user's concern.

</vision>

<essential>
## What Must Be Nailed

- **Zero wait time** — User should never see a spinner or wait after capture. Camera is always ready for the next shot immediately.
- **The drop animation** — That satisfying thumbnail shrink-and-fly into the darkroom badge is the signature moment. It needs to feel physical and tactile.
- **Reliable sync** — Photos should never get lost. The queue must persist and retry until every photo is uploaded successfully.

</essential>

<boundaries>
## What's Out of Scope

- Offline mode — Don't need to handle being completely offline. Assume network is available.
- Upload progress UI — No sync indicators, no upload percentages, no status displays. It's invisible.
- Batch operations — Sequential uploads are fine. No need to upload multiple queued photos simultaneously.

</boundaries>

<specifics>
## Specific Ideas

- **Capture animation sequence:** Quick flash effect → photo thumbnail appears at center → shrinks and arcs/flies down to darkroom badge
- **Physics feel:** The fly animation should feel like something physical moving through space, not just a linear tween
- **Darkroom badge:** Should probably pulse or bounce when it receives the photo to acknowledge receipt

</specifics>

<notes>
## Additional Context

This phase is about making capture feel instant and delightful. The current flow likely has the user waiting for upload before they can take another photo. The new flow decouples capture from upload entirely.

The drop animation is doing double duty: it provides satisfying feedback AND communicates where the photo went (to the darkroom for developing).

</notes>

---

*Phase: 15-background-photo-upload*
*Context gathered: 2026-01-20*
