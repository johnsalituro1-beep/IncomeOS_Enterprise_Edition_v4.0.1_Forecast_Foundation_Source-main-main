import type { Holding } from '../../types/portfolio'
import type { ForecastHolding } from '../../types/forecast'

export function portfolioHoldingsToForecastHoldings(holdings: Holding[]): ForecastHolding[] {
  return holdings.map(holding => ({
    ticker: holding.ticker,
    shares: holding.shares,
    currentPrice: holding.currentPrice,
    annualDistributionPerShare: holding.annualDistributionPerShare,
    costBasis: holding.averageCost,
  }))
}
