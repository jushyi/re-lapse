# Phase 20: Friend Suggestions via Contacts Sync - Research

**Researched:** 2026-02-04
**Domain:** React Native/Expo contacts access + Firebase phone number matching
**Confidence:** HIGH

<research_summary>

## Summary

Researched the React Native/Expo ecosystem for implementing contact-based friend suggestions. The standard approach uses `expo-contacts` for device contact access with `libphonenumber-js` for phone number normalization to E.164 format before Firebase queries.

Key finding: The app already has `libphonenumber-js` installed and uses it in `phoneAuthService.js` for E.164 formatting. Phone numbers are stored in E.164 format in user documents. This makes contact matching straightforward - normalize contact phone numbers to E.164 and query Firestore's `phoneNumber` field.

The main technical considerations are: Firestore's IN query limit of 30 values (requiring batch queries for large contact lists), phone number format variations in contact data, and appropriate permission UX with privacy messaging.

**Primary recommendation:** Use existing `libphonenumber-js` + `expo-contacts` stack. Normalize all contact phone numbers to E.164 format, batch queries in groups of 30, and implement clear privacy-first permission flow during onboarding.
</research_summary>

<standard_stack>

## Standard Stack

### Core

| Library                          | Version  | Purpose                                  | Why Standard                                                       |
| -------------------------------- | -------- | ---------------------------------------- | ------------------------------------------------------------------ |
| expo-contacts                    | Latest   | Access device contacts                   | Official Expo SDK, well-maintained, handles iOS 18+ limited access |
| libphonenumber-js                | 1.12.x   | Phone number parsing/E.164 normalization | Already in codebase, Google's standard, handles all countries      |
| @react-native-firebase/firestore | Existing | Phone number lookup                      | Already used for user data, supports IN queries                    |

### Supporting

| Library                              | Version | Purpose             | When to Use                                     |
| ------------------------------------ | ------- | ------------------- | ----------------------------------------------- |
| expo-permissions (via expo-contacts) | Bundled | Permission handling | Contacts.requestPermissionsAsync() handles this |

### Alternatives Considered

| Instead of               | Could Use             | Tradeoff                                                                                 |
| ------------------------ | --------------------- | ---------------------------------------------------------------------------------------- |
| libphonenumber-js        | google-libphonenumber | google-libphonenumber is 420KB vs 145KB, no benefit                                      |
| expo-contacts            | react-native-contacts | react-native-contacts requires manual linking, expo-contacts works with managed workflow |
| Direct Firestore queries | Cloud Function        | Cloud Function adds latency, direct queries faster for MVP scale                         |

**Installation:**

```bash
npx expo install expo-contacts
# libphonenumber-js already installed
```

</standard_stack>

<architecture_patterns>

## Architecture Patterns

### Recommended Project Structure

```
src/
├── services/
│   └── firebase/
│       └── contactSyncService.js     # Contact sync + matching logic
├── screens/
│   └── ContactsSyncScreen.js         # Onboarding contacts sync UI
├── components/
│   └── SuggestionCard.js             # Friend suggestion card (reuse FriendCard)
└── utils/
    └── phoneUtils.js                 # Phone normalization helpers
```

### Pattern 1: E.164 Normalization for Contact Matching

**What:** Normalize all phone numbers to E.164 before comparison
**When to use:** Always - before storing or querying phone numbers
**Example:**

```javascript
// Source: libphonenumber-js docs + existing phoneAuthService.js
import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Normalize a phone number to E.164 format
 * Handles various input formats: (415) 555-1234, +1-415-555-1234, etc.
 *
 * @param {string} phoneNumber - Raw phone number from contact
 * @param {string} defaultCountry - Default country code if not in number (e.g., 'US')
 * @returns {string|null} E.164 format (+14155551234) or null if invalid
 */
export const normalizeToE164 = (phoneNumber, defaultCountry = 'US') => {
  if (!phoneNumber) return null;

  try {
    // parsePhoneNumberFromString handles international format automatically
    // For national format, it uses the defaultCountry
    const parsed = parsePhoneNumberFromString(phoneNumber, defaultCountry);

    if (parsed && parsed.isValid()) {
      return parsed.format('E.164'); // +14155551234
    }
    return null;
  } catch {
    return null;
  }
};
```

