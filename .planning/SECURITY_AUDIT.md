# Lapse Clone Security Audit

**Audit Date:** 2026-01-24
**Auditor:** Automated (Phase 22 Environment Configuration)
**Scope:** Git history, .gitignore patterns, secret locations

---

## 1. Inventory of Secrets/Sensitive Files

### Currently Tracked Files (Safe)

| File            | Sensitivity | Committed | Notes                                                         |
| --------------- | ----------- | --------- | ------------------------------------------------------------- |
| `.firebaserc`   | LOW         | Yes       | Contains project ID only (re-lapse-fa89b) - public identifier |
| `app.json`      | LOW         | Yes       | Contains EAS project ID - public identifier                   |
| `eas.json`      | LOW         | Yes       | Build configuration without secrets                           |
| `firebase.json` | LOW         | Yes       | Firebase hosting/functions config only                        |

### Gitignored Files (Local Only)

| File                       | Sensitivity | Location               | Injection Method                               |
| -------------------------- | ----------- | ---------------------- | ---------------------------------------------- |
| `GoogleService-Info.plist` | HIGH        | Repository root        | EAS env var `GOOGLE_SERVICES_PLIST` for builds |
| `google-services.json`     | HIGH        | Not present (iOS only) | Would use EAS env var for Android              |
| `.env`                     | HIGH        | Not present            | Would be gitignored if created                 |

### EAS Secrets (Cloud-Managed)

| Secret Name             | Purpose                       | Visibility                  |
| ----------------------- | ----------------------------- | --------------------------- |
| `GOOGLE_SERVICES_PLIST` | Firebase iOS config file path | Sensitive (build-time only) |

---

## 2. Git History Audit

### Commands Executed

```bash
git log -S "AIzaSy" --all --oneline
git log -S "AAAA" --all --oneline
git log --all --name-only -- "*.plist" "*.env" "google-services.json"
```

### Findings

#### Firebase API Key Pattern ("AIzaSy")

| Commit    | File                                                          | Status                                |
| --------- | ------------------------------------------------------------- | ------------------------------------- |
| `e599ab8` | `.planning/phases/22-environment-configuration/22-01-PLAN.md` | SAFE - Documentation example only     |
| `cb1ebdf` | `.planning/phases/21.1-api-key-remediation/21.1-RESEARCH.md`  | SAFE - Research documentation         |
| `3fe7402` | `src/services/firebase/firebaseConfig.js`                     | WARNING - Historical API key exposure |
| `d37ecc6` | `src/services/firebase/firebaseConfig.js`                     | WARNING - Historical API key exposure |

#### FCM Token Pattern ("AAAA")

| Commit    | File                                                          | Status                            |
| --------- | ------------------------------------------------------------- | --------------------------------- |
| `e599ab8` | `.planning/phases/22-environment-configuration/22-01-PLAN.md` | SAFE - Documentation example only |

#### Sensitive Config Files

No `.plist`, `.env`, or `google-services.json` files found in git history (verified by empty output).

### Critical Finding: Incomplete History Cleanup

**Issue:** Firebase API keys are still present in git history in commits `d37ecc6` and `3fe7402`, which contain hardcoded credentials in `src/services/firebase/firebaseConfig.js`.

**Evidence:**

```bash
$ git show d37ecc6:src/services/firebase/firebaseConfig.js | grep apiKey
  apiKey: "AIzaSyAh25TU1FwnsFdUTpP_iVZrjaF3ATcW2CA",
```

**Previous Remediation (Phase 21.1):**

- Phase 21.1 executed git-filter-repo to remove `GoogleService-Info.plist` from history
- The `firebaseConfig.js` file was NOT addressed in the remediation scope
- The file no longer exists in the current working tree (deleted/moved at some point)

**Risk Assessment:**

- API key has been rotated (confirmed in Phase 21.1 documentation)
- The exposed key is no longer valid
- Keys were already public on GitHub before rotation

**Recommendation:**

- Consider running git-filter-repo on `src/services/firebase/firebaseConfig.js` for complete cleanup
- OR document that the key was rotated and old key is invalidated
- This is a LOW priority given key rotation has occurred

---

## 3. Gitignore Verification

### Required Patterns

| Pattern                       | Present | File Line  |
| ----------------------------- | ------- | ---------- |
| `GoogleService-Info.plist`    | YES     | Line 52-53 |
| `**/GoogleService-Info.plist` | YES     | Line 53    |
| `google-services.json`        | YES     | Line 54    |
| `**/google-services.json`     | YES     | Line 55    |
| `.env`                        | YES     | Line 35    |
| `.env*.local`                 | YES     | Line 34    |
| `*.key`                       | YES     | Line 18    |
| `*.p8`                        | YES     | Line 16    |
| `*.p12`                       | YES     | Line 17    |
| `*.mobileprovision`           | YES     | Line 19    |

### Verification Result

All required .gitignore patterns are present and correctly configured.

### Full Firebase-Related .gitignore Block

```gitignore
# Firebase config files (never commit)
GoogleService-Info.plist
**/GoogleService-Info.plist
google-services.json
**/google-services.json
```

---

## 4. Secret Locations Documentation

### Development (Local)

| Secret                     | Location                    | How to Obtain                                 |
| -------------------------- | --------------------------- | --------------------------------------------- |
| `GoogleService-Info.plist` | Repository root             | Firebase Console > Project Settings > iOS app |
| Firebase API Key           | In GoogleService-Info.plist | Included in plist file                        |
| Firebase Project ID        | `.firebaserc`               | Already committed (non-sensitive)             |

### Production (EAS Builds)

| Secret                  | Storage         | Access Method                      |
| ----------------------- | --------------- | ---------------------------------- |
| `GOOGLE_SERVICES_PLIST` | EAS Secrets     | `eas secret:list` to verify        |
| File injection          | Build-time only | Via `app.config.js` dynamic config |

### Cloud Functions

| Secret                | Storage       | Notes                                               |
| --------------------- | ------------- | --------------------------------------------------- |
| Firebase Admin SDK    | Auto-injected | Cloud Functions environment has default credentials |
| No additional secrets | N/A           | Functions use Firebase Admin auto-auth              |

---

## 5. Recommendations

### Immediate Actions (None Required)

All critical security measures are in place:

- API keys rotated (Phase 21.1)
- .gitignore properly configured
- EAS secrets configured for builds
- No sensitive files currently tracked

### Future Improvements (Optional)

1. **History Cleanup (Low Priority)**
   - Run git-filter-repo on `src/services/firebase/firebaseConfig.js` to remove old API key references
   - Since key is rotated, this is cosmetic only

2. **Pre-commit Hook (This Phase)**
   - Adding secret detection pre-commit hook to prevent future accidents

3. **Secret Scanning**
   - Consider enabling GitHub Secret Scanning on the repository
   - GitHub may auto-detect common secret patterns

---

## 6. Audit Summary

| Category         | Status  | Notes                                     |
| ---------------- | ------- | ----------------------------------------- |
| Current Files    | PASS    | No sensitive data in tracked files        |
| Gitignore        | PASS    | All required patterns present             |
| Secret Locations | PASS    | Documented and secure                     |
| Git History      | WARNING | Old rotated API key in history (low risk) |
| Overall          | PASS    | Security posture is acceptable            |

---

_Audit completed: 2026-01-24_
_Phase: 22-environment-configuration_
