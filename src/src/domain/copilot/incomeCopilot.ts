import type { Holding } from '../../types/portfolio'
import { buildMissionAlerts } from '../mission-control/missionControl'

export type CopilotAnswer = { headline:string; answer:string; evidence:string[]; confidence:'High'|'Medium'|'Low'; suggestedAction?:string }

export function askIncomeCopilot(question:string, holdings:Holding[], weeklyIncome:number, weeklyGoal:number):CopilotAnswer {
  const q=question.toLowerCase(); const total=holdings.reduce((s,h)=>s+h.shares*h.currentPrice,0)
  const annual=weeklyIncome*52
  const incomeByHolding=holdings.map(h=>({ticker:h.ticker,income:h.shares*h.annualDistributionPerShare,value:h.shares*h.currentPrice})).sort((a,b)=>b.income-a.income)
  const alerts=buildMissionAlerts(holdings,weeklyIncome,weeklyGoal)
  if(q.includes('biggest')&&q.includes('risk')) return {headline:'Largest current risk',answer:alerts.find(a=>a.severity==='risk')?.detail||alerts.find(a=>a.severity==='watch')?.detail||'No rule-based concentration warning is currently triggered.',evidence:alerts.map(a=>`${a.source}: ${a.detail}`),confidence:'Medium',suggestedAction:'Review allocation limits in Strategy Builder before making changes.'}
  if(q.includes('most')&&q.includes('income')) return {headline:`${incomeByHolding[0]?.ticker||'No holding'} contributes the most income`,answer:incomeByHolding[0]?`${incomeByHolding[0].ticker} contributes approximately $${incomeByHolding[0].income.toLocaleString(undefined,{maximumFractionDigits:0})} per year.`:'No holdings are available.',evidence:incomeByHolding.slice(0,3).map(x=>`${x.ticker}: $${x.income.toFixed(0)} annual modeled income`),confidence:'High'}
  if(q.includes('goal')||q.includes('target')) return {headline:'Income goal status',answer:`Modeled weekly income is $${weeklyIncome.toFixed(0)}, or ${(weeklyIncome/weeklyGoal*100).toFixed(1)}% of the $${weeklyGoal.toLocaleString()} goal.`,evidence:[`Annualized income: $${annual.toFixed(0)}`,`Portfolio value: $${total.toFixed(0)}`,`Remaining weekly gap: $${Math.max(0,weeklyGoal-weeklyIncome).toFixed(0)}`],confidence:'High'}
  return {headline:'Portfolio briefing',answer:`The portfolio is modeled at $${total.toLocaleString(undefined,{maximumFractionDigits:0})} with $${weeklyIncome.toFixed(0)} in weekly income. ${alerts[0]?.detail||''}`,evidence:alerts.slice(0,3).map(a=>`${a.title}: ${a.detail}`),confidence:'Medium',suggestedAction:'Ask about your biggest risk, top income contributor, or goal progress.'}
}
