import type { Holding } from '../../types/portfolio'
import { analyzePortfolioIntelligence } from '../portfolio-intelligence/intelligenceEngineV2'

export type OSScoreComponent={key:string;label:string;score:number;weight:number;contribution:number;explanation:string;nextStep:string}
export type IncomeOSScoreV2={total:number;grade:string;confidence:'modeled'|'provider'|'verified';components:OSScoreComponent[];headline:string;priority:string}
const clamp=(n:number)=>Math.max(0,Math.min(100,n))
export function calculateIncomeOSScoreV2(holdings:Holding[],weeklyGoal:number):IncomeOSScoreV2{
 const intel=analyzePortfolioIntelligence(holdings)
 const goal=weeklyGoal?clamp(intel.income.weekly/weeklyGoal*100):50
 const map=new Map(intel.metrics.map(m=>[m.key,m]))
 const definitions:[string,string,number,number,string,string][]=[
  ['sustainability','Income Sustainability',map.get('income-stability')?.score??50,.15,'How durable modeled income may be through changing conditions.','Lower dependence on extreme yields.'],
  ['growth','Income & Capital Growth',map.get('growth')?.score??50,.11,'Capacity for income and principal to compound over time.','Add uncapped growth exposure.'],
  ['diversification','Diversification',map.get('diversification')?.score??50,.14,'Position and strategy breadth.','Reduce concentration and add different return drivers.'],
  ['resilience','Resilience',map.get('resilience')?.score??50,.12,'Ability to absorb portfolio and distribution stress.','Run stress tests and establish allocation guardrails.'],
  ['cashflow','Cash-Flow Reliability',map.get('cashflow')?.score??50,.11,'Consistency and breadth of modeled payments.','Diversify payers, not only frequencies.'],
  ['quality','Distribution Quality',map.get('distribution-quality')?.score??50,.11,'Quality of the strategies producing portfolio income.','Balance option and volatile-asset income with conventional sources.'],
  ['risk','Risk Balance',map.get('drawdown')?.score??50,.10,'Balance between income ambition and downside exposure.','Add a resilient core sleeve.'],
  ['goal','Goal Alignment',goal,.10,'Progress toward the weekly income objective.','Adjust capital, timeline, or target while preserving risk limits.'],
  ['efficiency','Expense Efficiency',68,.04,'Placeholder until verified expense-ratio data is available.','Connect verified expense data and remove redundant high-cost exposure.'],
  ['tax','Tax Awareness',50,.02,'Neutral until account type and distribution tax character are known.','Add account and distribution-character data.'],
 ]
 const components=definitions.map(([key,label,score,weight,explanation,nextStep])=>({key,label,score:Math.round(score),weight,contribution:score*weight,explanation,nextStep}))
 const total=Math.round(components.reduce((s,c)=>s+c.contribution,0))
 const weakest=[...components].sort((a,b)=>a.score-b.score)[0]
 return {total,grade:total>=90?'A':total>=80?'B':total>=70?'C':total>=60?'D':'F',confidence:'modeled',components,headline:`Income OS Score ${total}/100 (${total>=80?'strong':total>=70?'balanced':total>=60?'watch':'at risk'})`,priority:`Priority improvement: ${weakest.label}. ${weakest.nextStep}`}
}
