# U.S. ETF Universe Ingestion Plan

## Coverage goal
Maintain one active or historical master record for every exchange-traded fund listed on a U.S. exchange.

## Source hierarchy
1. Exchange or regulatory listing source.
2. Issuer-provided fund data.
3. Licensed market-data provider.
4. Secondary enrichment provider.

## Pipeline
Discover listings → normalize identifiers → resolve duplicates → enrich metadata → import distributions → import holdings/exposures → calculate metrics → run validation → publish snapshot.

## Refresh cadence
- Listing status: daily.
- Prices/AUM/volume: provider-dependent daily refresh.
- Distributions: event-driven plus daily reconciliation.
- Holdings: daily, weekly, monthly, or quarterly according to issuer availability.
- Prospectus and fee data: change detection plus periodic audit.

## Compliance and trust
The project should not scrape or redistribute data without permission. Provider terms, attribution, delayed-data labels, and licensing restrictions must be reviewed before commercial release.
