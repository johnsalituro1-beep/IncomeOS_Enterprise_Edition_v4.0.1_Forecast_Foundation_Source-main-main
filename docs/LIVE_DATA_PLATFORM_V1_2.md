# IncomeOS Enterprise Edition v1.2 — Live ETF Data Platform

## Scope
This release introduces a provider-neutral live-data layer for ETF fund metadata, quotes, NAV, distributions, holdings, and future corporate actions.

## Architecture
1. Provider adapters normalize vendor payloads into `DataEnvelope<T>` records.
2. Validation rejects critical errors and queues warnings for review.
3. Idempotency keys and content hashes prevent duplicate imports.
4. Every value retains provider, retrieval time, effective time, confidence, and evidence classification.
5. The Data Operations dashboard exposes coverage, freshness, provider status, sync results, and validation issues.

## Included provider
`incomeos-sandbox` is an executable development provider. Its values are modeled and must not be treated as verified market data.

## Production provider checklist
- Sign a commercial data license.
- Store API credentials in the deployment secret manager.
- Implement the `LiveEtfDataProvider` interface.
- Set provider rate limits and retry policy.
- Run historical backfills in batches.
- Reconcile distributions and corporate actions against a secondary source.
- Configure scheduled jobs and operational alerts.

## Suggested schedules
- Quotes: market days, every 15 minutes or per license.
- NAV: once daily after official publication.
- Distributions: daily, with revision checks.
- Holdings: daily or weekly based on issuer availability.
- Fund metadata: weekly.
- Corporate actions: daily.

## Safety
No production API credentials are included. No brokerage connectivity or trade execution is implemented.
