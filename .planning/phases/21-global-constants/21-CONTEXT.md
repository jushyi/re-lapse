# Phase 21: Global Constants and Design System - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<vision>
## How This Should Work

A single source of truth for all design values in the codebase. Every hardcoded color, spacing value, font size, timing constant, and layout value gets extracted into organized constant files in `src/constants/`.

The structure should be theme-ready — even though we're not implementing dark mode or theming now, the organization should make adding themes trivial later. When a developer needs to tweak a color or adjust spacing, they know exactly where to look.

</vision>

<essential>
## What Must Be Nailed

- **Complete extraction** — No magic numbers left inline. Every hardcoded value pulled into constants.
- **Semantic naming** — Clear, purpose-based naming (`colors.text.primary` not `colors.gray900`) that's readable and self-documenting.
- **Developer experience** — Easy to find, easy to change. When someone needs a color, they know exactly where to look.

</essential>

<boundaries>
## What's Out of Scope

- No dark mode implementation — Structure supports it, but no theming logic or toggle
- No component library refactor — Just extract constants, don't restructure how components consume them
- No design system documentation — Code-level constants only, no Storybook or visual docs

</boundaries>

<specifics>
## Specific Ideas

Hybrid naming approach leaning semantic:

- **Colors**: Semantic naming (`colors.background.primary`, `colors.text.secondary`, `colors.border.default`)
- **Spacing**: Scale-based (`spacing.xs`, `spacing.sm`, `spacing.md`, `spacing.lg`, `spacing.xl`)
- **Typography**: Semantic groupings (`typography.title`, `typography.body`, `typography.caption`) combining fontSize, fontWeight, lineHeight
- **Timing**: Semantic (`timing.fast`, `timing.normal`, `timing.slow`) for animations
- **Layout**: Named constants (`layout.borderRadius.card`, `layout.headerHeight`)

</specifics>

<notes>
## Additional Context

This is part of v1.6 Code Quality milestone. The constraint is no breaking changes, no functional changes, no visual changes — everything works exactly as it does now, just with extracted constants.

</notes>

---

_Phase: 21-global-constants_
_Context gathered: 2026-01-23_
