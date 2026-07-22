import type { Holding } from '../../types/portfolio'
import { calculatePortfolioMetrics } from '../portfolio/calculations'

export type HealthDimension = {
  id: 'diversification' | 'incomeStability' | 'yieldSustainability' | 'cashFlowConsistency' | 'growthBalance' | 'expenseEfficiency'
  label: string
  score: number
  weight: number
  explanation: string
}

export type PortfolioHealthResult = {
  score: number
  grade: 'Excellent' | 'Strong' | 'Balanced' | 'Watch' | 'High Risk'
  dimensions: HealthDimension[]
  strongest: HealthDimension
  weakest: HealthDimension
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

export function calculatePortfolioHealth(holdings: Holding[], weeklyGoal: number): PortfolioHealthResult {
  const metrics = calculatePortfolioMetrics(holdings, weeklyGoal)
  const categories = new Set(holdings.map((holding) => holding.category)).size
  const frequencies = new Set(holdings.map((holding) => holding.paymentFrequency)).size
  const diversification = clamp(100 - Math.max(0, metrics.largestHoldingWeight - 20) * 2.2 + Math.min(categories * 5, 20))
  const incomeStability = clamp(55 + Math.min(holdings.length * 5, 20) + Math.min(frequencies * 7, 21) - Math.max(0, metrics.largestIncomeWeight - 30) * 1.2)
  const yieldSustainability = clamp(metrics.yieldPct <= 12 ? 92 : metrics.yieldPct <= 18 ? 78 : metrics.yieldPct <= 25 ? 58 : 38)
  const cashFlowConsistency = clamp(62 + holdings.filter((holding) => holding.paymentFrequency === 'Weekly').length * 6 - Math.max(0, metrics.largestIncomeWeight - 35))
  const growthBalance = clamp(88 - metrics.coveredCallWeight * .55 + holdings.filter((holding) => !holding.category.toLowerCase().includes('covered')).length * 3)
  const expenseEfficiency = 76 // placeholder until the ETF knowledge base is connected to live expense data

  const dimensions: HealthDimension[] = [
    { id: 'diversification', label: 'Diversification', score: diversification, weight: .22, explanation: 'Position size and strategy-category distribution.' },
    { id: 'incomeStability', label: 'Income Stability', score: incomeStability, weight: .22, explanation: 'Income-source breadth and payment-frequency diversity.' },
    { id: 'yieldSustainability', label: 'Yield Sustainability', score: yieldSustainability, weight: .20, explanation: 'Forward yield assessed against escalating monitoring thresholds.' },
    { id: 'cashFlowConsistency', label: 'Cash-Flow Consistency', score: cashFlowConsistency, weight: .16, explanation: 'Frequency and concentration of projected distributions.' },
    { id: 'growthBalance', label: 'Growth Balance', score: growthBalance, weight: .14, explanation: 'Balance between income-maximizing and upside-participating strategies.' },
    { id: 'expenseEfficiency', label: 'Expense Efficiency', score: expenseEfficiency, weight: .06, explanation: 'Initial neutral estimate pending complete fund-expense integration.' },
  ]
  const score = Math.round(dimensions.reduce((total, dimension) => total + dimension.score * dimension.weight, 0))
  const grade = score >= 90 ? 'Excellent' : score >= 80 ? 'Strong' : score >= 70 ? 'Balanced' : score >= 55 ? 'Watch' : 'High Risk'
  const strongest = [...dimensions].sort((a, b) => b.score - a.score)[0]
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0]
  return { score, grade, dimensions, strongest, weakest }
}
