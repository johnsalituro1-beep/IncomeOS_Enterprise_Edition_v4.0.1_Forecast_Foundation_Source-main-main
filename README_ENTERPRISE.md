# IncomeOS Enterprise Edition v1.0

This is the consolidated master development package for the ETF Dividend Calendar Pro / IncomeOS platform.

## Included
- Mission Control, portfolio intelligence, ETF research, strategy builder, advisor and enterprise architecture
- Program A: ETF Universe, holdings, distributions, historical warehouse and recommendation foundations
- Program B: Income Digital Twin 2.0
- Program C: Income Copilot Core, Portfolio Advisor and Decision Studio
- Program D: Income OS Score, adaptive analytics, portfolio optimization and executive intelligence
- Mobile ecosystem and commercial-launch foundations
- Supabase migrations, documentation and operational runbooks

## Run locally
1. Install Node.js 22 and pnpm 9.
2. Copy `.env.example` to `.env` and configure Supabase values when applicable.
3. Run `pnpm install`.
4. Run `pnpm dev`.
5. Run `pnpm typecheck` and `pnpm build` before deployment.

## Important limitations
This offline package uses modeled development data and contains provider-neutral integration contracts. It does not include licensed live ETF data, broker connectivity, production credentials or automatic trade execution. Production use requires dependency installation, full tests, security review, licensed data integrations and deployment verification.
