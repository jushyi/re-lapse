# UAT Issues: Phase 6 Phone Auth Implementation

**Tested:** 2026-01-19
**Source:** .planning/phases/06-phone-auth-implementation/06-01-SUMMARY.md, 06-02-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Resolved Issues

### UAT-001: Phone auth crashes app when submitting phone number ✅ RESOLVED

**Discovered:** 2026-01-19
**Phase/Plan:** 06-02
**Severity:** Blocker
**Feature:** Phone number verification (sendVerificationCode)
**Description:** When submitting a valid phone number on PhoneInputScreen, the app silently crashes (closes without error message). Logs show execution reaches `signInWithPhoneNumber` call but never completes.
**Expected:** App should navigate to VerificationScreen and send SMS code
**Actual:** App crashes immediately after calling Firebase signInWithPhoneNumber
**Repro:**
1. Open app in EAS development build
2. Navigate to PhoneInputScreen
3. Select country (US)
4. Enter valid phone number
5. Tap Continue/Submit
6. App crashes

**Root Cause Analysis:**
The GoogleService-Info.plist is missing the `REVERSED_CLIENT_ID` key which is required for reCAPTCHA fallback. Without APNs silent push configured (requires full Apple Developer setup with push notification certificates), Firebase phone auth falls back to reCAPTCHA which needs this URL scheme.

**Likely Fix:**
1. Download fresh GoogleService-Info.plist from Firebase Console that includes REVERSED_CLIENT_ID
2. Add REVERSED_CLIENT_ID as a URL scheme in app.json under `ios.scheme` or via expo-build-properties
3. Rebuild EAS development build with updated configuration
4. Alternatively: Configure APNs for silent push verification (more complex)

**Related Logs:**
```
LOG  🔍 [DEBUG] phoneAuthService.sendVerificationCode: Calling signInWithPhoneNumber {"e164": "+12406406996"}
[App crashes - no further logs]
```

**Package Warnings (may be related):**
```
WARN  The package ...\@react-native-firebase\app contains an invalid package.json configuration.
Reason: The resolution for "...\lib\internal\nativeModule" defined in "exports" is ...\dist\module\internal\nativeModule, however this file does not exist.
```

---

**Resolution:** Fixed in 06-FIX plan (2026-01-19)
- Added CLIENT_ID and REVERSED_CLIENT_ID to GoogleService-Info.plist
- Configured CFBundleURLTypes URL scheme in app.json
- Rebuilt EAS development build
- Verified phone auth works end-to-end

---

*Phase: 06-phone-auth-implementation*
*Tested: 2026-01-19*
*Resolved: 2026-01-19*
