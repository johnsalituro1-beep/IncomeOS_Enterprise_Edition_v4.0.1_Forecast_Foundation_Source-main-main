# Milestone 2 Pass 2 — ForecastContext and Portfolio Integration

## Implemented

- Added a deterministic `ForecastEngine` with validated assumptions and monthly projection timelines.
- Added a portfolio adapter that converts canonical `Holding` records into forecast inputs.
- Added `ForecastProvider`, `useForecast`, and `useForecastSummary`.
- Forecasts automatically recalculate whenever portfolio holdings or assumptions change.
- Registered `ForecastProvider` directly inside `PortfolioProvider` at the application root.
- Added tests for portfolio adaptation, timeline generation, reinvestment behavior, empty portfolios, and validation.

## Architectural boundary

The calculation engine remains framework-independent. React state is isolated in `src/features/forecast/ForecastContext.tsx`, while domain calculations live in `src/services/forecast`.

## Version

`4.2.0-alpha.2`
