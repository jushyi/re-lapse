# Phase 19: Linting and Prettier Setup - Research

**Researched:** 2026-01-23
**Domain:** ESLint + Prettier + Husky pre-commit hooks for Expo/React Native
**Confidence:** HIGH

<research_summary>
## Summary

Researched the current ecosystem for ESLint, Prettier, and pre-commit hooks in Expo SDK 54 projects. The standard approach uses `eslint-config-expo` with ESLint flat config (SDK 53+), `eslint-plugin-prettier/recommended` for Prettier integration, and Husky v9 with lint-staged for pre-commit enforcement.

Key finding: ESLint flat config is now the default for Expo SDK 53+. Use `defineConfig()` wrapper to simplify configuration and avoid spread operator confusion. The `eslint-plugin-prettier/recommended` config sets up both `eslint-plugin-prettier` AND `eslint-config-prettier` in one import, eliminating manual conflict resolution.

**Primary recommendation:** Use `npx expo lint` to bootstrap ESLint config, add Prettier via `eslint-plugin-prettier/recommended`, then add Husky v9 + lint-staged. The expo CLI handles the flat config format automatically.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| eslint | 9.x | JavaScript linting | Required by eslint-config-expo |
| eslint-config-expo | latest | Expo-specific ESLint rules | Official Expo config, understands RN platform |
| prettier | 3.8.0 | Code formatting | De-facto standard formatter |
| eslint-plugin-prettier | 5.x | Run Prettier as ESLint rule | Integrates Prettier into ESLint workflow |
| eslint-config-prettier | 9.x | Disable conflicting rules | Prevents ESLint/Prettier conflicts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| husky | 9.x | Git hooks manager | Pre-commit enforcement |
| lint-staged | 15.x | Run linters on staged files only | Fast commits (only lint changed files) |
| eslint-plugin-unused-imports | 4.x | Auto-remove unused imports | Optional but recommended for cleanup |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| eslint-plugin-prettier | Prettier CLI separately | Separate tool invocations, more config |
| eslint-config-expo | @react-native/eslint-config | Expo config built on top, better for Expo |
| Husky | simple-git-hooks | simple-git-hooks is lighter but less features |
| Biome | ESLint + Prettier | Biome faster but less ecosystem/plugin support |

**Installation:**
```bash
# ESLint setup via Expo CLI (creates config automatically)
npx expo lint

# Then add Prettier and hooks
npm install --save-dev prettier eslint-plugin-prettier eslint-config-prettier husky lint-staged

# Initialize Husky
npx husky init
```
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Configuration Files
```
project-root/
├── eslint.config.js       # ESLint flat config (SDK 53+)
├── .prettierrc            # Prettier options
├── .prettierignore        # Files Prettier should skip
├── .husky/
│   └── pre-commit         # Git hook script
└── package.json           # lint-staged config + scripts
```

### Pattern 1: ESLint Flat Config with Prettier
**What:** Single eslint.config.js using Expo config + Prettier plugin
**When to use:** All Expo SDK 53+ projects
**Example:**
```javascript
// eslint.config.js
// Source: https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'android/*', 'ios/*'],
  },
]);
```

