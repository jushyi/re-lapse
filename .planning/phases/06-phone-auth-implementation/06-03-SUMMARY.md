# Plan 06-03 Summary: AuthContext Phone Auth Integration

## Objective Achieved
Integrated phone authentication into AuthContext and navigation, enabling complete phone auth flow from PhoneInput → Verification → ProfileSetup (new users) or MainTabs (existing users).

## What Was Built

### 1. AuthContext Native Firestore Integration
**File:** `src/context/AuthContext.js`

Added React Native Firebase Firestore functions to share auth state with RN Firebase Auth:

```javascript
// Native Firestore operations that share auth state with RN Firebase Auth
const createUserDocumentNative = async (userId, userData) => { ... }
const getUserDocumentNative = async (userId) => { ... }
const updateUserDocumentNative = async (userId, updateData) => { ... }
```

**Key changes:**
- Auth state listener already used RN Firebase Auth (from Plan 06-02)
- Added native Firestore functions using `@react-native-firebase/firestore`
- Fixed `userDoc.exists` check to handle both function and property API
- Auto-creates user profile for new phone auth users with `profileSetupCompleted: false`
- Exported `updateUserDocumentNative` via context for ProfileSetup use

### 2. Navigation Profile Setup Check Fix
**File:** `src/navigation/AppNavigator.js`

Fixed navigation routing for new phone auth users:

```javascript
// OLD (broken for undefined):
const needsProfileSetup = isAuthenticated && userProfile && userProfile.profileSetupCompleted === false;

// NEW (handles false, undefined, and null):
const needsProfileSetup = isAuthenticated && userProfile && userProfile.profileSetupCompleted !== true;
```

Also added loading state while userProfile is being fetched/created to prevent flash of MainTabs.

### 3. ProfileSetupScreen Native Firestore
**File:** `src/screens/ProfileSetupScreen.js`

Updated to use native Firestore for profile updates:

```javascript
// Uses updateUserDocumentNative from AuthContext (shares auth state)
const { user, userProfile, updateUserProfile, updateUserDocumentNative } = useAuth();

// Profile save uses native function
const updateResult = await updateUserDocumentNative(user.uid, updateData);
```

### 4. NotificationService Native Firestore
**File:** `src/services/firebase/notificationService.js`

Updated `storeNotificationToken` to use RN Firebase Firestore directly:

```javascript
import firestore from '@react-native-firebase/firestore';

export const storeNotificationToken = async (userId, token) => {
  await firestore().collection('users').doc(userId).update({
    fcmToken: token,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};
```

## Critical Bug Fixes

### Bug 1: New Users Bypassing ProfileSetup
**Symptom:** New phone auth users went directly to MainTabs instead of ProfileSetup
**Root Cause:** Navigation condition checked `=== false` but profile had `undefined`
**Fix:** Changed to `!== true` to catch false, undefined, and null

### Bug 2: Firestore Permission Errors
**Symptom:** "Missing or insufficient permissions" when creating/updating user documents
**Root Cause:** Firebase JS SDK Firestore doesn't share auth state with RN Firebase Auth
**Fix:** Created native Firestore functions using `@react-native-firebase/firestore`

### Bug 3: userDoc.exists API Mismatch
**Symptom:** Document existence check always passed even for non-existent docs
**Root Cause:** RN Firebase Firestore returns `exists` as a getter function in some versions
**Fix:** Added check: `typeof userDoc.exists === 'function' ? userDoc.exists() : userDoc.exists`

## Files Modified
1. `src/context/AuthContext.js` - Native Firestore functions, exists check fix
2. `src/navigation/AppNavigator.js` - ProfileSetup navigation fix
3. `src/screens/ProfileSetupScreen.js` - Uses native Firestore for updates
4. `src/services/firebase/notificationService.js` - Uses native Firestore for token storage

## Testing Performed
- ✅ New phone auth user flow → ProfileSetup → MainTabs
- ✅ Profile information saves successfully
- ✅ User document created in Firestore with correct fields
- ✅ profileSetupCompleted flag properly tracked
- ✅ Notification token storage works (when permissions granted)

## Technical Notes

### SDK Auth State Isolation
The app uses two Firebase SDKs that don't share authentication state:
- **React Native Firebase** (`@react-native-firebase/auth`, `@react-native-firebase/firestore`) - Native SDK
- **Firebase JS SDK** (`firebase/auth`, `firebase/firestore`) - Web SDK

When a user authenticates via RN Firebase Auth, the JS SDK Firestore sees them as unauthenticated. Solution: Use RN Firebase Firestore for operations that require phone auth user credentials.

### Deprecation Warnings
The codebase uses RN Firebase v23 namespaced API which is deprecated. These are warnings only and don't affect functionality. Phase 7 or later should migrate to modular API.

## Verification Checklist
- [x] AuthContext uses React Native Firebase auth listener
- [x] Phone auth users get profile created automatically
- [x] New users navigate to ProfileSetup
- [x] ProfileSetup saves data successfully
- [x] Existing users go to MainTabs after verification
- [x] Error states handled gracefully

## Next Steps
- Phase 06 complete - phone auth working end-to-end
- Ready for Phase 07: Legacy Auth Removal (remove email/Apple auth)
- Consider migrating to RN Firebase modular API to eliminate deprecation warnings