### Pattern 2: Batched Firestore IN Queries

**What:** Split phone number arrays into chunks of 30 for Firestore IN queries
**When to use:** When matching more than 30 phone numbers
**Example:**

```javascript
// Source: Firebase docs on query limits
import { collection, query, where, getDocs, getFirestore } from '@react-native-firebase/firestore';

const db = getFirestore();

/**
 * Find users by phone numbers, handling Firestore's IN query limit
 *
 * @param {string[]} phoneNumbers - Array of E.164 phone numbers
 * @returns {Promise<Object[]>} Array of user objects with matching phone numbers
 */
export const findUsersByPhoneNumbers = async phoneNumbers => {
  if (!phoneNumbers.length) return [];

  const BATCH_SIZE = 30; // Firestore IN query limit
  const batches = [];

  // Split into batches of 30
  for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
    batches.push(phoneNumbers.slice(i, i + BATCH_SIZE));
  }

  // Execute all batches in parallel
  const results = await Promise.all(
    batches.map(async batch => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phoneNumber', 'in', batch));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    })
  );

  // Flatten results
  return results.flat();
};
```

### Pattern 3: Progressive Contact Loading

**What:** Load contacts in pages to avoid blocking UI
**When to use:** When users have large contact lists (500+)
**Example:**

```javascript
// Source: expo-contacts docs
import * as Contacts from 'expo-contacts';

/**
 * Get all contacts with phone numbers, paginated
 * Returns normalized E.164 phone numbers
 */
export const getAllContactPhoneNumbers = async (defaultCountry = 'US') => {
  const PAGE_SIZE = 100;
  const allPhoneNumbers = new Set(); // Deduplicate
  let hasNextPage = true;
  let pageOffset = 0;

  while (hasNextPage) {
    const { data, hasNextPage: more } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
      pageSize: PAGE_SIZE,
      pageOffset,
    });

    // Extract and normalize all phone numbers
    for (const contact of data) {
      if (contact.phoneNumbers) {
        for (const phone of contact.phoneNumbers) {
          const normalized = normalizeToE164(phone.number, defaultCountry);
          if (normalized) {
            allPhoneNumbers.add(normalized);
          }
        }
      }
    }

    hasNextPage = more;
    pageOffset += PAGE_SIZE;
  }

  return Array.from(allPhoneNumbers);
};
```

### Anti-Patterns to Avoid

- **Storing raw contact format:** Always normalize to E.164 before storing/comparing
- **Single large Firestore query:** Firestore IN queries limited to 30 values, must batch
- **Blocking UI during contact load:** Large contact lists can take seconds, show progress
- **Re-syncing on every app launch:** Expensive operation, only sync on demand or onboarding
  </architecture_patterns>

<dont_hand_roll>

## Don't Hand-Roll

| Problem                | Don't Build         | Use Instead                                          | Why                                                     |
| ---------------------- | ------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| Phone number parsing   | Regex patterns      | libphonenumber-js                                    | Country codes, format variations, validation edge cases |
| E.164 formatting       | String manipulation | libphonenumber-js parsePhoneNumber().format('E.164') | International format handling is complex                |
| Contacts access        | Native modules      | expo-contacts                                        | Handles iOS 18 limited access, permissions              |
| Permission dialogs     | Custom modals       | Contacts.requestPermissionsAsync()                   | Platform-native UX, handles all states                  |
| Country code detection | Lookup tables       | libphonenumber-js parsed.country                     | Handles shared country codes (US/Canada)                |

**Key insight:** Phone number normalization has countless edge cases across international formats. `libphonenumber-js` is Google's battle-tested solution - the same library used by Chrome, WhatsApp, and major apps. Rolling custom regex patterns leads to bugs with specific country formats.
</dont_hand_roll>

<common_pitfalls>

## Common Pitfalls

### Pitfall 1: Phone Number Format Variations

**What goes wrong:** Contact "John" has number stored as "(415) 555-1234" but user registered with "+14155551234" - no match found
**Why it happens:** Contacts saved in various formats, not always international
**How to avoid:** Always normalize BOTH sides to E.164 before comparison
**Warning signs:** Users report "found 0 friends" when they have friends who use the app

### Pitfall 2: Firestore IN Query Limit Exceeded