### Pattern 2: lint-staged with Sequential Commands
**What:** Run ESLint --fix first, then Prettier --write
**When to use:** Pre-commit hooks
**Example:**
```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Pattern 3: Husky v9 Pre-commit Hook
**What:** Minimal hook that runs lint-staged
**When to use:** All projects with pre-commit enforcement
**Example:**
```sh
# .husky/pre-commit
npx lint-staged
```

### Anti-Patterns to Avoid
- **Using legacy .eslintrc.js with SDK 53+:** Flat config is the default, use it
- **Extending "prettier/react" separately:** As of eslint-config-prettier v8+, just use "prettier"
- **Running Prettier before ESLint --fix:** ESLint may introduce changes that Prettier needs to reformat
- **Using `--max-warnings=0` initially:** Will block commits on existing warnings; add after cleanup
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ESLint/Prettier conflict resolution | Manual rule disabling | eslint-config-prettier | Maintained list of all conflicting rules |
| Platform-specific globals (RN) | Manual globals config | eslint-config-expo | Knows about iOS/Android/Web globals |
| Unused import detection | Manual review | eslint-plugin-unused-imports | Auto-fixable, catches all cases |
| Git hook installation | Manual .git/hooks scripts | Husky | Cross-platform, survives git operations |
| Staged file filtering | Custom git diff scripts | lint-staged | Handles edge cases (renames, deletes) |
| Prettier ESLint integration | Separate CLI calls | eslint-plugin-prettier/recommended | Single tool invocation, proper ordering |

**Key insight:** The linting ecosystem has solved these problems. eslint-plugin-prettier/recommended sets up BOTH the plugin AND config-prettier in one import. Don't manually configure what's already bundled.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: ESLint/Prettier Rule Conflicts
**What goes wrong:** ESLint errors on code that Prettier just formatted
**Why it happens:** ESLint has formatting rules that conflict with Prettier's output
**How to avoid:** Always put eslint-plugin-prettier/recommended LAST in your config array
**Warning signs:** Infinite loop of fixes, or errors immediately after Prettier runs

### Pitfall 2: Flat Config Spread Operator Confusion
**What goes wrong:** Config doesn't apply, or TypeError during lint
**Why it happens:** Some plugins export objects, others export arrays; unclear when to spread
**How to avoid:** Use `defineConfig()` wrapper from 'eslint/config' - it auto-flattens everything
**Warning signs:** "Cannot read property 'rules' of undefined" or similar

### Pitfall 3: Husky Hooks Not Running
**What goes wrong:** Commits proceed without linting
**Why it happens:** Husky not initialized, or hooks not executable (Windows/Unix permissions)
**How to avoid:** Run `npx husky init` after install; on Unix, ensure .husky/pre-commit has +x
**Warning signs:** No output from lint-staged on commit

### Pitfall 4: lint-staged Race Conditions
**What goes wrong:** File modifications lost or corrupted
**Why it happens:** Multiple commands modifying same file concurrently
**How to avoid:** Use array syntax ["eslint --fix", "prettier --write"] for sequential execution
**Warning signs:** Inconsistent formatting, or staged changes lost

### Pitfall 5: Existing Warnings Block All Commits
**What goes wrong:** Can't commit anything after adding linting
**Why it happens:** Using --max-warnings=0 on codebase with existing warnings
**How to avoid:** First pass: fix all warnings. Then add --max-warnings=0 for strictness
**Warning signs:** Hundreds of warnings on first lint run

### Pitfall 6: Node.js Config Files Not Linted Correctly
**What goes wrong:** Errors on require(), module.exports in config files
**Why it happens:** ESLint assumes browser/RN environment, not Node
**How to avoid:** eslint-config-expo handles this automatically for known config files
**Warning signs:** "require is not defined" errors in metro.config.js, etc.
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources:

### Complete eslint.config.js for Expo SDK 54
```javascript
// Source: https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  // Expo's React Native rules
  expoConfig,

  // Prettier integration (MUST be last to override conflicting rules)
  eslintPluginPrettierRecommended,

  // Project-specific ignores
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      'android/*',
      'ios/*',
      'coverage/*',
    ],
  },
]);
```

### Prettier Configuration (.prettierrc)
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

### package.json Scripts and lint-staged Config
```json
{
  "scripts": {
    "lint": "expo lint",
    "lint:fix": "expo lint --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,json}\"",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

### Husky Pre-commit Hook (.husky/pre-commit)
```sh
npx lint-staged
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| .eslintrc.js (legacy) | eslint.config.js (flat) | Expo SDK 53 (2025) | Use defineConfig() for clarity |
| eslint-config-prettier separate | eslint-plugin-prettier/recommended | 2024 | One import does both |
| husky install | husky init / prepare: "husky" | Husky v9 (2024) | Simpler setup |
| Prettier 2.x | Prettier 3.8.0 | 2023-2026 | trailingComma default changed to "all" |
| Manual spread in flat config | defineConfig() wrapper | ESLint 9.5 (2025) | No more spread confusion |

**New tools/patterns to consider:**
- **Biome:** All-in-one linter+formatter, faster than ESLint+Prettier, but less plugin ecosystem
- **eslint-plugin-unused-imports:** Auto-removes unused imports on fix

**Deprecated/outdated:**
- **husky install:** Replaced by `husky init` and prepare script
- **Extending "prettier/react", "prettier/standard":** Just use "prettier" (v8+)
- **.eslintrc.js:** Still works but flat config is the future
</sota_updates>

<open_questions>
## Open Questions

None - this is a well-established domain with clear best practices.

The only consideration is whether to add `eslint-plugin-unused-imports` for automatic import cleanup. It's optional but recommended since unused imports are a common issue.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Expo ESLint Guide](https://docs.expo.dev/guides/using-eslint/) - Official Expo docs, flat config setup
- [eslint-config-expo GitHub](https://github.com/expo/expo/tree/main/packages/eslint-config-expo) - Package source and docs
- [Husky Get Started](https://typicode.github.io/husky/get-started.html) - Official Husky v9 setup
- [lint-staged GitHub](https://github.com/lint-staged/lint-staged) - Official lint-staged docs
- [eslint-config-prettier GitHub](https://github.com/prettier/eslint-config-prettier) - Conflict resolution rules

### Secondary (MEDIUM confidence)
- [Prettier 3.8 Blog](https://prettier.io/blog/2026/01/14/3.8.0) - Latest version info
- [ESLint Flat Config Blog](https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/) - defineConfig() introduction
- [Better Stack Husky Guide](https://betterstack.com/community/guides/scaling-nodejs/husky-and-lint-staged/) - Setup patterns verified against official docs

### Tertiary (LOW confidence - needs validation)
- None - all findings verified against official sources
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: ESLint 9 + flat config
- Ecosystem: eslint-config-expo, Prettier 3.8, Husky 9, lint-staged
- Patterns: Pre-commit hooks, ESLint/Prettier integration
- Pitfalls: Config conflicts, hook setup, race conditions

**Confidence breakdown:**
- Standard stack: HIGH - official Expo documentation, npm packages verified
- Architecture: HIGH - patterns from official docs
- Pitfalls: HIGH - documented in official repos and community guides
- Code examples: HIGH - from official Expo and ESLint docs

**Research date:** 2026-01-23
**Valid until:** 2026-04-23 (90 days - stable, well-established tooling)
</metadata>

---

*Phase: 19-linting-prettier*
*Research completed: 2026-01-23*
*Ready for planning: yes*
