# Phase 23: Firestore Security Rules Audit - Context

**Gathered:** 2026-01-24
**Status:** Ready for research

<vision>
## How This Should Work

Security rules should balance protection with usability — secure but pragmatic. The app needs to protect sensitive data while keeping the feed and social features smooth. Users should feel safe knowing their private data stays private, friends-only content stays friends-only, and nobody can pretend to be someone else.

The rules should be tight enough to prevent abuse but not so restrictive that legitimate features break or become slow.

</vision>

<essential>
## What Must Be Nailed

- **User privacy** - Photos only visible to friends, user data only accessible by owner
- **Data integrity** - Prevent users from modifying others' data, reactions, friendships
- **Abuse prevention** - Stop spam, fake accounts, or malicious bulk operations
- **Self-reaction prevention** - Users cannot react to their own photos (business logic at DB level)

</essential>

<boundaries>
## What's Out of Scope

- Rate limiting implementation - Just audit rules, don't implement Firebase App Check or custom rate limiting
- Backend/Cloud Functions changes - Rules only, unless something security-critical surfaces
- Admin/moderation panel or tools
- Changing what's already working - audit and harden, not redesign

</boundaries>

<specifics>
## Specific Ideas

**Photo collection:**

- Friend-only photo access - photos with visibility 'friends-only' truly only accessible by friends
- Owner controls lifecycle (status, photoState, delete)
- Authenticated users can add reactions to friends' photos only
- Users cannot react to their own photos

**Reactions:**

- Reaction authenticity - users can only react as themselves, can't spoof other users' reactions

**Users collection:**

- Profile data protection - users can only read/write their own profile
- Username uniqueness already handled at app layer - no changes needed

**Friendships collection:**

- Pending requests: requester can cancel, recipient can accept/decline
- Accepted friendships: either party can unfriend
- Both parties can read their own friendships

**Darkroom collection:**

- Keep current pattern, just audit for obvious holes

**Notifications collection:**

- Created by Cloud Functions only
- Users can only read/mark-read their own notifications

**Collections to audit:**

- users
- photos
- darkrooms
- friendships
- notifications

</specifics>

<notes>
## Additional Context

This is a security-focused audit phase. The goal is to harden existing rules, not redesign the data model. Any critical vulnerabilities found during research may require addressing even if technically "out of scope."

The friend-only photo access is the most complex rule to get right — it requires checking the friendships collection to verify the reader is actually a friend of the photo owner.

</notes>

---

_Phase: 23-firestore-security-rules-audit_
_Context gathered: 2026-01-24_
