# IncomeOS Enterprise Changelog

All notable changes to IncomeOS Enterprise are documented in this file.

## v4.2.0 — Forecast Engine Integration
Released: July 2026

### Added
- Integrated deterministic ForecastEngine and portfolio adapter
- React ForecastContext with automatic portfolio recalculation
- Interactive forecast dashboard controls and projection timeline
- Saved forecast presets persisted in browser local storage
- Side-by-side comparison for up to four captured forecast scenarios
- Forecast preset validation, parsing, and storage tests

### Verified
- 47 automated tests passed
- Forecast Engine tests passed
- Forecast chart tests passed
- Forecast preset tests passed

### Notes
- Full dependency-based TypeScript and production build gates require a successful `npm ci`. The package registry did not complete dependency installation in the build environment; GitHub Actions should run `npm run ci` after dependencies are available.

## v4.1.0 — Canonical Architecture Foundation
Released: July 2026

### Added
- Canonical shared portfolio, distribution, market, and forecast models
- Central `src/types` module

### Refactored
- Standardized core domain contracts
- Reduced duplicate type declarations
- Prepared the architecture for Forecast Engine integration

## v4.0.1 — Forecast Foundation

### Added
- Initial forecast service structure
- Enterprise repository organization
