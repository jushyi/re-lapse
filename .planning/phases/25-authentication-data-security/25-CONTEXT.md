# Phase 25: Authentication and Data Security - Context

**Gathered:** 2026-01-24
**Status:** Ready for research

<vision>
## How This Should Work

Lock down all sensitive data storage by migrating from AsyncStorage to SecureStore (iOS keychain). Currently, auth tokens and FCM push tokens sit in plain AsyncStorage — they should be protected by the device's secure enclave.

Photos should use signed URLs with 24-hour expiration instead of permanent download URLs. This way, even if a URL leaks, it stops working within a day rather than being accessible forever.

When users log out, everything gets wiped — both locally on the device (all tokens, cached data) AND remotely on the server (FCM token unregistered from Firestore so they stop receiving notifications for that device).

</vision>

<essential>
## What Must Be Nailed

- **Keychain protection** - All sensitive data (auth tokens, FCM tokens) stored in iOS keychain via expo-secure-store, not plain AsyncStorage
- **Signed photo URLs** - 24-hour expiration on all photo download URLs
- **Complete logout cleanup** - Full wipe of local device state AND remote FCM token unregistration

</essential>

<boundaries>
## What's Out of Scope

- Biometric authentication (Face ID/Touch ID unlock) - not needed for this phase
- End-to-end encryption for photos - photos are not encrypted before upload
- Session timeout / auto-logout after inactivity - users stay logged in indefinitely
- Migration UX preferences - technical approach for existing users is flexible

</boundaries>

<specifics>
## Specific Ideas

- 24-hour URL expiration balances security with caching/performance
- No strong preference on migration approach for existing users — seamless or re-login both acceptable
- FCM token cleanup on logout prevents orphaned notification registrations

</specifics>

<notes>
## Additional Context

This phase covers three distinct security improvements:

1. SecureStore migration (storage hardening)
2. Signed URLs (photo access control)
3. Secure logout (cleanup)

No additional notes.

</notes>

---

_Phase: 25-authentication-data-security_
_Context gathered: 2026-01-24_
