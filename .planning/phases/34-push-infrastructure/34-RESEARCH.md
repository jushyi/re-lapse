# Phase 34: Push Infrastructure - Research

**Researched:** 2026-02-06
**Domain:** Expo Push Notifications with Firebase Cloud Functions
**Confidence:** HIGH

<research_summary>

## Summary

Researched the Expo Push Notifications ecosystem for auditing and improving the existing push infrastructure in a React Native/Expo app with Firebase Cloud Functions backend.

The current implementation is substantially complete but has gaps in reliability patterns. The foundation uses Expo's push notification service (not direct FCM/APNs) with Firebase Cloud Functions as the backend trigger. Key finding: the codebase correctly sends via Expo Push API but lacks receipt checking, token refresh handling, and error recovery.

**Primary recommendation:** Add expo-server-sdk-node to Cloud Functions for automatic rate limiting and chunking, implement push receipt checking, and add a token refresh listener on the client. Don't hand-roll rate limiting or retry logic.
</research_summary>

<standard_stack>

## Standard Stack

### Core (Already in use)

| Library            | Version    | Purpose                           | Why Standard                             |
| ------------------ | ---------- | --------------------------------- | ---------------------------------------- |
| expo-notifications | ~0.32.16   | Client-side notification handling | Official Expo SDK for push notifications |
| expo-device        | ~8.0.10    | Device detection                  | Verify physical device for push tokens   |
| expo-constants     | (via expo) | Project ID access                 | Required for EAS push token attribution  |

### Supporting (Already in use)

| Library                          | Version | Purpose             | When to Use                                |
| -------------------------------- | ------- | ------------------- | ------------------------------------------ |
| @react-native-firebase/firestore | ~23.8.2 | Token storage       | Store Expo push tokens for Cloud Functions |
| expo-secure-store                | ~15.0.8 | Local token caching | Offline token access, logout cleanup       |

### Missing (Recommended to add)

| Library         | Version | Purpose                          | Why Standard                                        |
| --------------- | ------- | -------------------------------- | --------------------------------------------------- |
| expo-server-sdk | 3.10.0+ | Server-side Expo Push API client | Automatic rate limiting, chunking, receipt handling |

### Alternatives Considered

| Instead of      | Could Use       | Tradeoff                                                           |
| --------------- | --------------- | ------------------------------------------------------------------ |
| Expo Push API   | Direct FCM/APNs | More control but much more complexity; Expo handles the hard parts |
| expo-server-sdk | Raw fetch calls | Current approach works but misses rate limiting and receipts       |

**Installation (for Cloud Functions):**

```bash
cd functions && npm install expo-server-sdk
```

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Current Architecture (Correct)

```
Client App (Expo)
    ↓ getExpoPushTokenAsync()
Firestore (user.fcmToken)
    ↓ Cloud Function trigger
Firebase Cloud Functions
    ↓ POST to Expo Push API
Expo Push Service
    ↓ Forwards to APNs/FCM
Device receives notification
```

### Recommended Project Structure

```
functions/
├── index.js              # Cloud Function triggers (existing)
├── notifications/
│   ├── sender.js         # expo-server-sdk wrapper (NEW)
│   ├── receipts.js       # Receipt checking logic (NEW)
│   └── tokens.js         # Token validation helpers (NEW)
└── package.json          # Add expo-server-sdk dependency

src/services/firebase/
├── notificationService.js  # Client-side notification handling (existing)
└── (no changes needed)
```

### Pattern 1: expo-server-sdk for Sending

**What:** Use the official Expo SDK instead of raw fetch calls
**When to use:** All server-side notification sending
**Why:** Automatic rate limiting (600/sec), chunking, compression, proper error handling
**Example:**

```javascript
// Source: https://github.com/expo/expo-server-sdk-node
const { Expo } = require('expo-server-sdk');

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN, // Optional but recommended
});

async function sendPushNotifications(messages) {
  // Filter invalid tokens
  const validMessages = messages.filter(m => Expo.isExpoPushToken(m.to));

  // Chunk automatically (max 100 per request)
  const chunks = expo.chunkPushNotifications(validMessages);
  const tickets = [];

  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }

  return tickets;
}
```

