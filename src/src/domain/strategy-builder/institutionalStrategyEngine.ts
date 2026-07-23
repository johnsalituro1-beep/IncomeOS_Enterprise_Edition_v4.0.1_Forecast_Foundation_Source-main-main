import type { Holding } from '../../types/portfolio'
import { STRATEGY_CANDIDATES } from './candidates'
import { STRATEGY_TEMPLATES } from './templates'
import { rankStrategies } from './engine'
import type { GeneratedStrategy, RiskTolerance, StrategyBuilderProfile, StrategyConstraints } from './types'

export type StrategyObjective = 'Balanced' | 'Income First' | 'Growth First' | 'Capital Preservation'
export type StressScenario = 'Baseline' | 'Equity Drawdown' | 'Distribution Cut' | 'High Inflation'

export type InstitutionalStrategyInput = {
  capital: number
  targetWeeklyIncome: number
  monthlyContribution: number
  reinvestmentPct: number
  horizonYears: number
  riskTolerance: RiskTolerance
  objective: StrategyObjective
  maximumSingleEtfPct: number
  maximumCoveredCallPct: number
  minimumGrowthPct: number
  minimumFixedIncomePct: number
  maximumIssuerPct: number
}

export type RebalanceTrade = {
  ticker: string
  action: 'BUY' | 'SELL' | 'HOLD'
  currentPct: number
  targetPct: number
  changePct: number
  amount: number
}

export type FrontierPoint = {
  strategyId: string
  strategyName: string
  modeledRisk: number
  modeledReturn: number
  modeledYield: number
  weeklyIncome: number
  recommended: boolean
}

export type StressResult = {
  scenario: StressScenario
  portfolioValue: number
  annualIncome: number
  weeklyIncome: number
  goalCoveragePct: number
  note: string
}