**What goes wrong:** App crashes or query fails with error for users with many contacts
**Why it happens:** Firestore IN queries limited to 30 values, passing full contact list fails
**How to avoid:** Batch queries in groups of 30, execute in parallel, merge results
**Warning signs:** Works in dev (small contact list), fails in production (large lists)

### Pitfall 3: Country Code Assumptions

**What goes wrong:** App assumes all contacts are US numbers, international users get no matches
**Why it happens:** parsePhoneNumberFromString needs country context for national format numbers
**How to avoid:** Detect user's country from their own phone number (already E.164), use as default
**Warning signs:** Works for US users, fails for international users

### Pitfall 4: Permission Denied Forever

**What goes wrong:** User denies permission once, can never sync contacts again
**Why it happens:** After denial, requestPermissionsAsync returns denied without prompting
**How to avoid:** Check permission status, guide user to Settings if permanently denied
**Warning signs:** "Sync contacts" button does nothing after initial denial

### Pitfall 5: Duplicate Suggestions

**What goes wrong:** Same person appears multiple times in suggestions
**Why it happens:** Contact has multiple phone numbers that all match
**How to avoid:** Query returns users by userId, deduplicate by userId not phone number
**Warning signs:** Users see "Add John" appearing 3 times for same person

### Pitfall 6: Suggesting Existing Friends

**What goes wrong:** Users see "Add Friend" for people they're already friends with
**Why it happens:** Contact sync doesn't filter out existing friends/pending requests
**How to avoid:** After finding matching users, filter out those with existing friendships
**Warning signs:** "Why am I being asked to add someone I'm already friends with?"
</common_pitfalls>

<code_examples>

## Code Examples

Verified patterns for this implementation:

### expo-contacts Permission Flow

```javascript
// Source: expo-contacts docs
import * as Contacts from 'expo-contacts';
import { Alert, Linking } from 'react-native';

export const requestContactsPermission = async () => {
  const { status, canAskAgain } = await Contacts.requestPermissionsAsync();

  if (status === 'granted') {
    return { granted: true };
  }

  if (status === 'denied' && !canAskAgain) {
    // User has permanently denied - guide to settings
    Alert.alert(
      'Contacts Access Required',
      'To find friends, please enable Contacts access in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return { granted: false, permanent: true };
  }

  return { granted: false, permanent: false };
};
```

### Complete Contact Sync Flow

```javascript
// Source: Pattern combining expo-contacts + libphonenumber-js + Firestore
import * as Contacts from 'expo-contacts';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const syncContactsAndFindFriends = async (currentUserId, userPhoneNumber) => {
  // 1. Request permission
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== 'granted') {
    return { success: false, error: 'permission_denied' };
  }

  // 2. Get user's country from their phone number for default
  const userParsed = parsePhoneNumberFromString(userPhoneNumber);
  const defaultCountry = userParsed?.country || 'US';

  // 3. Get all contacts with phone numbers
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
  });

  // 4. Extract and normalize phone numbers
  const phoneToContact = new Map(); // E.164 -> contact name
  for (const contact of data) {
    if (contact.phoneNumbers) {
      for (const phone of contact.phoneNumbers) {
        const normalized = normalizeToE164(phone.number, defaultCountry);
        if (normalized && normalized !== userPhoneNumber) {
          phoneToContact.set(normalized, contact.name);
        }
      }
    }
  }

  // 5. Query Firestore for matching users (batched)
  const phoneNumbers = Array.from(phoneToContact.keys());
  const matchedUsers = await findUsersByPhoneNumbers(phoneNumbers);

  // 6. Filter out self and existing friends
  const existingFriendIds = await getExistingFriendIds(currentUserId);
  const suggestions = matchedUsers
    .filter(user => user.id !== currentUserId && !existingFriendIds.has(user.id))
    .map(user => ({
      ...user,
      contactName: phoneToContact.get(user.phoneNumber),
    }));

  return { success: true, suggestions };
};
```

### Dismissible Suggestions Storage

```javascript
// Source: Firestore pattern for user preferences
import { doc, updateDoc, arrayUnion, getFirestore } from '@react-native-firebase/firestore';

const db = getFirestore();

/**
 * Dismiss a friend suggestion (won't show again)
 */
export const dismissSuggestion = async (userId, dismissedUserId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    dismissedSuggestions: arrayUnion(dismissedUserId),
  });
};

/**
 * Filter suggestions against dismissed list
 */
export const filterDismissedSuggestions = (suggestions, dismissedIds = []) => {
  const dismissedSet = new Set(dismissedIds);
  return suggestions.filter(s => !dismissedSet.has(s.id));
};
```

