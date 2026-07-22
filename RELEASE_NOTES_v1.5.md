# IncomeOS Enterprise Edition v1.5

## Phase 1 Milestone 2 — Persistent Portfolio Engine

### Added
- Authenticated portfolio loading and synchronization through Supabase.
- User-owned default portfolio resolution with automatic creation fallback.
- Local browser persistence when Supabase is not configured.
- Visible synchronization, saving, offline, and error states.
- Auditable transaction ledger for buys, sells, dividends, deposits, withdrawals, and fees.
- Ledger cash-flow, invested-capital, sale-proceeds, and distribution summaries.
- Persistent weekly-income goal synchronization.
- Database migration for holding categories, integrity checks, indexes, and updated timestamps.
- Automated release tests covering the repository and transaction engine.

### Deployment
Apply `supabase/migrations/20260721_v1_5_persistent_portfolio.sql` after the prior migrations. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for authenticated cloud synchronization.

### Data notice
IncomeOS stores user-entered portfolio and transaction information. Market prices and distributions remain user-supplied or modeled until a licensed live-data provider is configured. IncomeOS does not place trades or provide financial advice.
