# IncomeOS Enterprise Edition v4.1.0

## Milestone 1: Canonical Type Architecture

Version 4.1.0 completes the first architecture milestone for the Forecast Foundation program.

### Included

- Added canonical shared contracts under `src/types` for portfolio, distributions, market data, and forecasting.
- Migrated production source imports to the canonical contracts.
- Removed React ownership of the shared `Holding` model.
- Separated incompatible bounded-context records with explicit names, including portfolio history, Copilot, live-data, integration, ETF knowledge, and universe distribution models.
- Standardized repository and history snapshot naming.
- Aligned package metadata and GitHub Actions on Node.js 22 and npm.

### Verification

- TypeScript project check passed.
- Automated test suite passed: 36 of 36 tests.
- Production Vite build passed: 1,794 modules transformed.
- Required build-artifact verification passed.

### Compatibility

This release is an architecture refactor. It does not intentionally change user-facing portfolio, distribution, market-data, or forecast behavior.

### Next milestone

Milestone 2 introduces the `ForecastEngine` facade and consolidates forecast orchestration behind a stable service API.