</code_examples>

<sota_updates>

## State of the Art (2025-2026)

| Old Approach               | Current Approach        | When Changed | Impact                                              |
| -------------------------- | ----------------------- | ------------ | --------------------------------------------------- |
| expo-permissions           | expo-contacts (bundled) | 2023         | Permissions now bundled with expo-contacts          |
| iOS full access only       | iOS 18 limited access   | 2024         | Can handle partial contact selection                |
| Firestore IN limit 10      | Firestore IN limit 30   | 2023         | Fewer batches needed for contact matching           |
| Simple hashing for privacy | E.164 direct matching   | Current      | For small apps, direct E.164 matching is acceptable |

**New tools/patterns to consider:**

- **iOS 18 ContactAccessButton:** For limited-access scenarios, lets users select specific contacts
- **presentAccessPickerAsync():** New expo-contacts method for iOS 18+ limited access selection

**Deprecated/outdated:**

- **expo-permissions package:** Now bundled with each feature's SDK (expo-contacts, etc.)
- **Firestore 10-value IN limit:** Raised to 30 in 2023, old tutorials may show 10
  </sota_updates>

<open_questions>

## Open Questions

Things that couldn't be fully resolved:

1. **User's default country detection**
   - What we know: Can parse user's phone number to get country
   - What's unclear: What if user has international contacts? Their contacts may be in different country formats
   - Recommendation: Use user's country as default, libphonenumber-js handles international format (+XX) automatically

2. **Re-sync strategy**
   - What we know: Context specifies one-time sync only for MVP
   - What's unclear: If user adds new contacts later, how do they find new friends?
   - Recommendation: Add "Refresh suggestions" button in Requests tab for manual re-sync

3. **Large contact list performance**
   - What we know: expo-contacts supports pagination, Firestore queries in parallel
   - What's unclear: Exact performance with 5000+ contacts
   - Recommendation: Test with large contact list, add progress indicator, consider background processing
     </open_questions>

<sources>
## Sources

### Primary (HIGH confidence)

- [Expo Contacts Documentation](https://docs.expo.dev/versions/latest/sdk/contacts/) - API reference, permission handling, iOS 18 features
- [libphonenumber-js GitHub](https://github.com/catamphetamine/libphonenumber-js) - Parsing, E.164 formatting, country detection
- [Firebase Firestore Query Docs](https://firebase.google.com/docs/firestore/query-data/queries) - IN query limits, batch patterns

### Secondary (MEDIUM confidence)

- [Expo Contacts GitHub Issues](https://github.com/expo/expo/issues/357) - Performance considerations for large contact lists
- [Firestore Query Limitations](https://levelup.gitconnected.com/firestore-query-limitations-and-how-to-work-around-them-e058a844ae57) - Workarounds for IN limit
- [Phone Number Normalization](https://dev.to/bornfightcompany/phone-number-normalisation-4gpi) - E.164 best practices

### Tertiary (LOW confidence - needs validation)

- [Signal Contact Discovery Blog](https://signal.org/blog/contact-discovery/) - Privacy patterns (relevant for future, not MVP)
- General social app patterns from WebSearch - UX recommendations verified against expo-contacts docs
  </sources>

<metadata>
## Metadata

**Research scope:**

- Core technology: expo-contacts + libphonenumber-js
- Ecosystem: Firebase Firestore queries, E.164 normalization
- Patterns: Batched queries, progressive loading, permission flow
- Pitfalls: Format variations, query limits, country codes, deduplication

**Confidence breakdown:**

- Standard stack: HIGH - libphonenumber-js already in codebase, expo-contacts well-documented
- Architecture: HIGH - Patterns verified against Firebase docs and existing codebase
- Pitfalls: HIGH - Documented in GitHub issues and Firestore guides
- Code examples: HIGH - Combines verified patterns from official sources

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable ecosystem)
</metadata>

---

_Phase: 20-friend-suggestions-contacts-sync_
_Research completed: 2026-02-04_
_Ready for planning: yes_
