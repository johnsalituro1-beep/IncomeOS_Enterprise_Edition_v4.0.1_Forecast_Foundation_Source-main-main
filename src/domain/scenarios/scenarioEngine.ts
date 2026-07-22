import type { Holding } from '../../types/portfolio'
import { calculatePortfolioMetrics, projectIncomeGrowth, type ProjectionPoint } from '../portfolio/calculations'

export type ScenarioDefinition = {
  name: string
  additionalCapital: number
  targetYieldPct: number
  priceGrowthPct: number
  reinvestmentPct: number
  annualContribution: number
  years: number
}

export type ScenarioResult = {
  definition: ScenarioDefinition
  baselineValue: number
  baselineAnnualIncome: number
  startingAnnualIncome: number
  startingWeeklyIncome: number
  endingValue: number
  endingAnnualIncome: number
  endingWeeklyIncome: number
  projection: ProjectionPoint[]
}

export function runScenario(holdings: Holding[], weeklyGoal: number, definition: ScenarioDefinition): ScenarioResult {
  const baseline = calculatePortfolioMetrics(holdings, weeklyGoal)
  const startingValue = baseline.portfolioValue + Math.max(0, definition.additionalCapital)
  const targetYieldPct = Math.max(0, definition.targetYieldPct)
  const projection = projectIncomeGrowth({
    startingValue,
    annualYieldPct: targetYieldPct,
    annualPriceGrowthPct: definition.priceGrowthPct,
    reinvestmentPct: definition.reinvestmentPct,
    annualContribution: Math.max(0, definition.annualContribution),
    years: Math.max(1, definition.years),
  })
  const ending = projection[projection.length - 1]
  const startingAnnualIncome = startingValue * targetYieldPct / 100
  return {
    definition,
    baselineValue: baseline.portfolioValue,
    baselineAnnualIncome: baseline.annualIncome,
    startingAnnualIncome,
    startingWeeklyIncome: startingAnnualIncome / 52,
    endingValue: ending?.portfolioValue ?? startingValue,
    endingAnnualIncome: ending?.annualIncome ?? startingAnnualIncome,
    endingWeeklyIncome: (ending?.annualIncome ?? startingAnnualIncome) / 52,
    projection,
  }
}