### Pattern 2: Token Refresh Listener

**What:** Listen for token changes while app is running
**When to use:** Always - tokens can change at runtime
**Example:**

```javascript
// Source: Expo Documentation
import * as Notifications from 'expo-notifications';

useEffect(() => {
  const subscription = Notifications.addPushTokenListener(async token => {
    // Token changed - update in Firestore immediately
    await storeNotificationToken(userId, token.data);
  });
  return () => subscription.remove();
}, [userId]);
```

### Pattern 3: Push Receipt Checking

**What:** Check delivery status 15 minutes after sending
**When to use:** For critical notifications or to clean up invalid tokens
**Example:**

```javascript
// Source: Expo Documentation
async function checkReceipts(ticketIds) {
  const chunks = expo.chunkPushNotificationReceiptIds(ticketIds);

  for (const chunk of chunks) {
    const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

    for (const [id, receipt] of Object.entries(receipts)) {
      if (receipt.status === 'error') {
        if (receipt.details?.error === 'DeviceNotRegistered') {
          // Remove invalid token from database
          await removeInvalidToken(id);
        }
      }
    }
  }
}
```

### Anti-Patterns to Avoid

- **Not checking receipts:** Leads to sending to invalid tokens forever
- **Not validating tokens before send:** Wastes API calls on malformed tokens
- **No token refresh listener:** Missing token changes leads to delivery failures
- **Ignoring DeviceNotRegistered errors:** Spamming uninstalled devices
  </architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Problem          | Don't Build            | Use Instead                             | Why                                              |
| ---------------- | ---------------------- | --------------------------------------- | ------------------------------------------------ |
| Rate limiting    | Custom throttling      | expo-server-sdk                         | Handles 600/sec limit automatically with backoff |
| Chunking         | Manual array splits    | expo.chunkPushNotifications()           | Handles 100-message limit properly               |
| Token validation | Regex matching         | Expo.isExpoPushToken()                  | Official validation handles edge cases           |
| Retry logic      | Custom retry loops     | expo-server-sdk built-in                | Exponential backoff already implemented          |
| Receipt checking | Polling implementation | expo.getPushNotificationReceiptsAsync() | Proper ID management and batching                |

**Key insight:** The Expo Push API has specific rate limits and batching requirements. The expo-server-sdk exists specifically to handle these complexities. The current codebase uses raw `fetch()` which works but misses rate limiting, retry logic, and receipt checking entirely.
</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Not Checking Push Receipts

**What goes wrong:** Sending notifications to uninstalled apps indefinitely
**Why it happens:** Tickets only confirm Expo received the message, not delivery
**How to avoid:** Check receipts 15 minutes after sending, remove DeviceNotRegistered tokens
**Warning signs:** Users report not receiving notifications even with valid tokens stored

### Pitfall 2: Missing Token Refresh Listener

**What goes wrong:** Token changes on Android reinstall but Firestore has stale token
**Why it happens:** Tokens fetched only on app startup, not monitored for changes
**How to avoid:** Add `addPushTokenListener` that updates Firestore immediately
**Warning signs:** Notifications work initially but stop working after app reinstall

### Pitfall 3: Silent Android Channel Failures

**What goes wrong:** Notifications on Android have no sound or vibration
**Why it happens:** Android 8+ requires notification channels with proper importance
**How to avoid:** Create channel with `AndroidImportance.MAX`, set vibrationPattern and sound
**Warning signs:** iOS notifications work perfectly, Android notifications are silent
**Current status:** ✅ Already handled correctly in notificationService.js

### Pitfall 4: Expo Go Testing Limitation (SDK 53+)

**What goes wrong:** Push notifications don't work in Expo Go on Android
**Why it happens:** SDK 53+ dropped push notification support from Expo Go on Android
**How to avoid:** Use development builds (eas build --profile development)
**Warning signs:** Works on iOS Expo Go, fails on Android Expo Go

### Pitfall 5: No Error Recovery for Failed Sends

