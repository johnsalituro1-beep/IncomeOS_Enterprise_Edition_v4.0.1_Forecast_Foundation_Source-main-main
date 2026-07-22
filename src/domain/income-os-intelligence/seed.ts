import { calculateIncomeOSAssessment, prioritizeRecommendations } from './engine'
import type { IncomeOSInputs, ScoreTimelinePoint } from './types'

export const demoIncomeOSInputs: IncomeOSInputs = {
  weeklyIncome: 1845,
  weeklyIncomeGoal: 2000,
  annualIncomeGrowth: 3.4,
  projectedCoverageYears: 18.6,
  largestHoldingWeight: 26,
  topThreeWeight: 61,
  sectorConcentration: 38,
  drawdownEstimate: 31,
  cashBufferMonths: 5.5,
  holdings: [
    { ticker:'EDGQ', weight:.25, distributionYield:13, distributionReliability:79, volatility:25, liquidity:66, expenseRatio:.53, dataQuality:82 },
    { ticker:'EDGX', weight:.20, distributionYield:12, distributionReliability:78, volatility:24, liquidity:65, expenseRatio:.53, dataQuality:82 },
    { ticker:'KYLD', weight:.20, distributionYield:22, distributionReliability:73, volatility:31, liquidity:62, expenseRatio:.99, dataQuality:78 },
    { ticker:'XDTE', weight:.18, distributionYield:24, distributionReliability:76, volatility:29, liquidity:81, expenseRatio:.95, dataQuality:89 },
    { ticker:'BCCC', weight:.17, distributionYield:28, distributionReliability:68, volatility:37, liquidity:58, expenseRatio:1.15, dataQuality:74 },
  ],
}

export const demoAssessment = calculateIncomeOSAssessment(demoIncomeOSInputs)
export const demoRecommendations = prioritizeRecommendations(demoAssessment)
export const demoTimeline: ScoreTimelinePoint[] = [
  {date:'Jan',overall:66,incomeSustainability:64,resilience:58,diversification:62,goalAlignment:81},
  {date:'Feb',overall:67,incomeSustainability:66,resilience:59,diversification:63,goalAlignment:84,event:'Reinvested 25% of distributions'},
  {date:'Mar',overall:65,incomeSustainability:63,resilience:55,diversification:61,goalAlignment:86,event:'Income fund drawdown'},
  {date:'Apr',overall:69,incomeSustainability:68,resilience:60,diversification:65,goalAlignment:89,event:'Reduced largest position'},
  {date:'May',overall:71,incomeSustainability:70,resilience:63,diversification:67,goalAlignment:91},
  {date:'Jun',overall:73,incomeSustainability:72,resilience:65,diversification:69,goalAlignment:92,event:'Cash buffer increased'},
]
