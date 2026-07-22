import type {
  ForecastAssumptions,
  ForecastConfidence,
  ForecastHolding,
  ForecastResult,
  ForecastTimelinePoint,
} from '../../types/forecast'

const MONTHS_PER_YEAR = 12
const WEEKS_PER_YEAR = 52

export const defaultForecastAssumptions: ForecastAssumptions = {
  reinvestmentRate: 50,
  annualDistributionGrowthRate: 0.02,
  annualPriceGrowthRate: 0.03,
  inflationRate: 0.025,
  horizonYears: 5,
  reinvestDistributions: true,
  annualGrowthRate: 0.02,
}

function finiteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a finite non-negative number.`)
}

export function validateForecastInput(holdings: ForecastHolding[], assumptions: ForecastAssumptions): void {
  if (!Array.isArray(holdings)) throw new Error('Forecast holdings must be an array.')
  finiteNonNegative(assumptions.reinvestmentRate, 'Reinvestment rate')
  if (assumptions.reinvestmentRate > 100) throw new Error('Reinvestment rate cannot exceed 100 percent.')
  if (!Number.isInteger(assumptions.horizonYears) || assumptions.horizonYears < 1 || assumptions.horizonYears > 50) {
    throw new Error('Forecast horizon must be a whole number between 1 and 50 years.')
  }
  for (const holding of holdings) {
    if (!holding.ticker.trim()) throw new Error('Every forecast holding requires a ticker.')
    finiteNonNegative(holding.shares, `${holding.ticker} shares`)
    finiteNonNegative(holding.currentPrice, `${holding.ticker} price`)
    finiteNonNegative(holding.annualDistributionPerShare, `${holding.ticker} annual distribution`)
  }
}

function confidenceFor(holdings: ForecastHolding[]): ForecastConfidence {
  const reasons: string[] = []
  let score = 90
  if (holdings.length === 0) { score = 0; reasons.push('No holdings are available for forecasting.') }
  if (holdings.some(item => item.currentPrice === 0)) { score -= 20; reasons.push('One or more holdings have no current market price.') }
  if (holdings.some(item => item.annualDistributionPerShare === 0)) { score -= 15; reasons.push('One or more holdings have no annual distribution estimate.') }
  score = Math.max(0, Math.min(100, score))
  return { score, level: score >= 75 ? 'High' : score >= 45 ? 'Medium' : 'Low', reasons }
}

export function runForecast(
  holdings: ForecastHolding[],
  assumptions: ForecastAssumptions = defaultForecastAssumptions,
  generatedAt = new Date(),
): ForecastResult {
  validateForecastInput(holdings, assumptions)
  const warnings: string[] = []
  if (holdings.length === 0) warnings.push('Add portfolio holdings to generate a meaningful forecast.')

  const reinvestmentRate = assumptions.reinvestDistributions === false ? 0 : assumptions.reinvestmentRate / 100
  const monthlyDistributionGrowth = Math.pow(1 + assumptions.annualDistributionGrowthRate, 1 / MONTHS_PER_YEAR) - 1
  const monthlyPriceGrowth = Math.pow(1 + assumptions.annualPriceGrowthRate, 1 / MONTHS_PER_YEAR) - 1
  const monthlyInflation = Math.pow(1 + assumptions.inflationRate, 1 / MONTHS_PER_YEAR) - 1

  const state = holdings.map(item => ({ ...item }))
  const startingPortfolioValue = state.reduce((sum, item) => sum + item.shares * item.currentPrice, 0)
  const startingAnnualIncome = state.reduce((sum, item) => sum + item.shares * item.annualDistributionPerShare, 0)
  let cumulativeDistributions = 0
  let totalReinvested = 0
  let inflationIndex = 1
  const timeline: ForecastTimelinePoint[] = []
  const totalMonths = assumptions.horizonYears * MONTHS_PER_YEAR

  for (let month = 1; month <= totalMonths; month += 1) {
    let monthDistribution = 0
    for (const item of state) {
      item.currentPrice *= 1 + monthlyPriceGrowth
      item.annualDistributionPerShare *= 1 + monthlyDistributionGrowth
      const distribution = item.shares * item.annualDistributionPerShare / MONTHS_PER_YEAR
      monthDistribution += distribution
      const reinvested = distribution * reinvestmentRate
      if (item.currentPrice > 0) item.shares += reinvested / item.currentPrice
      totalReinvested += reinvested
    }
    cumulativeDistributions += monthDistribution
    inflationIndex *= 1 + monthlyInflation
    const portfolioValue = state.reduce((sum, item) => sum + item.shares * item.currentPrice, 0)
    const annualIncome = state.reduce((sum, item) => sum + item.shares * item.annualDistributionPerShare, 0)
    const pointDate = new Date(generatedAt)
    pointDate.setUTCMonth(pointDate.getUTCMonth() + month)
    timeline.push({
      month,
      date: pointDate.toISOString(),
      portfolioValue,
      annualIncome,
      monthlyIncome: annualIncome / MONTHS_PER_YEAR,
      weeklyIncome: annualIncome / WEEKS_PER_YEAR,
      cumulativeDistributions,
      reinvestedDistributions: totalReinvested,
      inflationAdjustedAnnualIncome: inflationIndex ? annualIncome / inflationIndex : annualIncome,
    })
  }

  const ending = timeline.at(-1)
  const endingPortfolioValue = ending?.portfolioValue ?? startingPortfolioValue
  const projectedAnnualIncome = ending?.annualIncome ?? startingAnnualIncome
  return {
    generatedAt: generatedAt.toISOString(),
    assumptions,
    summary: {
      startingPortfolioValue,
      endingPortfolioValue,
      startingAnnualIncome,
      projectedAnnualIncome,
      projectedMonthlyIncome: projectedAnnualIncome / MONTHS_PER_YEAR,
      projectedWeeklyIncome: projectedAnnualIncome / WEEKS_PER_YEAR,
      cumulativeDistributions,
      totalReinvested,
      projectedYield: endingPortfolioValue ? projectedAnnualIncome / endingPortfolioValue * 100 : 0,
      inflationAdjustedAnnualIncome: ending?.inflationAdjustedAnnualIncome ?? startingAnnualIncome,
    },
    confidence: confidenceFor(holdings),
    timeline,
    scenarios: [],
    warnings,
  }
}

export const ForecastEngine = { run: runForecast, validate: validateForecastInput }
