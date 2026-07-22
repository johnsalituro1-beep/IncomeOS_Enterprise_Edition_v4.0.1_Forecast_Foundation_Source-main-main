# ETF Knowledge Base — Phases 1–10

## Objective
Create a provider-agnostic knowledge platform capable of storing every U.S.-listed ETF without hard-coding the application to a single vendor.

## Implemented offline
1. ETF master schema with identifiers, issuer, strategy, asset class, fees, AUM, cadence, documents, and provenance.
2. Distribution-event schema supporting income, capital gains, return of capital, qualified-income percentages, and special payments.
3. Holdings, sector, and country exposure entities.
4. Standardized strategy taxonomy for income, growth, market segment, options, leverage, and asset class.
5. Explainable risk-assessment structure and calculation starter.
6. Income-metrics engine for trailing distributions, yield, volatility, consistency, streaks, and projected cadence.
7. Intelligence metadata for strengths, considerations, and portfolio-role labels.
8. Comparison engine and Comparison Studio page.
9. Relationship graph builder for common issuer, benchmark, and strategy similarity.
10. Portfolio enrichment service that attaches knowledge and risk flags to holdings.

## Full-universe ingestion
The code now supports bulk provider rows through a mapping-driven importer. Complete coverage requires a trustworthy source such as exchange listings, issuer files, or a licensed ETF data feed. The application must preserve source IDs and update timestamps so users can distinguish verified data from demonstrations.

## Data quality gates
- Ticker and fund name required.
- Source and update timestamp required.
- Imported records default to Research Required.
- Derived risk and income values remain separate from source values.
- Demo records must never be represented as current verified fund data.

## Next ingestion milestones
- Add CSV upload user interface.
- Add provider adapters and scheduled sync contracts.
- Add duplicate/CUSIP/ISIN resolution.
- Add delisting and liquidation lifecycle handling.
- Add distribution and holdings history loaders.
- Add data-quality dashboard and stale-record alerts.
