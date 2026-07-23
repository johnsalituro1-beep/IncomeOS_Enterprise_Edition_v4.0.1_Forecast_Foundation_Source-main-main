# Product Architecture

## Command Centers
1. Income Command Center — daily briefing, goals, upcoming cash flow, intelligence.
2. Portfolio Command Center — holdings, allocation, performance, risk, concentration.
3. Dividend Calendar — month, week, and Income Timeline views.
4. ETF Intelligence — research profiles and comparisons.
5. Strategy Lab — scenario modeling and saved simulations.
6. Income Analytics — income source, frequency, trend, and annualization.

## Data layers
- Browser demo layer: localStorage
- Auth layer: Supabase Auth
- Production portfolio layer: Supabase Postgres with row-level security
- Market data layer: future provider adapter, isolated from UI components

## Planned production entities
profiles, portfolios, holdings, transactions, dividend_events, distributions, goals, alerts, watchlists, strategy_scenarios, user_preferences.
