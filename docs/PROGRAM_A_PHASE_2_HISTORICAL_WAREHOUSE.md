# Program A Phase 2 — Historical ETF Data Warehouse

Version 18 adds the point-in-time and operational data layer required by the ETF Universe Research Engine.

## Delivered

- Canonical price and adjusted-price history records
- NAV and premium/discount observations
- Revision-preserving distribution history
- Versioned holdings snapshot manifests with content hashes
- Corporate-action records
- Source lineage and license classification
- Scheduled ingestion run ledger
- Automated price, NAV and holdings-gap detection rules
- Historical coverage calculations
- Interactive historical warehouse dashboard
- Supabase migration for all Phase 2 entities

## Data integrity model

Historical observations are immutable by key. Corrections are represented as new source records or explicit revisions. Every published observation must reference source lineage. Holdings snapshots use content hashes to distinguish a genuine new point-in-time file from a duplicate delivery.

## Production requirements

The bundled records are modeled development data. Production activation still requires authoritative or licensed provider agreements, provider-specific field maps, secrets management, a scheduler/worker environment, reconciliation against issuer records, retry and quarantine policies, and operational approval.

## Next phase

Program A Phase 3 should add provider adapters, incremental backfills, reconciliation, survivorship-bias controls, total-return series, and the production publishing API used by Copilot, Digital Twin and portfolio analytics.
