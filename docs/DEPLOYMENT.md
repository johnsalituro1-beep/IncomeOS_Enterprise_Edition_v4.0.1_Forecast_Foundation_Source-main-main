# Deployment — Milestone 2 Sprint 1 Release Candidate

1. Keep the current production site untouched until this release candidate passes a Netlify deploy preview.
2. Extract the ZIP into a new local folder or a new Git branch.
3. Copy your existing `.env` values or configure the same Supabase environment variables in Netlify.
4. Commit and push the release candidate branch to GitHub.
5. Create a Netlify Deploy Preview from that branch.
6. Confirm the build succeeds, sign-in works, sign-out works, and the Income Command Center loads on desktop and mobile.
7. Merge the branch into the production branch only after those checks pass.

Netlify build command:

```text
corepack enable && pnpm install --no-frozen-lockfile && pnpm build
```

Publish directory:

```text
dist
```
