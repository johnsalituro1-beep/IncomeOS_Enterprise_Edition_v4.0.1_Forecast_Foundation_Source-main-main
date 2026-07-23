# Phases A–H Blueprint

## Phase A — Enterprise Architecture
- Domain calculations are isolated from React in `src/domain`.
- Insight generation is isolated in `src/services/intelligence`.
- External data providers depend on interfaces in `src/integrations/contracts.ts`.
- UI remains a consumer of domain and service layers, not the owner of business logic.

## Phase B — Bloomberg-Level UI
- Dense but legible information hierarchy.
- Navy terminal surfaces, restrained metallic-gold highlights, semantic status states.
- Loading, empty, warning, and error states are first-class UI states.

## Phase C — Database Design
Planned core entities: users, portfolios, holdings, transactions, distributions, goals, scenarios, watchlists, preferences, notifications, provider_sync_jobs, audit_events.

## Phase D — Calculation Engine
Initial pure functions implemented:
- portfolio value and cost basis
- forward annual, monthly, and weekly income
- forward yield
- goal progress
- holding, income, and covered-call concentration
- multi-year reinvestment projection

## Phase E — Integrations
Provider contracts now exist for market data, brokerage positions, and notifications. Concrete providers will be added only after vendor selection and credential handling are approved.

## Phase F — Testing
Pure calculation and intelligence functions are designed for unit testing without React or Supabase. Browser flows remain gated on dependency installation.

## Phase G — Commercial Readiness
Prepare tier-independent feature flags, auditable disclaimers, onboarding, versioning, and support documentation before billing is introduced.

## Phase H — Performance
Favor route-level lazy loading, derived-value memoization, cached provider responses, table virtualization for large histories, and explicit performance budgets.
