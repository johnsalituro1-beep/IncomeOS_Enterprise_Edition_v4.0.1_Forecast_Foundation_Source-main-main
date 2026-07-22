export type EvidenceClass = 'verified' | 'provider' | 'modeled' | 'user-input'
export type CopilotIntent = 'portfolio-summary' | 'compare-portfolios' | 'replace-etf' | 'income-goal' | 'scenario-question' | 'risk-explanation'

export interface CopilotCitation {
  sourceId: string
  label: string
  evidence: EvidenceClass
  asOf: string
}

export interface CopilotAction {
  id: string
  label: string
  kind: 'open-research' | 'run-simulation' | 'clone-scenario' | 'review-trade'
  payload: Record<string, string | number>
}

export interface CopilotAnswer {
  intent: CopilotIntent
  headline: string
  narrative: string
  bullets: string[]
  confidence: number
  citations: CopilotCitation[]
  actions: CopilotAction[]
  disclaimer: string
}

export interface CopilotPortfolioSnapshot {
  id: string
  name: string
  marketValue: number
  weeklyIncome: number
  osScore: number
  riskScore: number
  holdings: Array<{ ticker: string; weight: number; yield: number; risk: number }>
}

export interface DecisionSimulation {
  id: string
  prompt: string
  scenario: string
  baselineWeeklyIncome: number
  projectedWeeklyIncome: number
  baselineValueAtHorizon: number
  projectedValueAtHorizon: number
  successProbability: number
  tradeoffs: string[]
}
