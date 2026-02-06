# Phase 27: Color Constants Convention Documentation - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<vision>
## How This Should Work

Update the GSD documentation (specifically CONVENTIONS.md) so that Claude, when using GSD skills to make code changes, automatically follows color constant patterns. The goal is enforcement at the workflow level — whenever Claude makes changes, it should use colors.js constants, never hardcoded hex/rgb values.

This is about baking the Phase 16 color system into the development process itself, so it's followed consistently without manual oversight.

</vision>

<essential>
## What Must Be Nailed

- **Zero hardcoded colors** — Claude should never write hex/rgb values directly, always reference colors.js constants
- **Consistent with Phase 16** — Follow the exact patterns established during the color standardization phase

</essential>

<boundaries>
## What's Out of Scope

- No new color constants — just document existing colors.js, don't add new ones
- No code changes — documentation only, don't refactor any existing screens/components
- No theming additions — don't expand the theme system, just document what exists

</boundaries>

<specifics>
## Specific Ideas

No specific requirements — open to whatever GSD files make sense to update (CONVENTIONS.md and any relevant templates that generate code).

</specifics>

<notes>
## Additional Context

This phase builds on Phase 16's color standardization work. The goal is to ensure the color constants convention is self-perpetuating through GSD workflows rather than requiring manual enforcement.

</notes>

---

_Phase: 27-color-constants-convention_
_Context gathered: 2026-02-05_
