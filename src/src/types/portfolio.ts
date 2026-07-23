/** Canonical application portfolio models. */
export type HoldingPaymentFrequency = 'Weekly' | 'Monthly' | 'Quarterly'

export interface Holding {
  id: string
  ticker: string
  fundName: string
  shares: number
  averageCost: number
  currentPrice: number
  annualDistributionPerShare: number
  paymentFrequency: HoldingPaymentFrequency
  category: string
}

export type TransactionType = 'buy' | 'sell' | 'dividend' | 'fee' | 'deposit' | 'withdrawal'

export interface PortfolioTransaction {
  id: string
  holdingId?: string | null
  ticker?: string | null
  type: TransactionType
  tradeDate: string
  shares: number
  price: number
  fees: number
  notes: string
}

export type TransactionDraft = Omit<PortfolioTransaction, 'id'>

/** Persistence/hydration snapshot used by the application portfolio repository. */
export interface PortfolioStateSnapshot {
  portfolioId: string | null
  holdings: Holding[]
  transactions: PortfolioTransaction[]
  weeklyGoal: number
}

/** Historical daily metric snapshot used by the portfolio flight recorder. */
export interface PortfolioHistorySnapshot {
  id: string
  capturedAt: string
  portfolioValue: number
  annualIncome: number
  weeklyIncome: number
  yieldPct: number
  healthScore: number
  holdingsCount: number
}
