# Phase 20: Debug Cleanup - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<vision>
## How This Should Work

The app should be silent in production - zero console noise. In development, logging should be minimal and focused: only errors, warnings, key user actions (photo captures, friend requests, auth events), and Firebase operations. No verbose debugging spam cluttering the console.

The logger utility should be simple to use with straightforward function calls like `logger.error()` and `logger.warn()`. Logs should show where they came from with prefixes like `[PhotoService] Upload complete` so it's easy to trace issues.

When replacing existing console.\* statements, don't just port them over - delete the unnecessary debug logs that were only useful during initial development. Only keep logs that add real value.

</vision>

<essential>
## What Must Be Nailed

- **Zero console noise in production** - Absolutely nothing logged to console in production builds
- **Easy to use logger API** - Simple drop-in replacement that developers actually want to use
- **Complete cleanup** - No raw console.\* statements left anywhere in the codebase

</essential>

<boundaries>
## What's Out of Scope

- No remote logging/crash reporting (Sentry, Crashlytics, external services) - just local console control
- Not adding comprehensive logging coverage - only replacing what exists
- No analytics integration or user behavior tracking in the logger

</boundaries>

<specifics>
## Specific Ideas

- Simple function calls: `logger.error('message')`, `logger.warn('message')`, `logger.info('message')`
- Prefix logs with component/service name: `[PhotoService] Upload complete`, `[AuthContext] Sign in successful`
- Use React Native's `__DEV__` flag to toggle logging behavior
- Log types to keep in dev: errors, warnings, key user actions, Firebase operations
- Delete unnecessary debug logs rather than converting them

</specifics>

<notes>
## Additional Context

This is part of the v1.6 Code Quality milestone. Phase 19 (Linting and Prettier Setup) is complete, so the codebase is already formatted consistently. This phase focuses purely on debug statement cleanup with environment-aware logging.

The CLAUDE.md already documents comprehensive logging guidelines and mentions a logger utility at `src/utils/logger.js` - this phase will ensure consistent usage throughout the codebase.

</notes>

---

_Phase: 20-debug-cleanup_
_Context gathered: 2026-01-23_
