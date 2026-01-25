# Phase 24: Cloud Functions Validation and Security - Research

**Researched:** 2026-01-24
**Domain:** Firebase Cloud Functions input validation, error handling, and rate limiting
**Confidence:** HIGH

<research_summary>

## Summary

Researched input validation, error handling, and rate limiting patterns for Firebase Cloud Functions. The current implementation uses 1st gen Firestore triggers which lack authentication context (no `context.auth`), limiting what can be validated at the function level. The standard approach combines Firestore Security Rules (already done in Phase 23) with defensive function coding.

Key finding: For Firestore triggers (onUpdate, onCreate), validation focuses on data shape/type checking since auth context isn't available. Rate limiting is best done at the Firestore Security Rules level for client writes, or using `firebase-functions-rate-limiter` for callable functions. Error handling should be robust with proper logging but avoid throwing in background triggers (return null instead).

**Primary recommendation:** Add Zod schemas for type validation of trigger data, implement consistent error handling with the existing logger, and consider rate limiting only if abuse patterns emerge (YAGNI for a friends-only app). Keep functions simple per Firebase's own guidance: "Simple functions are safer."

</research_summary>

<standard_stack>

## Standard Stack

The established libraries/tools for Cloud Functions validation:

### Core

| Library            | Version | Purpose             | Why Standard                              |
| ------------------ | ------- | ------------------- | ----------------------------------------- |
| zod                | ^3.22+  | Schema validation   | TypeScript-first, zero deps, excellent DX |
| firebase-functions | ^4.x    | Cloud Functions SDK | Already in use                            |
| firebase-admin     | ^11.x   | Admin SDK           | Already in use                            |

### Supporting

| Library                         | Version | Purpose                       | When to Use                          |
| ------------------------------- | ------- | ----------------------------- | ------------------------------------ |
| firebase-functions-rate-limiter | ^3.9.1  | Per-user/global rate limiting | Callable functions, abuse prevention |

### Alternatives Considered

| Instead of                      | Could Use                            | Tradeoff                                                         |
| ------------------------------- | ------------------------------------ | ---------------------------------------------------------------- |
| Zod                             | Joi, Yup                             | Zod has better TS inference, smaller bundle                      |
| firebase-functions-rate-limiter | Custom Firestore counters            | Library is battle-tested, handles concurrency                    |
| firebase-functions-rate-limiter | Firestore Security Rules rate limits | Rules better for client writes, library for function-to-function |

**Installation:**

```bash
cd functions
npm install zod
# Only if rate limiting needed:
npm install firebase-functions-rate-limiter
```

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Recommended Project Structure

```
functions/
├── src/
│   ├── index.ts              # Function exports
│   ├── logger.ts             # Existing logger utility
│   ├── validation/
│   │   └── schemas.ts        # Zod schemas for document shapes
│   └── utils/
│       └── errorHandler.ts   # Centralized error handling
```

### Pattern 1: Zod Schema Validation for Trigger Data

**What:** Define schemas for Firestore document shapes, validate before processing
**When to use:** All Firestore triggers that read document data
**Example:**

```typescript
// validation/schemas.ts
import { z } from 'zod';

// Schema for photos collection document
export const PhotoSchema = z.object({
  userId: z.string().min(1),
  imageURL: z.string().url(),
  status: z.enum(['developing', 'revealed', 'triaged']),
  capturedAt: z.any(), // Firestore Timestamp
  reactionCount: z.number().int().min(0).optional(),
  reactions: z.record(z.string(), z.record(z.string(), z.number())).optional(),
});

// Schema for friendship document
export const FriendshipSchema = z.object({
  user1Id: z.string().min(1),
  user2Id: z.string().min(1),
  status: z.enum(['pending', 'accepted']),
  requestedBy: z.string().min(1),
  createdAt: z.any(),
});

// Validation helper
export function validateOrNull<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    logger.warn('Validation failed', { errors: result.error.errors });
    return null;
  }
  return result.data;
}
```

### Pattern 2: Defensive Error Handling for Background Triggers

**What:** Wrap all trigger logic in try-catch, log errors, return null gracefully
**When to use:** All background triggers (onUpdate, onCreate, scheduled)
**Example:**

```typescript
// Pattern: Background triggers should never throw
exports.sendPhotoRevealNotification = functions.firestore
  .document('darkrooms/{userId}')
  .onUpdate(async (change, context) => {
    try {
      const userId = context.params.userId;
      const after = change.after.data();

      // Validate data shape
      if (!after || typeof after.lastRevealedAt?.toMillis !== 'function') {
        logger.warn('Invalid darkroom data', { userId });
        return null;
      }

      // ... rest of logic
    } catch (error) {
      // Log and return null - never throw in background triggers
      logger.error('sendPhotoRevealNotification failed', {
        userId: context.params.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  });
```

### Pattern 3: Guard Clauses with Early Returns

**What:** Check preconditions at the start, return early if not met
**When to use:** Every function entry point
**Example:**

