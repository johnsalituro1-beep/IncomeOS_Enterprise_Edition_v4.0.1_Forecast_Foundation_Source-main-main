# Program A — ETF Universe Research Engine Foundation

Version: `16.0.0-program-a-etf-universe-foundation`

## Purpose

Program A creates the canonical data foundation that will eventually support every U.S.-listed ETF. The architecture keeps verified provider facts, imported provider values, modeled development values, and missing values explicitly separated.

## A1 capabilities delivered

- Canonical ETF master record schema
- Distribution history schema
- Holdings and exposure snapshot schema
- ETF relationship graph schema
- Evidence and source metadata
- Universe coverage metrics
- Quality validation and duplicate detection
- CSV parser and provider-field normalization pipeline
- Initial relationship generation rules
- Program A control room and catalog browser

## Data integrity policy

Modeled records are permitted only for interface and engine development. They must remain visibly labeled and may not be presented as verified market facts. Production ingestion requires an authoritative or licensed source, source-date preservation, validation, and approval for downstream publication.

## Next increment: A2 Historical Data Warehouse

1. Versioned price and NAV observations
2. Distribution-event history with revisions
3. Holdings snapshot storage and change detection
4. Corporate actions and fund status history
5. Point-in-time queries and snapshot comparison
6. Provider conflict-resolution policy
7. Incremental synchronization and recovery checkpoints

## Build status

The package was developed offline. Static structure and archive integrity are checked locally. Full TypeScript/Vite compilation requires dependency installation in a registry-enabled environment.
