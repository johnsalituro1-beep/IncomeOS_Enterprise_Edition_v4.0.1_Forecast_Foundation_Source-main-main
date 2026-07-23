# IncomeOS Enterprise Edition v1.6

## Phase 1 Milestone 3A — Portfolio Calculation Engine

### Added
- Transaction-derived positions for securities with buy and sell history.
- Weighted-average cost basis calculations including buy and sell fees.
- Realized gain/loss calculations when shares are sold.
- Unrealized gain/loss based on stored current prices.
- Total-return accounting that combines realized gain, unrealized gain, and recorded distributions.
- Ledger-coverage indicator distinguishing calculated positions from manual opening balances.
- Oversell prevention when recording sell transactions.
- Reconciliation warnings for oversold ledgers and transaction-only tickers missing holding metadata.
- Automated tests for average-cost calculations, partial sales, dividends, and ledger fallback behavior.

### Calculation policy
IncomeOS v1.6 uses weighted-average cost. A ticker with at least one buy or sell transaction is derived from its ledger. A ticker without trade history continues to use the manually entered shares and average cost as an opening-balance fallback.

### Data notice
Current prices remain user-entered or modeled until a licensed market-data provider is configured. Calculations are informational and do not constitute tax or investment advice.
