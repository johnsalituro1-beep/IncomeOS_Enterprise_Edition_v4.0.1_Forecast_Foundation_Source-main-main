# Stage 5 — Institutional Strategy Builder

Version: `11.0.0-stage-5-institutional-strategy-builder`

## Delivered

- Goal-driven investment mandate controls
- Ranked model-strategy generation
- Transparent allocation and constraint checks
- Explainable multi-factor strategy scoring
- Modeled efficient-frontier visualization
- Four-scenario stress-test matrix
- Current-to-target rebalance transition model
- Income target coverage and multi-year projection integration
- Explicit modeled-data confidence labeling

## Data boundary

The offline candidate universe uses modeled ETF characteristics for UI and engine development. It is not investment advice and does not issue trades. Verified yields, holdings, issuer data, expense ratios, historical returns, correlations, and tax characteristics require the ETF Universe provider layer.

## Next integration tasks

1. Replace modeled candidate fields with verified ETF Universe records.
2. Add covariance and historical-return inputs for a statistically derived efficient frontier.
3. Persist user mandates and saved strategies.
4. Send selected strategies into the Income Digital Twin for detailed scenario comparisons.
5. Add tax-lot-aware transition analysis after brokerage data integration.
