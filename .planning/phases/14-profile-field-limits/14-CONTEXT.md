# Phase 14: Profile Field Character Limits - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<vision>
## How This Should Work

When users are editing their profile fields (display name, username, bio), they see a subtle character counter that appears only when the field is focused. The counter shows something like "12/24" — understated, not in your face.

The key behavior is preventing overflow. When you hit the limit, you simply can't type more. But there's a subtle shake/flash to give feedback that you've hit the wall — not annoying, just tactile feedback that the limit is there.

</vision>

<essential>
## What Must Be Nailed

- **Data integrity** - Hard stop at the limit, no truncation surprises. Users can't exceed the limit.
- **Subtle counter on focus** - "12/24" style appears when editing, disappears when done
- **Tactile feedback** - Brief shake when trying to type past limit

</essential>

<boundaries>
## What's Out of Scope

- Username format validation (lowercase, no spaces, special characters) - just length limits for now
- This is about enforcing limits, not changing validation rules

</boundaries>

<specifics>
## Specific Ideas

- Character limits: 24/24/240 (display name, username, bio)
- Counter appears on focus, hides when unfocused
- Subtle shake animation when hitting the limit (not intrusive)
- Same behavior wherever these fields are editable (onboarding, future edit profile)

</specifics>

<notes>
## Additional Context

The 24/24/240 limits replace the originally planned 16/16/160. More breathing room while still keeping things tight.

</notes>

---

_Phase: 14-profile-field-limits_
_Context gathered: 2026-02-02_
