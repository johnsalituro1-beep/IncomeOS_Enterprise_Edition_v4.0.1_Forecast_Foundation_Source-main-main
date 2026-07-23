import type { CopilotPortfolioSnapshot } from './types'

export interface AdvisorFinding { severity:'opportunity'|'watch'|'critical'; title:string; explanation:string; impact:string; action:string }

export function evaluatePortfolio(portfolio: CopilotPortfolioSnapshot): AdvisorFinding[] {
  const findings: AdvisorFinding[] = []
  const top = [...portfolio.holdings].sort((a,b)=>b.weight-a.weight)[0]
  if (top.weight >= 30) findings.push({severity:'critical',title:`${top.ticker} concentration`,explanation:`At ${top.weight}% of the portfolio, this holding can dominate income and NAV outcomes.`,impact:'High portfolio sensitivity',action:'Model a 5–10% reduction in Decision Studio'})
  const weightedRisk = portfolio.holdings.reduce((s,h)=>s+h.weight*h.risk,0)/100
  if (weightedRisk > 65) findings.push({severity:'watch',title:'Elevated weighted risk',explanation:`Modeled weighted risk is ${weightedRisk.toFixed(0)}/100.`,impact:'Greater drawdown and distribution-cut sensitivity',action:'Compare lower-risk substitutes'})
  findings.push({severity:'opportunity',title:'Reinvestment lever',explanation:'Partial reinvestment can improve long-range income resilience while preserving spendable cash flow.',impact:'Potentially stronger future income base',action:'Run 25%, 50%, and 75% reinvestment scenarios'})
  return findings
}

export function comparePortfolios(a: CopilotPortfolioSnapshot,b:CopilotPortfolioSnapshot){
  return {
    weeklyIncomeDelta:b.weeklyIncome-a.weeklyIncome,
    marketValueDelta:b.marketValue-a.marketValue,
    osScoreDelta:b.osScore-a.osScore,
    riskDelta:b.riskScore-a.riskScore,
    winner:b.osScore-a.osScore >= 0 ? b.name : a.name,
  }
}
