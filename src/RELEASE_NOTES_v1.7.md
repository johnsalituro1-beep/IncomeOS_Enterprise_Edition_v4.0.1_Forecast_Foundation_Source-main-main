# IncomeOS Enterprise Edition v1.7
## Phase 1 Milestone 3B — Distribution Intelligence and Income Calendar

### Added
- Portfolio-owned distribution event records with declaration, ex-dividend, record, and payment dates.
- Declared, paid, and estimated distribution statuses.
- Forward-income engine using the latest saved amount and cadence.
- Confirmed-versus-projected upcoming payment calendar.
- Weekly, monthly, annual, forward-yield, yield-on-cost, and next-90-day analytics.
- Local demo persistence and Supabase row-level security.
- Distribution validation, history management, and missing-data warnings.

### Projection behavior
Saved future declarations take priority. The engine extends the latest regular distribution amount at its saved cadence without duplicating explicit payment dates. Holdings without distribution history fall back to the annual distribution assumption saved on the holding.
