import type { Holding, PortfolioHistorySnapshot } from '../../types/portfolio'
import { calculatePortfolioMetrics } from '../../domain/portfolio/calculations'
import { calculatePortfolioHealth } from '../../domain/health/portfolioHealth'

export type { PortfolioHistorySnapshot } from '../../types/portfolio'

const STORAGE_KEY = 'edcp-portfolio-flight-recorder'

export function createPortfolioSnapshot(holdings: Holding[], weeklyGoal: number): PortfolioHistorySnapshot {
  const metrics = calculatePortfolioMetrics(holdings, weeklyGoal)
  const health = calculatePortfolioHealth(holdings, weeklyGoal)
  return {
    id: crypto.randomUUID(),
    capturedAt: new Date().toISOString(),
    portfolioValue: metrics.portfolioValue,
    annualIncome: metrics.annualIncome,
    weeklyIncome: metrics.weeklyIncome,
    yieldPct: metrics.yieldPct,
    healthScore: health.score,
    holdingsCount: holdings.length,
  }
}

export function loadPortfolioSnapshots(): PortfolioHistorySnapshot[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) as PortfolioHistorySnapshot[] : []
  } catch {
    return []
  }
}

export function savePortfolioSnapshot(snapshot: PortfolioHistorySnapshot): PortfolioHistorySnapshot[] {
  const existing = loadPortfolioSnapshots()
  const day = snapshot.capturedAt.slice(0, 10)
  const next = [...existing.filter((item) => item.capturedAt.slice(0, 10) !== day), snapshot].slice(-365)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