export type StrategyBuildResult = {
  profile: StrategyBuilderProfile
  constraints: StrategyConstraints
  ranked: GeneratedStrategy[]
  recommended: GeneratedStrategy
  frontier: FrontierPoint[]
  trades: RebalanceTrade[]
  stress: StressResult[]
  decisionSummary: string[]
  dataConfidence: 'Modeled'
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

function objectivePriorities(objective: StrategyObjective) {
  if (objective === 'Income First') return { incomePriority: 90, growthPriority: 35 }
  if (objective === 'Growth First') return { incomePriority: 45, growthPriority: 90 }
  if (objective === 'Capital Preservation') return { incomePriority: 55, growthPriority: 35 }
  return { incomePriority: 70, growthPriority: 65 }
}

function makeProfile(input: InstitutionalStrategyInput): StrategyBuilderProfile {
  const priorities = objectivePriorities(input.objective)
  return {
    name: `${input.objective} Strategy`,
    investableCapital: Math.max(0, input.capital),
    targetWeeklyIncome: Math.max(0, input.targetWeeklyIncome),
    monthlyContribution: Math.max(0, input.monthlyContribution),
    reinvestmentPct: clamp(input.reinvestmentPct, 0, 100),
    horizonYears: clamp(Math.round(input.horizonYears), 1, 30),
    accountType: 'Taxable',
    maximumDrawdownPct: input.riskTolerance === 'Conservative' ? 15 : input.riskTolerance === 'Moderate' ? 22 : input.riskTolerance === 'Growth' ? 30 : 40,
    incomePriority: priorities.incomePriority,
    growthPriority: priorities.growthPriority,
    distributionPreference: 'Weekly preferred',
    riskTolerance: input.riskTolerance,
  }
}

function makeConstraints(input: InstitutionalStrategyInput): StrategyConstraints {
  return {
    minimumHoldings: 5,
    maximumSingleEtfPct: clamp(input.maximumSingleEtfPct, 10, 60),
    maximumSingleIssuerPct: clamp(input.maximumIssuerPct, 15, 80),
    maximumCoveredCallPct: clamp(input.maximumCoveredCallPct, 0, 100),
    minimumGrowthPct: clamp(input.minimumGrowthPct, 0, 100),
    minimumFixedIncomePct: clamp(input.minimumFixedIncomePct, 0, 100),
    maximumSectorPct: 45,
  }
}

function currentWeights(holdings: Holding[]) {
  const total = holdings.reduce((sum, holding) => sum + holding.shares * holding.currentPrice, 0)
  return new Map(holdings.map((holding) => [holding.ticker, total ? holding.shares * holding.currentPrice / total * 100 : 0]))
}

function buildTrades(holdings: Holding[], strategy: GeneratedStrategy, capital: number): RebalanceTrade[] {
  const weights = currentWeights(holdings)
  const tickers = new Set([...holdings.map((holding) => holding.ticker), ...strategy.allocations.map((allocation) => allocation.ticker)])
  return [...tickers].map((ticker) => {
    const currentPct = weights.get(ticker) ?? 0
    const targetPct = strategy.allocations.find((allocation) => allocation.ticker === ticker)?.allocationPct ?? 0
    const changePct = targetPct - currentPct
    return {
      ticker,
      action: (Math.abs(changePct) < 1 ? 'HOLD' : changePct > 0 ? 'BUY' : 'SELL') as RebalanceTrade['action'],
      currentPct,
      targetPct,
      changePct,
      amount: Math.abs(changePct) / 100 * capital,
    }
  }).sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
}

function buildFrontier(strategies: GeneratedStrategy[], recommendedId: string): FrontierPoint[] {
  return strategies.map((strategy) => {
    const weightedRisk = strategy.allocations.reduce((sum, allocation) => sum + allocation.riskScore * allocation.allocationPct / 100, 0)
    return {
      strategyId: strategy.id,
      strategyName: strategy.name,
      modeledRisk: weightedRisk,
      modeledReturn: strategy.modeledGrowthPct + strategy.modeledYieldPct,
      modeledYield: strategy.modeledYieldPct,
      weeklyIncome: strategy.projectedWeeklyIncome,
      recommended: strategy.id === recommendedId,
    }
  }).sort((a, b) => a.modeledRisk - b.modeledRisk)
}

function buildStress(strategy: GeneratedStrategy, capital: number, weeklyTarget: number): StressResult[] {
  const cases: Array<{ scenario: StressScenario; valueFactor: number; incomeFactor: number; note: string }> = [
    { scenario: 'Baseline', valueFactor: 1, incomeFactor: 1, note: 'Current modeled assumptions remain unchanged.' },
    { scenario: 'Equity Drawdown', valueFactor: .78, incomeFactor: .90, note: 'Models a 22% market decline with a 10% income reduction.' },
    { scenario: 'Distribution Cut', valueFactor: .94, incomeFactor: .75, note: 'Models a broad 25% distribution reduction.' },
    { scenario: 'High Inflation', valueFactor: .88, incomeFactor: .96, note: 'Shows an inflation-adjusted value reduction with modest income pressure.' },
  ]
  return cases.map((item) => {
    const annualIncome = strategy.projectedAnnualIncome * item.incomeFactor
    return {
      scenario: item.scenario,
      portfolioValue: capital * item.valueFactor,
      annualIncome,
      weeklyIncome: annualIncome / 52,
      goalCoveragePct: weeklyTarget ? annualIncome / 52 / weeklyTarget * 100 : 100,
      note: item.note,
    }
  })
}

export function buildInstitutionalStrategy(input: InstitutionalStrategyInput, holdings: Holding[]): StrategyBuildResult {
  const profile = makeProfile(input)
  const constraints = makeConstraints(input)
  const ranked = rankStrategies(STRATEGY_TEMPLATES, profile, constraints)
  const recommended = ranked[0]
  const failedChecks = recommended.checks.filter((check) => !check.passed)
  const decisionSummary = [
    `${recommended.name} ranks first with an overall score of ${recommended.scores.overall}/100.`,
    `Modeled weekly income is $${Math.round(recommended.projectedWeeklyIncome).toLocaleString()}, covering ${Math.round(recommended.goalProgressPct)}% of the target.`,
    `${recommended.allocations.length} ETF sleeves are used across ${new Set(recommended.allocations.map((allocation) => allocation.category)).size} strategy categories.`,
    failedChecks.length ? `${failedChecks.length} portfolio constraint${failedChecks.length === 1 ? '' : 's'} remain outside the selected limits.` : 'All selected portfolio constraints are satisfied.',
    'All yields, growth rates, and risk measures in this offline build are modeled assumptions pending verified ETF Universe data.',
  ]
  return {
    profile,
    constraints,
    ranked,
    recommended,
    frontier: buildFrontier(ranked, recommended.id),
    trades: buildTrades(holdings, recommended, input.capital),
    stress: buildStress(recommended, input.capital, input.targetWeeklyIncome),
    decisionSummary,
    dataConfidence: 'Modeled',
  }
}

export function candidateUniverseSummary() {
  return {
    funds: STRATEGY_CANDIDATES.length,
    issuers: new Set(STRATEGY_CANDIDATES.map((candidate) => candidate.issuer)).size,
    categories: new Set(STRATEGY_CANDIDATES.map((candidate) => candidate.category)).size,
    weeklyPayers: STRATEGY_CANDIDATES.filter((candidate) => candidate.distributionFrequency === 'Weekly').length,
  }
}
