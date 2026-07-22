import type { DecisionSimulation, CopilotPortfolioSnapshot } from './types'

export interface DecisionAssumptions { incomeChangePct:number; returnChangePct:number; reinvestPct:number; horizonYears:number; label:string }

export function runDecisionSimulation(portfolio:CopilotPortfolioSnapshot,a:DecisionAssumptions):DecisionSimulation{
  const annualIncome=portfolio.weeklyIncome*52
  const projectedIncome=annualIncome*(1+a.incomeChangePct/100)*(1+a.reinvestPct/100*0.35)
  const base=portfolio.marketValue*Math.pow(1.055,a.horizonYears)
  const projected=portfolio.marketValue*Math.pow(1+(5.5+a.returnChangePct)/100,a.horizonYears)+(projectedIncome*a.reinvestPct/100*a.horizonYears)
  const probability=Math.max(5,Math.min(95,70+a.returnChangePct*3+a.incomeChangePct*0.8))
  return {id:`decision-${Date.now()}`,prompt:a.label,scenario:a.label,baselineWeeklyIncome:portfolio.weeklyIncome,projectedWeeklyIncome:projectedIncome/52,baselineValueAtHorizon:base,projectedValueAtHorizon:projected,successProbability:probability,tradeoffs:[a.incomeChangePct<0?'Lower near-term distributions':'Higher modeled cash flow',a.reinvestPct>0?'Less spendable income today':'No reinvestment compounding',a.returnChangePct<0?'Conservative return assumption':'More optimistic return assumption']}
}
