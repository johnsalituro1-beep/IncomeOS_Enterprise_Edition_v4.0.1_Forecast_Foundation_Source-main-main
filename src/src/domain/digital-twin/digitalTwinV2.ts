import type { Holding } from '../../types/portfolio'

export type MarketRegime = 'base' | 'recession' | 'high-inflation' | 'bull' | 'custom'
export type TwinPlan = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  sourcePortfolioValue: number
  assumptions: {
    years: number
    annualPriceGrowthPct: number
    annualDistributionGrowthPct: number
    reinvestmentPct: number
    monthlyContribution: number
    annualWithdrawalGrowthPct: number
    inflationPct: number
    startingAnnualWithdrawal: number
    oneTimeCapital: number
    marketRegime: MarketRegime
    firstYearShockPct: number
  }
}
export type TwinProjectionYear = {
  year: number
  nominalPortfolioValue: number
  realPortfolioValue: number
  annualIncome: number
  weeklyIncome: number
  reinvestedIncome: number
  withdrawnIncome: number
  contributions: number
  incomeCoveragePct: number
}
export type TwinProjection = {
  plan: TwinPlan
  timeline: TwinProjectionYear[]
  endingPortfolioValue: number
  endingRealValue: number
  endingWeeklyIncome: number
  totalWithdrawn: number
  totalContributed: number
  sustainabilityFlag: 'strong' | 'watch' | 'at-risk'
}

const regimeAdjustments: Record<MarketRegime, { growth: number; distribution: number; shock: number }> = {
  base: { growth: 0, distribution: 0, shock: 0 },
  recession: { growth: -3.5, distribution: -2.0, shock: -18 },
  'high-inflation': { growth: -1.5, distribution: 0.5, shock: -8 },
  bull: { growth: 3.0, distribution: 1.0, shock: 0 },
  custom: { growth: 0, distribution: 0, shock: 0 },
}

export function createTwinPlan(name: string, holdings: Holding[]): TwinPlan {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(), name, createdAt: now, updatedAt: now,
    sourcePortfolioValue: holdings.reduce((s,h)=>s+h.shares*h.currentPrice,0),
    assumptions: {
      years: 10, annualPriceGrowthPct: 4, annualDistributionGrowthPct: 2,
      reinvestmentPct: 30, monthlyContribution: 0, annualWithdrawalGrowthPct: 2.5,
      inflationPct: 2.5, startingAnnualWithdrawal: 0, oneTimeCapital: 0,
      marketRegime: 'base', firstYearShockPct: 0,
    },
  }
}

export function runDigitalTwinV2(plan: TwinPlan, holdings: Holding[]): TwinProjection {
  const r = regimeAdjustments[plan.assumptions.marketRegime]
  let value = holdings.reduce((s,h)=>s+h.shares*h.currentPrice,0) + plan.assumptions.oneTimeCapital
  let annualIncome = holdings.reduce((s,h)=>s+h.shares*h.annualDistributionPerShare,0)
  let annualWithdrawal = plan.assumptions.startingAnnualWithdrawal
  let inflationIndex = 1
  let totalWithdrawn = 0
  let totalContributed = plan.assumptions.oneTimeCapital
  const timeline: TwinProjectionYear[] = []

  for (let year=1; year<=plan.assumptions.years; year++) {
    const shock = year===1 ? plan.assumptions.firstYearShockPct + r.shock : 0
    value *= 1 + shock/100
    const grossIncome = annualIncome
    const plannedWithdrawal = annualWithdrawal || grossIncome * (1-plan.assumptions.reinvestmentPct/100)
    const withdrawnIncome = Math.min(grossIncome, Math.max(0, plannedWithdrawal))
    const reinvestedIncome = Math.max(0, grossIncome-withdrawnIncome)
    const contributions = plan.assumptions.monthlyContribution*12
    const growth = plan.assumptions.annualPriceGrowthPct+r.growth
    value = Math.max(0,(value+reinvestedIncome+contributions)*(1+growth/100))
    const currentYield = value>0 ? grossIncome/Math.max(value-reinvestedIncome-contributions,1) : 0
    annualIncome = Math.max(0, grossIncome*(1+(plan.assumptions.annualDistributionGrowthPct+r.distribution)/100) + (reinvestedIncome+contributions)*currentYield)
    annualWithdrawal *= 1+plan.assumptions.annualWithdrawalGrowthPct/100
    inflationIndex *= 1+plan.assumptions.inflationPct/100
    totalWithdrawn += withdrawnIncome
    totalContributed += contributions
    timeline.push({
      year,
      nominalPortfolioValue:value,
      realPortfolioValue:value/inflationIndex,
      annualIncome,
      weeklyIncome:annualIncome/52,
      reinvestedIncome,
      withdrawnIncome,
      contributions,
      incomeCoveragePct: plannedWithdrawal>0 ? annualIncome/plannedWithdrawal*100 : 100,
    })
  }
  const last=timeline.at(-1)!
  const coverage=last.incomeCoveragePct
  return {
    plan, timeline, endingPortfolioValue:last.nominalPortfolioValue, endingRealValue:last.realPortfolioValue,
    endingWeeklyIncome:last.weeklyIncome,totalWithdrawn,totalContributed,
    sustainabilityFlag: coverage>=120?'strong':coverage>=90?'watch':'at-risk',
  }
}

export function compareTwinProjections(projections: TwinProjection[]) {
  return [...projections].sort((a,b)=>b.endingPortfolioValue-a.endingPortfolioValue).map((p,index)=>({
    rank:index+1,id:p.plan.id,name:p.plan.name,endingValue:p.endingPortfolioValue,
    endingWeeklyIncome:p.endingWeeklyIncome,totalWithdrawn:p.totalWithdrawn,
    sustainability:p.sustainabilityFlag,
  }))
}
