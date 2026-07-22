# IncomeOS Enterprise v4.2.0

IncomeOS Enterprise v4.2.0 introduces the first fully integrated Forecast Engine workflow.

## Highlights

- Portfolio-connected deterministic income forecasting
- Adjustable reinvestment, distribution growth, price growth, inflation, and time horizon
- Projected weekly and annual income, ending portfolio value, cumulative distributions, and confidence scoring
- Interactive annual-income trajectory chart
- Named forecast presets stored locally in the browser
- Scenario Lab for comparing up to four forecast snapshots
- Responsive Bloomberg-style dashboard integration

## Validation

The repository test suite passes 47 of 47 tests. The complete `npm run ci` gate should be run by GitHub Actions after dependency installation.

## Upgrade notes

No data migration is required. Saved forecast presets use the new browser key `incomeos.forecast.presets.v1` and are independent of portfolio persistence.
