# IncomeOS v3.1 Production Operations

## Monitoring
Run synthetic checks for the web application, Supabase authentication/database access, market-data adapter, distribution adapter, and server-job worker. Forward structured client and worker errors to the configured monitoring provider.

## Background jobs
A secured server cron or queue worker should invoke price and distribution refresh jobs. Use bounded exponential retries, idempotency keys, provider rate-limit controls, and persistent operation-run records.

## Incident response
Critical outages and repeated failures page the operator. Warning incidents generate email alerts. Maintenance mode communicates planned disruption while preserving audit history.

## Backup and recovery
Verify daily backups and record periodic restore tests. A backup is operationally healthy only when it is recent, verified, and supported by a tested recovery procedure.

## Deployment safety
Every deployment runs type checks, automated tests, a production build, artifact verification, and post-build smoke tests. Record deployment status and retain rollback instructions for the prior known-good release.
