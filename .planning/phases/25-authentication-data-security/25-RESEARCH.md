# Phase 25: Authentication and Data Security - Research

**Researched:** 2026-01-24
**Domain:** React Native secure storage, Firebase signed URLs, FCM token lifecycle
**Confidence:** HIGH

<research_summary>

## Summary

Researched the three security domains for this phase: SecureStore migration for iOS keychain protection, Firebase signed URLs for time-limited photo access, and FCM token cleanup for secure logout.

The standard approach is to use `expo-secure-store` for all sensitive data (tokens, keys) since it encrypts data using iOS Keychain and Android Keystore. For photo URLs, Firebase Admin SDK's `getSignedUrl()` with v4 signing provides time-limited access up to 7 days maximum. For logout, the combination of `messaging().deleteToken()` plus server-side Firestore cleanup ensures complete token invalidation.

**Primary recommendation:** Migrate FCM tokens to SecureStore (auth tokens aren't explicitly stored in this codebase), implement Cloud Function for signed URL generation, and add comprehensive logout cleanup including local state wipe and Firestore FCM token removal.
</research_summary>

<standard_stack>

## Standard Stack

### Core

| Library                          | Version       | Purpose                                  | Why Standard                                 |
| -------------------------------- | ------------- | ---------------------------------------- | -------------------------------------------- |
| expo-secure-store                | ~14.0.0       | iOS Keychain/Android Keystore encryption | Only Expo SDK for device-level encryption    |
| @google-cloud/storage            | via Admin SDK | Server-side signed URL generation        | Required for getSignedUrl in Cloud Functions |
| @react-native-firebase/messaging | existing      | FCM token management                     | Already in project, provides deleteToken()   |

### Supporting

| Library        | Version  | Purpose                     | When to Use                             |
| -------------- | -------- | --------------------------- | --------------------------------------- |
| firebase-admin | existing | Cloud Functions signed URLs | Already in functions/ for notifications |

### Alternatives Considered

| Instead of                  | Could Use                      | Tradeoff                                                                 |
| --------------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| expo-secure-store           | react-native-keychain          | RN Keychain more features, but expo-secure-store better Expo integration |
| Cloud Function signed URLs  | Client-side token manipulation | Token manipulation is undocumented/hacky, not recommended                |
| Deleting Firestore fcmToken | Keeping stale tokens           | Stale tokens waste FCM quota and clutter database                        |

**Installation:**

```bash
npx expo install expo-secure-store
# Admin SDK already installed in functions/
```

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Recommended Migration Pattern

```
src/
├── services/
│   ├── secureStorageService.js   # NEW: SecureStore wrapper
│   └── firebase/
│       ├── notificationService.js  # Update to use SecureStore for token
│       └── storageService.js       # Keep as-is (signed URLs are server-side)
├── context/
│   └── AuthContext.js             # Update signOut for cleanup
functions/
└── index.js                       # Add getSignedPhotoUrl callable function
```

### Pattern 1: SecureStore Wrapper Service

**What:** Centralized service abstracting SecureStore with fallback handling
**When to use:** Any sensitive key-value storage
**Example:**

```typescript
// Source: Expo SecureStore docs + best practices
import * as SecureStore from 'expo-secure-store';

const KEYCHAIN_SERVICE = 'com.spoodsjs.oly';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainService: KEYCHAIN_SERVICE,
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
      return true;
    } catch (error) {
      // Handle 2KB limit errors gracefully
      console.error('SecureStore.setItem failed:', error);
      return false;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key, {
        keychainService: KEYCHAIN_SERVICE,
      });
    } catch (error) {
      return null;
    }
  },

  async deleteItem(key: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key, {
        keychainService: KEYCHAIN_SERVICE,
      });
      return true;
    } catch (error) {
      return false;
    }
  },
};
```

### Pattern 2: Cloud Function for Signed URLs

**What:** Server-side URL signing with configurable expiration
**When to use:** Secure photo access with time limits
**Example:**

```typescript
// Source: Firebase Admin SDK + Google Cloud Storage docs
import { onCall } from 'firebase-functions/v2/https';
import { getStorage } from 'firebase-admin/storage';

export const getSignedPhotoUrl = onCall(async request => {
  const { photoPath } = request.data;
  const userId = request.auth?.uid;

  if (!userId) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const bucket = getStorage().bucket();
  const file = bucket.file(photoPath);

  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  return { url };
});
```

### Pattern 3: Comprehensive Logout Cleanup

**What:** Multi-step cleanup covering local + remote state
**When to use:** User logout flow
**Example:**

```typescript
// Source: RN Firebase docs + FCM best practices
const signOut = async () => {
  const userId = auth.currentUser?.uid;

  // 1. Clear FCM token from Firestore FIRST (while still authenticated)
  if (userId) {
    await updateDoc(doc(db, 'users', userId), { fcmToken: null });
  }

  // 2. Delete local FCM token (stops receiving notifications)
  await messaging().deleteToken();

  // 3. Clear SecureStore items
  await secureStorage.deleteItem('fcmToken');

  // 4. Clear AsyncStorage (non-sensitive cached data)
  await AsyncStorage.clear();

  // 5. Sign out from Firebase Auth
  await auth.signOut();
};
```

### Anti-Patterns to Avoid

- **Storing tokens in AsyncStorage:** Unencrypted, accessible to anyone with device access
- **Using permanent download URLs for sensitive photos:** URLs never expire, can be shared indefinitely
- **Skipping Firestore FCM cleanup on logout:** Device continues receiving notifications after logout
- **Storing large data in SecureStore:** 2KB limit; use for tokens only, not large payloads
  </architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Problem                      | Don't Build                    | Use Instead                  | Why                                                                       |
| ---------------------------- | ------------------------------ | ---------------------------- | ------------------------------------------------------------------------- |
| Encryption for local storage | Custom encryption library      | expo-secure-store            | iOS Keychain uses hardware security module, impossible to replicate in JS |
| Signed URL generation        | Client-side token manipulation | Firebase Admin getSignedUrl  | Token manipulation is undocumented, breaks with SDK updates               |
| Token expiration logic       | Custom expiry checking         | getSignedUrl expires option  | V4 signatures handle expiry cryptographically                             |
| Keychain access levels       | Custom unlock detection        | keychainAccessible constants | iOS provides these natively, no need to reinvent                          |

**Key insight:** Both iOS Keychain and Firebase signed URLs use cryptographic primitives that cannot be replicated in JavaScript. The platform/server must handle these operations.
</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: SecureStore 2KB Limit

**What goes wrong:** Large JWT tokens or JSON objects fail to store
**Why it happens:** iOS Keychain historically limited to ~2048 bytes per item
**How to avoid:** Only store tokens/keys; for larger data, encrypt and use AsyncStorage
**Warning signs:** "Provided value to SecureStore is larger than 2048 bytes" error

### Pitfall 2: Signed URL Maximum 7-Day Expiration

**What goes wrong:** Setting expiration beyond 7 days silently fails, URL expires anyway
**Why it happens:** V4 signing spec enforces maximum 7-day validity
**How to avoid:** Use 24 hours as recommended; for longer access, regenerate URLs on demand
**Warning signs:** URLs stopping work after exactly 7 days regardless of expires setting

### Pitfall 3: iOS deleteToken() Returns Same Token

**What goes wrong:** After deleteToken(), calling getToken() returns the same value on iOS
**Why it happens:** Known iOS issue with FCM token caching
**How to avoid:** Don't rely on new token generation; focus on server-side token removal from Firestore
**Warning signs:** Same token appearing after logout/login cycle on iOS

### Pitfall 4: SignatureDoesNotMatch Error in Cloud Functions

**What goes wrong:** getSignedUrl() works initially, then fails with 403 after days
**Why it happens:** Default Cloud Functions credentials may have issues with long-term signing
**How to avoid:** Use 24-hour expiration; if issues persist, consider service account key
**Warning signs:** 403 errors appearing 7+ days after URL generation

### Pitfall 5: Logout Without FCM Cleanup

**What goes wrong:** Device receives notifications for logged-out user
**Why it happens:** FCM token still registered in Firestore for that device
**How to avoid:** Clear Firestore fcmToken field BEFORE calling auth.signOut()
**Warning signs:** Notifications arriving on device after logout
</common_pitfalls>

<code_examples>

## Code Examples

Verified patterns from official sources:

### SecureStore Basic Operations

```javascript
// Source: https://docs.expo.dev/versions/latest/sdk/securestore/
import * as SecureStore from 'expo-secure-store';

// Store value
await SecureStore.setItemAsync('fcmToken', token, {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
});

// Retrieve value
const token = await SecureStore.getItemAsync('fcmToken');

// Delete value
await SecureStore.deleteItemAsync('fcmToken');
```

### Firebase Admin Signed URL Generation

```javascript
// Source: Firebase Admin SDK docs
const admin = require('firebase-admin');

const bucket = admin.storage().bucket();
const file = bucket.file('photos/abc123.jpg');

const [url] = await file.getSignedUrl({
  version: 'v4',
  action: 'read',
  expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
});

return url;
```

### FCM Token Cleanup on Logout

```javascript
// Source: https://firebase.google.com/docs/cloud-messaging/manage-tokens
import messaging from '@react-native-firebase/messaging';

// Delete the device token (stops receiving messages)
await messaging().deleteToken();

// Also clean up from server
// Note: Must happen BEFORE auth.signOut() to maintain write permission
await updateDoc(doc(db, 'users', userId), {
  fcmToken: null,
  updatedAt: serverTimestamp(),
});
```

</code_examples>

<sota_updates>

## State of the Art (2024-2025)

| Old Approach              | Current Approach                                        | When Changed           | Impact                                       |
| ------------------------- | ------------------------------------------------------- | ---------------------- | -------------------------------------------- |
| AsyncStorage for all data | SecureStore for sensitive, AsyncStorage for preferences | Always recommended     | Security-sensitive apps must use SecureStore |
| Firebase download tokens  | getSignedUrl with v4                                    | v4 is current standard | More control over expiration                 |
| Manual token tracking     | Firebase best practices documentation                   | 2024 update            | Clear guidance on token lifecycle            |

**New tools/patterns to consider:**

- **expo-secure-store sync methods:** New `setItem`/`getItem` (blocking) for simpler code where async isn't needed
- **V4 signing:** Current standard, max 7-day expiration, preferred over v2

**Deprecated/outdated:**

- **ALWAYS keychainAccessible constant:** Deprecated; use AFTER_FIRST_UNLOCK instead
- **V2 signed URLs:** Still work but v4 is recommended
- **Storing download tokens:** Undocumented/unsupported approach
  </sota_updates>

<open_questions>

## Open Questions

Things that couldn't be fully resolved:

1. **Migration strategy for existing AsyncStorage data**
   - What we know: expo-secure-store and AsyncStorage are separate; no automatic migration
   - What's unclear: Whether existing upload queue data needs migration (it's non-sensitive)
   - Recommendation: Only migrate FCM token storage; leave upload queue in AsyncStorage (queue items are transient)