**What goes wrong:** Notifications silently fail if Expo API returns error
**Why it happens:** No retry logic, errors logged but not handled
**How to avoid:** Check ticket status, implement exponential backoff for retries
**Warning signs:** Sporadic notification delivery, no clear error patterns

### Pitfall 6: Rate Limit Exceeded

**What goes wrong:** `TOO_MANY_REQUESTS` errors, notifications dropped
**Why it happens:** Exceeding 600 notifications/second/project
**How to avoid:** Use expo-server-sdk which handles throttling automatically
**Warning signs:** Batch notifications during high-traffic times fail
</common_pitfalls>

<code_examples>

## Code Examples

Verified patterns from official sources:

### expo-server-sdk Setup (Cloud Functions)

```javascript
// Source: https://github.com/expo/expo-server-sdk-node
const { Expo } = require('expo-server-sdk');

// Create client with optional access token (recommended for security)
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
});

/**
 * Send notification with proper validation and chunking
 * @param {string} token - Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Deep link data
 */
async function sendNotification(token, title, body, data = {}) {
  // Validate token format
  if (!Expo.isExpoPushToken(token)) {
    console.error(`Invalid Expo push token: ${token}`);
    return { success: false, error: 'Invalid token' };
  }

  const message = {
    to: token,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high',
    channelId: 'default',
  };

  try {
    const tickets = await expo.sendPushNotificationsAsync([message]);
    return { success: true, tickets };
  } catch (error) {
    console.error('Push send error:', error);
    return { success: false, error: error.message };
  }
}
```

### Token Refresh Listener (Client)

```javascript
// Source: Expo Documentation
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export function useTokenRefresh(userId, storeToken) {
  useEffect(() => {
    if (!userId) return;

    const subscription = Notifications.addPushTokenListener(async ({ data }) => {
      // Token changed at runtime - sync to Firestore immediately
      console.log('Push token refreshed:', data.substring(0, 20) + '...');
      await storeToken(userId, data);
    });

    return () => subscription.remove();
  }, [userId, storeToken]);
}
```

### Receipt Checking (Scheduled Function)

```javascript
// Source: Expo Documentation
const { Expo } = require('expo-server-sdk');

// Store ticket IDs when sending (in-memory for simplicity, use Firestore in production)
const pendingReceipts = new Map();

/**
 * Check receipts for pending tickets (run on schedule or after delay)
 */
async function checkPendingReceipts() {
  const receiptIds = [...pendingReceipts.keys()];
  if (receiptIds.length === 0) return;

  const chunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  for (const chunk of chunks) {
    const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

    for (const [receiptId, receipt] of Object.entries(receipts)) {
      pendingReceipts.delete(receiptId);

      if (receipt.status === 'error') {
        const { error, message } = receipt.details || {};
        console.error(`Receipt error: ${error} - ${message}`);

        if (error === 'DeviceNotRegistered') {
          // Token no longer valid - remove from database
          const tokenData = pendingReceipts.get(receiptId);
          if (tokenData?.userId) {
            await removeTokenForUser(tokenData.userId);
          }
        }
      }
    }
  }
}
```

### Android Notification Channel (Already Implemented)

```javascript
// Source: notificationService.js (current implementation is correct)
if (Platform.OS === 'android') {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#000000',
  });
}
```

</code_examples>

<sota_updates>

## State of the Art (2025-2026)

| Old Approach             | Current Approach            | When Changed     | Impact                                       |
| ------------------------ | --------------------------- | ---------------- | -------------------------------------------- |
| Expo Go for push testing | Development builds required | SDK 53 (2025)    | Must use eas build for Android push testing  |
| Raw fetch to Expo API    | expo-server-sdk             | Always available | Auto rate limiting, chunking, retries        |
| One-time token fetch     | Token refresh listener      | Best practice    | Handles token changes on reinstall           |
| Fire-and-forget sends    | Receipt checking            | Best practice    | Removes invalid tokens, improves reliability |

**New tools/patterns to consider:**

- **Access Token Security:** Generate Expo access token in dashboard for enhanced security
- **Rich Notifications (iOS):** expo-notifications supports rich content, but requires additional setup
- **Notification Categories:** iOS notification actions/categories for quick replies

