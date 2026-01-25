# Phase 28: Code Refactoring - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<vision>
## How This Should Work

When you open a screen file, you should immediately understand what it renders — not wade through 500 lines of state, refs, effects, and StyleSheet definitions first. The goal is clean separation of concerns:

```
src/
├── hooks/          → Logic (useCamera, useDarkroom, useSwipeableCard)
├── styles/         → StyleSheets (CameraScreen.styles.js, etc.)
└── screens/        → Thin components (just JSX + hook calls + style imports)
```

Screens and components become thin render layers. You open CameraScreen.js and it's mostly JSX with a few hook calls at the top — obvious at a glance what it does.

</vision>

<essential>
## What Must Be Nailed

- **Obvious at a glance** — Open any screen file and immediately understand what it renders
- **Consistent treatment** — All screens AND complex components get the same refactoring pattern (not just the big three)
- **Three-way separation** — Logic in hooks, styles in src/styles/, components as thin render layers

</essential>

<boundaries>
## What's Out of Scope

- No behavior changes — pure refactor, everything works exactly as it does now
- No new hooks library — use standard React patterns, no new dependencies
- No changes to src/constants/ — design tokens already exist there, style files just import from them

</boundaries>

<specifics>
## Specific Ideas

- **Hook naming**: Feature-based names like `useCamera`, `useDarkroom`, `useSwipeableCard`
- **Hook granularity**: Multiple focused hooks per feature (e.g., `useCameraState`, `useCameraCapture`, `useCameraPermissions`) — each hook owns one concern
- **Hook location**: All hooks in `src/hooks/` — consistent with existing `useFeedPhotos.js` pattern
- **Style naming**: `CameraScreen.styles.js`, `DarkroomScreen.styles.js`, etc.
- **Style location**: All styles in `src/styles/` folder
- **Scope**: Applies to screens (CameraScreen, DarkroomScreen) AND complex components (SwipeablePhotoCard, FeedPhotoCard, PhotoDetailModal)

</specifics>

<notes>
## Additional Context

The design system constants already exist in `src/constants/` from Phase 21. Style files will import colors, spacing, typography from there — no need for a separate common styles file.

Priority is readability and consistency. When the refactor is done, every screen and complex component should follow the same pattern: thin JSX that imports hooks for logic and styles for presentation.

</notes>

---

_Phase: 28-code-refactoring_
_Context gathered: 2026-01-25_