2. **Signed URL approach for existing imageURL fields**
   - What we know: Current photos have permanent download URLs stored in Firestore
   - What's unclear: Whether to regenerate URLs on-demand or update all existing photos
   - Recommendation: Implement on-demand signing; existing URLs continue working (security rules still apply)

3. **iOS FCM token deletion behavior**
   - What we know: Known issue where iOS returns same token after deleteToken()
   - What's unclear: Whether this is fixed in latest RN Firebase
   - Recommendation: Focus on server-side cleanup; don't rely on token regeneration
     </open_questions>

<sources>
## Sources

### Primary (HIGH confidence)

- [Expo SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/) - API reference, keychainAccessible constants, size limits
- [Firebase Cloud Messaging Token Management](https://firebase.google.com/docs/cloud-messaging/manage-tokens) - Best practices for token lifecycle
- [Expo Store Data Guide](https://docs.expo.dev/develop/user-interface/store-data/) - When to use SecureStore vs AsyncStorage

### Secondary (MEDIUM confidence)

- [Firebase Storage Signed URLs Guide](https://www.sentinelstand.com/article/guide-to-firebase-storage-download-urls-tokens) - Verified patterns for signed URL generation
- [React Native Security Guide](https://reactnative.dev/docs/security) - General security best practices
- [LogRocket SecureStore Tutorial](https://blog.logrocket.com/encrypted-local-storage-in-react-native/) - Migration patterns

### Tertiary (LOW confidence - needs validation)

- GitHub issues on iOS deleteToken() behavior - May be outdated with latest SDK
  </sources>

<metadata>
## Metadata

**Research scope:**

- Core technology: expo-secure-store, Firebase Admin SDK, @react-native-firebase/messaging
- Ecosystem: Expo SDK 52, Firebase Admin, React Native Firebase
- Patterns: Secure storage migration, signed URL generation, logout cleanup
- Pitfalls: Size limits, expiration limits, token lifecycle

**Confidence breakdown:**

- Standard stack: HIGH - Official Expo/Firebase documentation
- Architecture: HIGH - Verified patterns from official sources
- Pitfalls: HIGH - Documented in GitHub issues and official docs
- Code examples: HIGH - From official documentation

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable ecosystem)
</metadata>

---

_Phase: 25-authentication-data-security_
_Research completed: 2026-01-24_
_Ready for planning: yes_