```typescript
// Good: Early returns with logging
exports.sendFriendRequestNotification = functions.firestore
  .document('friendships/{friendshipId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();

    // Guard: Only process pending requests
    if (data.status !== 'pending') {
      logger.debug('Skipping non-pending friendship', { status: data.status });
      return null;
    }

    // Guard: Validate required fields
    if (!data.requestedBy || !data.user1Id || !data.user2Id) {
      logger.warn('Missing required friendship fields', {
        friendshipId: context.params.friendshipId,
      });
      return null;
    }

    // ... proceed with notification
  });
```

### Anti-Patterns to Avoid

- **Throwing errors in background triggers:** Causes retries, fills logs, doesn't help users
- **Over-validating Firestore triggers:** Data already passed Security Rules, validate defensively
- **Complex validation logic in functions:** Move complexity to Security Rules where possible
- **Rate limiting every function:** Add overhead for little benefit in trusted environments

</architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem           | Don't Build               | Use Instead                       | Why                                           |
| ----------------- | ------------------------- | --------------------------------- | --------------------------------------------- |
| Schema validation | Custom if/typeof checks   | Zod schemas                       | Type inference, consistent errors, composable |
| Rate limiting     | Custom Firestore counters | firebase-functions-rate-limiter   | Handles concurrency, atomic operations        |
| Token validation  | Manual Expo token parsing | Check prefix `ExponentPushToken[` | Already doing this correctly                  |
| Error responses   | Custom error formats      | HttpsError (for callables)        | Client SDK understands it                     |

**Key insight:** For Firestore triggers, most "validation" is already done by Security Rules. Cloud Functions should focus on business logic, not re-validating what Rules already enforce. Keep functions simple and let the database layer handle access control.

</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Throwing Errors in Background Triggers

**What goes wrong:** Function retries indefinitely, fills error logs, may cause billing spikes
**Why it happens:** Treating background triggers like HTTP endpoints
**How to avoid:** Always catch errors and return null, log at appropriate level
**Warning signs:** High retry counts in Cloud Console, repeated errors for same event

### Pitfall 2: Missing Null Checks on event.data

**What goes wrong:** TypeError: Cannot read property 'data' of undefined
**Why it happens:** In 2nd gen, event.data can be undefined; in 1st gen, similar edge cases exist
**How to avoid:** Always check `change.before.data()` and `change.after.data()` before use
**Warning signs:** Intermittent function failures, null pointer exceptions in logs

### Pitfall 3: Validating Auth Context in Firestore Triggers

**What goes wrong:** Wasted effort - auth context isn't available
**Why it happens:** Assuming triggers work like callable functions
**How to avoid:** Remember: Firestore triggers don't have context.auth. Auth validation happens in Security Rules.
**Warning signs:** Checking for undefined context.auth, writing unused validation code

### Pitfall 4: Over-Engineering Rate Limiting

**What goes wrong:** Added latency, database costs, complexity for theoretical threats
**Why it happens:** Security paranoia, enterprise patterns applied to small apps
**How to avoid:** For friends-only apps with authenticated users, trust Security Rules first. Add rate limiting only when abuse occurs.
**Warning signs:** 100ms+ added latency per function call, Firestore reads just for rate limiting

### Pitfall 5: Inconsistent Error Handling

**What goes wrong:** Some errors logged, others swallowed silently
**Why it happens:** Ad-hoc try/catch without consistent patterns
**How to avoid:** Use centralized error handler, always log with context
**Warning signs:** Debugging blind spots, missing error traces

</common_pitfalls>

<code_examples>

## Code Examples

Verified patterns for this codebase:

### Zod Schema for Photo Document

```typescript
// Source: Zod docs + project schema
import { z } from 'zod';

export const PhotoDocSchema = z.object({
  userId: z.string().min(1),
  imageURL: z.string().url(),
  capturedAt: z.any(), // Firestore Timestamp - validated by existence
  revealedAt: z.any().nullable(),
  status: z.enum(['developing', 'revealed', 'triaged']),
  photoState: z.enum(['journal', 'archive']).nullable(),
  visibility: z.literal('friends-only').optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  reactions: z.record(z.string(), z.record(z.string(), z.number().int().min(0))).optional(),
  reactionCount: z.number().int().min(0).default(0),
});

export type PhotoDoc = z.infer<typeof PhotoDocSchema>;
```

### Safe Data Extraction with Validation

```typescript
// Source: Defensive coding pattern
function getValidatedPhotoData(snapshot: FirebaseFirestore.DocumentSnapshot): PhotoDoc | null {
  const data = snapshot.data();
  if (!data) {
    logger.debug('No data in snapshot');
    return null;
  }

  const result = PhotoDocSchema.safeParse(data);
  if (!result.success) {
    logger.warn('Photo validation failed', {
      docId: snapshot.id,
      errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
    });
    return null;
  }

  return result.data;
}
```

### Consistent Error Handler

