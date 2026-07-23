# Program C — Income Copilot™ Versions 21–23

Version 23 combines three incremental releases:

## Version 21 — Copilot Core
- Natural-language intent detection for portfolio summaries, income goals, risk explanations, ETF replacement questions, and scenario questions.
- Responses grounded in a portfolio snapshot and Program A intelligence contracts.
- Evidence classification, confidence, actions, and decision-support disclaimer on every answer.
- No automatic trading or silent portfolio mutation.

## Version 22 — Portfolio Advisor
- Concentration and weighted-risk diagnostics.
- Reinvestment opportunity analysis.
- Portfolio-to-portfolio comparison for income, risk, value, and Income OS Score.
- Explicit recommended next action for every finding.

## Version 23 — Decision Studio
- Converts a question into a reproducible Digital Twin branch.
- Baseline and modified assumptions remain side by side.
- Shows weekly-income, horizon-value, success-probability, and trade-off outputs.
- Uses deterministic offline development assumptions in this package; production requires verified market data and calibrated simulation models.

## Architecture
`src/domain/copilot-v3/` contains framework-independent types and engines. `IncomeCopilotPage.tsx` is the interactive terminal surface. Supabase migration `20260721_program_c_copilot.sql` provides conversation, evidence, recommendation, and decision-run persistence.

## Safety and data integrity
All offline outputs are decision-support examples. Evidence labels distinguish user input, modeled data, provider data, and verified data. A production implementation must enforce authentication, tenant isolation, provider licensing, model monitoring, and human review before trades.
