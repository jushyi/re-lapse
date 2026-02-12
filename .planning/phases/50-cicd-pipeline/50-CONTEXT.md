# Phase 50: CI/CD Pipeline - Context

**Gathered:** 2026-02-12
**Status:** Ready for research

<vision>
## How This Should Work

A gated automation pipeline that makes the development workflow frictionless. Feature branches get PRs into main, and every PR automatically runs checks (lint, tests, build verification) that must pass before merging — no broken code on main.

The real value is streamlined builds. When it's time to release, you create a git tag (e.g. `v1.0.0`), the pipeline kicks off an EAS build automatically, and then you approve the App Store submission from the GitHub Actions UI. No fumbling with CLI commands or remembering configs — tag, wait, approve.

The pipeline also supports manual dispatch from the GitHub Actions UI for builds and submissions, so you can trigger things on demand when needed outside the normal flow.

</vision>

<essential>
## What Must Be Nailed

- **Streamlined builds** — The main value is making builds easy to trigger. Tag a release, it builds. Click approve, it submits. No manual CLI steps.
- **PR quality gate** — Every PR must pass lint, tests, and build verification before merge is allowed. Strict blocking — no exceptions.
- **Gated submission** — Human approval required before anything goes to the App Store. No accidental submissions.
- **Cost efficiency** — Minimize EAS build credits. Use local verification (lint, tests, expo export) for PR checks instead of full EAS builds. Real EAS builds only on release tags.

</essential>

<boundaries>
## What's Out of Scope

- Android builds — iOS only for this milestone
- Advanced pipeline features — no caching, build matrix, Slack notifications, or PR preview builds
- Cloud Functions deployment — keeping that manual for now; can automate later
- Full Firebase environment separation — pipeline supports env vars and build profiles, but the actual prod Firebase project setup is Phase 51
- Paid EAS tier — starting with free tier, optimizing to stay within limits

</boundaries>

<specifics>
## Specific Ideas

- **Branch strategy:** Feature branches with PRs into main (standard GitHub flow)
- **PR checks:** Lint + Tests + Build verification (expo export, not full EAS build) — all must pass to merge
- **Build trigger:** Creating a version tag (e.g. `v1.0.0`) triggers EAS build + submission pipeline
- **Approval gate:** Build happens automatically on tag, but App Store submission requires manual approval in GitHub UI
- **Manual dispatch:** Both build and submit workflows should support manual triggering from GitHub Actions UI
- **EAS build profiles:** Support for dev/production profiles (basic setup now, actual prod Firebase in Phase 51)
- **GitHub Secrets:** User is new to this — plan should include clear guidance on setting up each secret (EAS token, Apple credentials)

</specifics>

<notes>
## Additional Context

User wants to minimize costs — design the pipeline to be frugal with EAS build credits. The free tier should be sufficient with the local-verification-for-PRs approach.

Environment separation discussion: Agreed that Phase 50 sets up the pipeline mechanics (build profiles, env vars), while Phase 51 handles creating the actual production Firebase project. The user has test data in the current Firebase project and wants a clean database for the App Store release — the prod Firebase setup in Phase 51 solves this naturally.

Cloud Functions deployment stays manual — they change less frequently and benefit from immediate deploy-and-verify cycles.

</notes>

---

_Phase: 50-cicd-pipeline_
_Context gathered: 2026-02-12_