**Deprecated/outdated:**

- **Firebase Cloud Messaging SDK on client:** Not needed with Expo Push - use expo-notifications
- **Push testing in Expo Go (Android):** No longer supported in SDK 53+
  </sota_updates>

<codebase_audit>

## Current Implementation Audit

### What's Working Well

1. **Token management:** Dual storage (Firestore + SecureStore) is correct pattern
2. **Android channel:** Configured with MAX importance, vibration, sound
3. **Notification handler:** Foreground display configured correctly
4. **Deep linking:** Proper data extraction from notification tap
5. **Debouncing:** Reaction notifications batched with 10-second window
6. **Batch protection:** lastNotifiedAt prevents duplicate reveal notifications

### Gaps Identified

| Gap                       | Impact                            | Priority | Fix Complexity |
| ------------------------- | --------------------------------- | -------- | -------------- |
| No push receipt checking  | Silent failures, stale tokens     | HIGH     | Medium         |
| No token refresh listener | Missed token changes on reinstall | HIGH     | Low            |
| No expo-server-sdk        | No rate limiting or retry logic   | MEDIUM   | Low            |
| No access token security  | Less secure API access            | LOW      | Low            |
| Raw fetch vs SDK          | Works but suboptimal              | LOW      | Medium         |

### Files to Modify

1. **functions/index.js** - Replace raw fetch with expo-server-sdk
2. **functions/package.json** - Add expo-server-sdk dependency
3. **App.js** - Add token refresh listener
4. **NEW: functions/notifications/receipts.js** - Receipt checking scheduled function
   </codebase_audit>

<open_questions>

## Open Questions

1. **Receipt checking frequency**
   - What we know: Receipts should be checked ~15 minutes after sending
   - What's unclear: Best implementation - scheduled function vs delayed queue?
   - Recommendation: Start with scheduled Cloud Function every 15 minutes

2. **Expo access token requirement**
   - What we know: Optional but recommended for security
   - What's unclear: Required for enhanced push security feature?
   - Recommendation: Enable if Expo project has enhanced security enabled in dashboard
     </open_questions>

<sources>
## Sources

### Primary (HIGH confidence)

- [Expo Push Notifications FAQ](https://docs.expo.dev/push-notifications/faq/) - Token lifecycle, troubleshooting
- [Expo Push Notifications Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/) - Client setup
- [Expo Sending Notifications](https://docs.expo.dev/push-notifications/sending-notifications/) - Server sending patterns
- [expo-server-sdk-node GitHub](https://github.com/expo/expo-server-sdk-node) - SDK usage patterns

### Secondary (MEDIUM confidence)

- [Expo Notifications SDK Reference](https://docs.expo.dev/versions/latest/sdk/notifications/) - API reference
- [Medium: Making Expo Notifications Work](https://medium.com/@gligor99/making-expo-notifications-actually-work-even-on-android-12-and-ios-206ff632a845) - Android channel patterns

### Codebase Audit (HIGH confidence)

- `src/services/firebase/notificationService.js` - Client implementation (388 lines)
- `functions/index.js` - Cloud Functions implementation (1,342 lines)
- `App.js` - Notification setup and handlers
  </sources>

<metadata>
## Metadata

**Research scope:**

- Core technology: expo-notifications + Expo Push API
- Ecosystem: expo-server-sdk, Firebase Cloud Functions
- Patterns: Token management, receipt checking, error handling
- Pitfalls: Rate limits, stale tokens, Android channels

**Confidence breakdown:**

- Standard stack: HIGH - verified with official docs, matches codebase
- Architecture: HIGH - patterns from official sources and codebase audit
- Pitfalls: HIGH - documented in Expo FAQ and verified against codebase
- Code examples: HIGH - from Expo documentation and expo-server-sdk

**Research date:** 2026-02-06
**Valid until:** 2026-03-06 (30 days - Expo SDK stable, patterns established)
</metadata>

---

_Phase: 34-push-infrastructure_
_Research completed: 2026-02-06_
_Ready for planning: yes_
