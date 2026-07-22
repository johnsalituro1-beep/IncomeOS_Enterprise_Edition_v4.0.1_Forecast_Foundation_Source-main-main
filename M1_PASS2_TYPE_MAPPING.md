# IncomeOS Enterprise — M1 Pass 2 Canonical Type Design

## Status

Pass 2 is complete. Canonical type contracts were added under `src/types/`. Existing production imports and local declarations were intentionally left unchanged for the verified migration in Pass 3.

## Canonical shared types

### `src/types/portfolio.ts`

- `Holding`
- `HoldingPaymentFrequency`
- `TransactionType`
- `PortfolioTransaction`
- `TransactionDraft`
- `PortfolioStateSnapshot`
- `PortfolioHistorySnapshot`

### `src/types/distribution.ts`

- `DistributionStatus`
- `DistributionFrequency`
- `DistributionRecord`
- `DistributionDraft`
- `IncomeEvent`

### `src/types/market.ts`

- `PriceFreshness`
- `QuoteCacheEntry`
- `MarketQuote`
- `MarketDistributionRecord`

### `src/types/forecast.ts`

- `PaymentFrequency`
- `ForecastPeriod`
- `ForecastHolding`
- `DistributionStatistics`
- `ForecastAssumptions`
- `ForecastConfidence`
- `ForecastSummary`
- `ForecastScenario`
- `ForecastResult`

## Mapping decisions

| Current declaration | Pass 3 target | Decision |
|---|---|---|
| `features/portfolio/PortfolioContext.tsx::Holding` | `types/portfolio::Holding` | Promote and remove local declaration |
| `features/portfolio/transactionEngine.ts::PortfolioTransaction` | `types/portfolio::PortfolioTransaction` | Promote; engine imports canonical type |
| `features/portfolio/transactionEngine.ts::TransactionDraft` | `types/portfolio::TransactionDraft` | Promote; engine imports canonical type |
| `features/portfolio/transactionEngine.ts::TransactionType` | `types/portfolio::TransactionType` | Promote; engine imports canonical type |
| `features/portfolio/portfolioRepository.ts::PortfolioSnapshot` | `types/portfolio::PortfolioStateSnapshot` | Rename to express persistence/hydration semantics |
| `services/history/portfolioFlightRecorder.ts::PortfolioSnapshot` | `types/portfolio::PortfolioHistorySnapshot` | Rename to distinguish historical metric snapshots |
| `domain/copilot-v3/types.ts::PortfolioSnapshot` | `CopilotPortfolioSnapshot` (remain in copilot domain) | Bounded-context model; rename locally, do not merge |
| `features/distributions/distributionEngine.ts::DistributionRecord` | `types/distribution::DistributionRecord` | Promote application record |
| `features/distributions/distributionEngine.ts::DistributionDraft` | `types/distribution::DistributionDraft` | Promote application draft |
| `features/distributions/distributionEngine.ts::DistributionStatus` | `types/distribution::DistributionStatus` | Promote |
| `features/distributions/distributionEngine.ts::DistributionFrequency` | `types/distribution::DistributionFrequency` | Promote application cadence |
| `features/distributions/distributionEngine.ts::IncomeEvent` | `types/distribution::IncomeEvent` | Promote forecast-ready income event |
| `domain/live-data/types.ts::QuoteRecord` | `types/market::MarketQuote` or local compatibility alias | Provider-neutral payload; migrate carefully |
| `domain/live-data/types.ts::DistributionRecord` | `types/market::MarketDistributionRecord` or local compatibility alias | Rename; not the persisted application distribution record |
| `integrations/contracts.ts::DistributionRecord` | `IntegrationDistributionRecord` | Rename local integration contract |
| `domain/etf/knowledge/types.ts::DistributionRecord` | `EtfKnowledgeDistributionRecord` | Rename bounded-context model |
| `domain/etf-universe/program-a/types.ts::DistributionRecord` | `UniverseDistributionRecord` | Rename bounded-context model |
| `services/forecast/forecastTypes.ts::*` | `types/forecast::*` | Replace definitions with re-exports/imports |

## Deliberately local types

The following remain local because they describe domain-specific or component-specific contracts rather than universal application models:

- Copilot portfolio holdings/weights and decision simulations
- ETF knowledge-base records
- ETF universe ingestion records
- Live-data envelopes and provider metadata
- Component props and page-local form models

## Pass 3 migration order

1. Portfolio models and transaction engine.
2. Portfolio repository snapshot rename.
3. Distribution application models.
4. Market-data aliases and bounded-context distribution renames.
5. Forecast type re-exports.
6. Copilot snapshot rename.
7. Run `tsc`, tests, and production build; repair all regressions.

## Compatibility policy

During Pass 3, temporary type re-exports may be used at old module paths to avoid a disruptive all-at-once import break. Those shims should be removed only after all consumers use `src/types` directly.
