import type { Holding } from '../../types/portfolio'

export type PortfolioMetrics = {
  portfolioValue: number
  costBasis: number
  annualIncome: number
  monthlyIncome: number
  weeklyIncome: number
  yieldPct: number
  gainLoss: number
  goalProgress: number
  largestHoldingWeight: number
  largestIncomeWeight: number
  coveredCallWeight: number
}

const safeDivide = (numerator: number, denominator: number) => denominator > 0 ? numerator / denominator : 0

export function calculatePortfolioMetrics(holdings: Holding[], weeklyGoal: number): PortfolioMetrics {
  const portfolioValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0)
  const costBasis = holdings.reduce((sum, h) => sum + h.shares * h.averageCost, 0)
  const annualIncome = holdings.reduce((sum, h) => sum + h.shares * h.annualDistributionPerShare, 0)
  const monthlyIncome = annualIncome / 12
  const weeklyIncome = annualIncome / 52
  const holdingValues = holdings.map((h) => h.shares * h.currentPrice)
  const incomeValues = holdings.map((h) => h.shares * h.annualDistributionPerShare)
  const coveredCallValue = holdings
    .filter((h) => h.category.toLowerCase().includes('covered call'))
    .reduce((sum, h) => sum + h.shares * h.currentPrice, 0)

  return {
    portfolioValue,
    costBasis,
    annualIncome,
    monthlyIncome,
    weeklyIncome,
    yieldPct: safeDivide(annualIncome, portfolioValue) * 100,
    gainLoss: portfolioValue - costBasis,
    goalProgress: safeDivide(weeklyIncome, weeklyGoal) * 100,
    largestHoldingWeight: safeDivide(Math.max(0, ...holdingValues), portfolioValue) * 100,
    largestIncomeWeight: safeDivide(Math.max(0, ...incomeValues), annualIncome) * 100,
    coveredCallWeight: safeDivide(coveredCallValue, portfolioValue) * 100,
  }
}

export type ProjectionInput = {
  startingValue: number
  annualYieldPct: number
  annualPriceGrowthPct: number
  reinvestmentPct: number
  annualContribution: number
  years: number
}

export type ProjectionPoint = {
  year: number
  portfolioValue: number
  annualIncome: number
  cashIncome: number
  reinvestedIncome: number
}

export function projectIncomeGrowth(input: ProjectionInput): ProjectionPoint[] {
  const points: ProjectionPoint[] = []
  let value = Math.max(0, input.startingValue)
  const yieldRate = Math.max(0, input.annualYieldPct) / 100
  const growthRate = input.annualPriceGrowthPct / 100
  const reinvestmentRate = Math.min(1, Math.max(0, input.reinvestmentPct / 100))

  for (let year = 1; year <= Math.max(0, Math.floor(input.years)); year += 1) {
    const annualIncome = value * yieldRate
    const reinvestedIncome = annualIncome * reinvestmentRate
    const cashIncome = annualIncome - reinvestedIncome
    value = Math.max(0, value * (1 + growthRate) + reinvestedIncome + input.annualContribution)
    points.push({ year, portfolioValue: value, annualIncome, cashIncome, reinvestedIncome })
  }
  return points
}
