export type ScenarioKind = 'current' | 'retirement' | 'income-max' | 'growth' | 'stress'

export interface TwinHolding { ticker: string; value: number; annualYield: number; annualGrowth: number; volatility: number; expenseRatio: number }
export interface CashFlowEvent { id: string; year: number; amount: number; type: 'contribution' | 'withdrawal' | 'income' | 'expense'; label: string; recurring?: boolean }
export interface TwinAssumptions { startAge: number; retirementAge: number; years: number; inflation: number; taxRate: number; reinvestmentRate: number; annualContribution: number; annualWithdrawal: number; sequenceShockYear?: number; sequenceShockPct?: number }
export interface TwinScenario { id: string; name: string; kind: ScenarioKind; holdings: TwinHolding[]; assumptions: TwinAssumptions; events: CashFlowEvent[] }
export interface ProjectionPoint { year: number; age: number; openingValue: number; contributions: number; distributions: number; reinvested: number; withdrawals: number; taxes: number; growth: number; closingValue: number; realValue: number }
export interface TwinProjection { scenarioId: string; points: ProjectionPoint[]; endingValue: number; endingRealValue: number; totalIncome: number; totalWithdrawals: number; sustainabilityScore: number; goalStatus: 'on-track' | 'watch' | 'at-risk' }
export interface MonteCarloResult { successRate: number; medianEndingValue: number; percentile10: number; percentile90: number; trials: number }
