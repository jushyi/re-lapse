# Phase 5: Camera Icon Redesign - Context

**Gathered:** 2026-01-12
**Status:** Ready for planning

<vision>
## How This Should Work

The camera screen needs a layout restructure to work with the CameraView component constraint (no children support - requires absolute positioning). The screen should have a clear visual hierarchy with a bottom footer occupying the lower third of the screen.

**Layout Structure:**
- **Camera area:** Upper 2/3 of screen showing the live camera feed
- **Footer area:** Lower 1/3 with solid color bar background where most buttons live
- **Floating controls:** Flash and flip camera buttons hover above the footer at the bottom corners of the camera area

**Button Positioning:**
- **Capture button:** Center of footer (primary action)
- **Darkroom button:** Left of capture button in footer
- **Debug button:** Right of capture button in footer (temporary placement)
- **Flash button:** Bottom left corner of camera area, floating 8-12px above footer edge
- **Flip camera button:** Bottom right corner of camera area, floating 8-12px above footer edge

**Icon Style:**
Icons should match the existing UI icon style from the bottom navigation and rest of the app - clean, consistent, using the existing icon library.

</vision>

<essential>
## What Must Be Nailed

- **Layout restructure** - Absolute positioning working cleanly with proper screen dimension calculations
- **Icon visual consistency** - All camera control icons match the bottom nav design system
- **Button positioning logic** - Buttons positioned correctly relative to screen dimensions and safe areas
- **Cohesive integration** - All components working together as a unified, polished interface

This is a holistic refactor - layout, positioning, and icons all need to work together perfectly.

</essential>

<boundaries>
## What's Out of Scope

- **Gesture controls** - Not adding swipe-to-switch-camera or tap-to-focus gestures
- **Animation improvements** - No fancy transitions or animations for button interactions
- **New camera features** - No zoom, timer, grid overlays, or other new functionality
- **Advanced interactions** - This is purely layout restructure + icon redesign, no behavioral changes

</boundaries>

<specifics>
## Specific Ideas

- **Footer style:** Solid color bar with distinct separation from camera area (not transparent overlay)
- **Floating buttons:** 8-12px gap above footer edge - feels like hovering over camera view
- **Icon library:** Use existing React Native Vector Icons (or current icon library) for consistency
- **CameraView constraint:** Must use absolute positioning for all overlays since CameraView doesn't support children

</specifics>

<notes>
## Additional Context

This phase addresses a technical constraint (CameraView component limitations) while simultaneously improving the visual consistency of the camera interface. The layout refactor is as important as the icon updates.

The debug button placement is temporary - it can be repositioned or removed in future phases as needed.

Priority is creating a clean, organized camera interface that feels professional and polished while maintaining the instant camera aesthetic.

</notes>

---

*Phase: 05-camera-icon-redesign*
*Context gathered: 2026-01-12*
