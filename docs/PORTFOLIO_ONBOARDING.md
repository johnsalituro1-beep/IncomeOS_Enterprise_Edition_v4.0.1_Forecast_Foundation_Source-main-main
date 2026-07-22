# Portfolio Onboarding & Investor Experience

Version 1.3 adds the first complete first-run workflow for IncomeOS.

## Workflow

1. Establish the investor display profile.
2. Import holdings from a CSV, paste CSV content, or load the development portfolio.
3. Configure retirement age, weekly income target, annual contributions, reinvestment, cash reserve, tax assumption, and risk tolerance.
4. Review calculated portfolio value, estimated weekly income, target coverage, and setup readiness.
5. Initialize the workspace and open Mission Control.

## CSV contract

Required: `ticker` or `symbol`; `shares`, `quantity`, or `qty`.

Optional: fund name, average cost, current price, annual distribution per share, payment frequency, and category. Missing market fields are imported as zero and identified as enrichment gaps. The live ETF data platform can later enrich those records after a licensed provider is configured.

## Security model

Demo mode persists the profile and holdings to browser local storage. Production mode uses Supabase authentication. The included migration creates user-owned investor profile and import audit tables with row-level security.

## Limitations

This release does not connect directly to a brokerage, place trades, verify market values, or provide financial advice. CSV data is user supplied and should be reconciled before relying on calculations.
