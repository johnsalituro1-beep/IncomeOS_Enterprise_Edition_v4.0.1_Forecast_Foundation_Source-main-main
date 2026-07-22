# IncomeOS Enterprise Edition v1.0

> Consolidated master development edition. See `README_ENTERPRISE.md` and `RELEASE_NOTES_ENTERPRISE_V1.md`.

# ETF Dividend Calendar Pro — Income OS Foundation

This development branch begins the Income Operating System architecture. It adds the Portfolio Health Score, dedicated Income Intelligence Center, Income OS navigation, Portfolio Flight Recorder, and ETF knowledge-base domain model.

> Development branch only. Production approval requires dependency installation, TypeScript validation, Vite build, deployment and smoke testing.

# ETF Dividend Calendar Pro v4.0 — Milestone 1

Project Atlas establishes the permanent commercial foundation for the income-investing platform.

## Included
- React 18 + TypeScript + Vite
- pnpm deployment workflow
- Supabase email/password authentication
- Protected application shell with persistent sessions
- Bloomberg-inspired dark navy and gold terminal UI
- Responsive dashboard and Income Command Center preview
- Portfolio, holdings, transactions, goals and watchlist database foundation
- Row-level security policies
- Netlify SPA configuration

## Local setup
1. Install Node 22.
2. Enable Corepack: `corepack enable`
3. Install: `pnpm install`
4. Copy `.env.example` to `.env.local` and add Supabase values.
5. Run `pnpm dev`.

Without environment variables, the app opens in safe Demo Mode so the UI can still be reviewed.

## Supabase
Open Supabase SQL Editor and run:
`supabase/migrations/202607200001_milestone1_foundation.sql`

Add the Netlify production URL to Supabase Authentication > URL Configuration.

## Netlify
Set these environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The included `netlify.toml` sets Node 22, installs with pnpm and builds the SPA.


## Income Strategy Builder increment 1–6

See `docs/INCOME_STRATEGY_BUILDER_INCREMENT_1_6.md` for the guided workflow, optimization engine, templates, comparison studio, report export and Goal Alignment Engine.


## Income OS Priorities 1–10
This offline milestone adds Income Mission Control, Income Copilot, Optimization Lab, Calendar 2.0, Flight Recorder 2.0, Universe Importer, Professional Reports, Mobile Companion design, and Commercial Edition planning. See `docs/INCOME_OS_MILESTONE_1_10.md`.

## Enterprise Tracks 1–9 Foundation

The current offline branch adds the first interoperable foundations for the Core Platform, ETF Universe, Income Copilot, Income Digital Twin, Portfolio Intelligence, Research Engine, Income Operating System Score, Advisor Platform, and Enterprise Infrastructure. Open **Tracks 1–9 Build** in the sidebar to review the integrated development center.


## Program A Phase 1

See `docs/PROGRAM_A_PHASE_1_COMPLETE.md` for the completed ETF Universe Intelligence release.

## Program A Phase 2

Version 18 adds the Historical ETF Data Warehouse. See `docs/PROGRAM_A_PHASE_2_HISTORICAL_WAREHOUSE.md` for architecture, data-integrity rules and production requirements.
