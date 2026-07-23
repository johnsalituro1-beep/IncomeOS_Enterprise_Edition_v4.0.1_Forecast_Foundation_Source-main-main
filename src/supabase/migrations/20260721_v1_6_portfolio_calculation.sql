-- IncomeOS Enterprise Edition v1.6 — Phase 1 Milestone 3A
-- Calculations are derived in the application from the immutable transaction ledger.
create index if not exists transactions_portfolio_ticker_trade_date_idx
  on public.transactions(portfolio_id, ticker, trade_date, created_at)
  where ticker is not null;

comment on table public.transactions is
  'Auditable source ledger used by IncomeOS to derive shares, weighted-average cost basis, realized gains, and distributions.';
