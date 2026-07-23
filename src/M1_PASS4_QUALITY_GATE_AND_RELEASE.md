# M1 Pass 4 — Architecture Quality Gate and Release Preparation

## Scope

Pass 4 validates the canonical type migration, resolves release-engineering inconsistencies, and prepares the repository for the v4.1.0 GitHub baseline.

## Quality-gate findings

### Resolved

1. **Package version was stale**
   - Updated from `3.1.0-phase-3-milestone-2` to `4.1.0`.

2. **Package-manager metadata conflicted with the repository**
   - The repository contains `package-lock.json` and the primary CI workflow uses npm, while `package.json` declared pnpm.
   - Standardized `packageManager` on `npm@10.9.2`.

3. **GitHub Actions used two package managers**
   - Replaced the pnpm-based quality gate with Node.js 22 plus npm.
   - The quality gate now uses `npm ci` and the repository `ci` script.

4. **CI did not include automated tests in its combined command**
   - Updated `npm run ci` to run clean, typecheck, all tests, production build, and required-artifact verification.

5. **Release documentation was missing**
   - Added `RELEASE_NOTES_v4.1.0.md`.

## Canonical contract audit

A declaration scan confirmed the migrated shared names are owned by `src/types`:

- `Holding`
- `PortfolioTransaction`
- `PortfolioStateSnapshot`
- `PortfolioHistorySnapshot`
- `DistributionRecord`
- `IncomeEvent`
- `ForecastResult`

Bounded-context variants remain explicitly named and separate.

## Verification commands

```bash
npm ci
npm run typecheck
npm test
npm run ci
```

## Verification result

- TypeScript: passed
- Tests: 36 passed, 0 failed
- Production build: passed
- Build artifacts: passed
- Modules transformed: 1,794

## GitHub release preparation

Recommended commit message:

```text
release: IncomeOS Enterprise v4.1.0 canonical type architecture
```

Recommended tag:

```text
v4.1.0
```

Recommended branch state:

```text
main -> v4.1.0 verified baseline
```