```typescript
// Source: Firebase error handling best practices
function handleTriggerError(
  functionName: string,
  error: unknown,
  context: { [key: string]: string }
): null {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error(`${functionName}: Error`, {
    ...context,
    error: errorMessage,
    stack: errorStack,
  });

  // Always return null in background triggers - never throw
  return null;
}

// Usage in trigger:
exports.myTrigger = functions.firestore.document('path/{id}').onUpdate(async (change, context) => {
  try {
    // ... function logic
  } catch (error) {
    return handleTriggerError('myTrigger', error, { id: context.params.id });
  }
});
```

### Expo Push Token Validation (Already Implemented)

```typescript
// Source: Current functions/index.js - good pattern
async function sendPushNotification(fcmToken, title, body, data = {}) {
  // Validate token format first
  if (!fcmToken || !fcmToken.startsWith('ExponentPushToken[')) {
    logger.error('sendPushNotification: Invalid Expo Push Token:', fcmToken);
    return { success: false, error: 'Invalid token format' };
  }
  // ... rest of function
}
```

</code_examples>

<sota_updates>

## State of the Art (2024-2025)

| Old Approach         | Current Approach                      | When Changed     | Impact                                               |
| -------------------- | ------------------------------------- | ---------------- | ---------------------------------------------------- |
| Gen 1 triggers       | Gen 2 triggers available              | 2023 GA          | Better concurrency, longer timeouts, Cloud Run based |
| functions.config()   | Parameterized config / Secret Manager | Deprecated 2024  | Must migrate before late 2025                        |
| Manual validation    | Zod/Valibot schemas                   | 2023+ mainstream | Type-safe, better DX                                 |
| Custom rate limiting | firebase-functions-rate-limiter       | Stable 2020+     | Handles edge cases                                   |

**New tools/patterns to consider:**

- **Gen 2 Functions:** Better for this use case (concurrency, Cloud Run), but requires migration
- **App Check:** Could add for extra client validation, but not needed for friends-only app
- **Secret Manager:** For any secrets used by functions (currently N/A)

**Deprecated/outdated:**

- **functions.config():** Will fail for new deployments after Dec 2025, migrate to params
- **Global rate limiting with counters:** Use the library instead

**Current codebase status:**

- Using Gen 1 triggers (acceptable, still supported)
- No functions.config() usage (good, no migration needed)
- Logger utility already implemented (good foundation)

</sota_updates>

<open_questions>

## Open Questions

Things that couldn't be fully resolved:

1. **Gen 2 Migration**
   - What we know: Gen 2 offers better performance and is recommended for new functions
   - What's unclear: Whether to migrate existing functions as part of this phase
   - Recommendation: Keep Gen 1 for now - validation doesn't require Gen 2 features. Migration can be separate phase.

2. **Rate Limiting Necessity**
   - What we know: firebase-functions-rate-limiter is the standard solution
   - What's unclear: Whether rate limiting is needed for a friends-only app with auth
   - Recommendation: Skip for now (YAGNI). Security Rules + auth should suffice. Add if abuse detected.

3. **Validation Granularity**
   - What we know: Zod can validate deeply nested structures
   - What's unclear: How much to validate vs trust Security Rules
   - Recommendation: Validate shape/types only, trust Rules for access control. Don't duplicate Rule logic.

</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)

- [Firebase Security Checklist](https://firebase.google.com/support/guides/security-checklist) - Official security guidelines
- [Cloud Functions Tips](https://firebase.google.com/docs/functions/tips) - Performance and design patterns
- [Extend Cloud Firestore with Cloud Functions 2nd Gen](https://firebase.google.com/docs/firestore/extend-with-functions-2nd-gen) - Trigger syntax
- [Cloud Functions Version Comparison](https://firebase.google.com/docs/functions/version-comparison) - Gen 1 vs Gen 2

### Secondary (MEDIUM confidence)

- [Zod Documentation](https://zod.dev/) - Schema validation API
- [firebase-functions-rate-limiter GitHub](https://github.com/Jblew/firebase-functions-rate-limiter) - Rate limiting library
- [Patterns for Security with Firebase](https://medium.com/firebase-developers/patterns-for-security-with-firebase-combine-rules-with-cloud-functions-for-more-flexibility-d03cdc975f50) - Doug Stevenson's patterns

### Tertiary (LOW confidence - needs validation)

- None - all findings verified against official docs

</sources>

<metadata>
## Metadata

**Research scope:**

- Core technology: Firebase Cloud Functions (Gen 1, with Gen 2 awareness)
- Ecosystem: Zod, firebase-functions-rate-limiter
- Patterns: Defensive validation, error handling, guard clauses
- Pitfalls: Background trigger errors, missing null checks, over-engineering

**Confidence breakdown:**

- Standard stack: HIGH - Zod is industry standard, rate limiter is purpose-built
- Architecture: HIGH - Patterns from Firebase official docs
- Pitfalls: HIGH - Based on official tips and real issues
- Code examples: HIGH - Adapted from current codebase and official docs

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable ecosystem)

</metadata>

---

_Phase: 24-cloud-functions-validation_
_Research completed: 2026-01-24_
_Ready for planning: yes_
