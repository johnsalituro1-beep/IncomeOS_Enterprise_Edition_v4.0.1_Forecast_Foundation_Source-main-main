# IncomeOS Enterprise Edition v1.4

## Phase 1 Milestone 1 — Portfolio Management & Data Quality

This release completes the first post-onboarding portfolio maintenance workflow.

### Added
- Edit existing holdings without deleting and recreating positions.
- Duplicate-ticker protection for manually entered holdings.
- Centralized holding validation with actionable form errors.
- Portfolio data-quality score for price, cost basis, and distribution completeness.
- CSV export for reconciliation and portable backups.
- Improved empty states, responsive actions, and zero-value calculation safety.
- Automated release smoke tests for portfolio-management capabilities.

### Verification
Run `npm test` and `npm run ci` with Node 22.

### Data notice
Portfolio values remain user-supplied or modeled until a licensed live-data provider is configured. IncomeOS does not place trades or provide financial advice.
