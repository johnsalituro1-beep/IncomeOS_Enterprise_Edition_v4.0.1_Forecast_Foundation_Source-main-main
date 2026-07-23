import type { Holding } from '../../types/portfolio'
import { calculateIncomeOSScore } from '../operating-score/incomeOperatingSystemScore'
import { routeCopilotQuestion } from './copilotOrchestrator'

export type CopilotEvidence={label:string;value:string;source:'portfolio'|'model'|'etf-universe'}
export type CopilotResponse={intent:string;headline:string;answer:string;confidence:'high'|'medium'|'low';evidence:CopilotEvidence[];nextActions:string[];verifiedDataRequired:boolean}

export function answerCopilotQuestion(question:string,holdings:Holding[],weeklyGoal:number):CopilotResponse{
 const route=routeCopilotQuestion(question)
 const value=holdings.reduce((s,h)=>s+h.shares*h.currentPrice,0)
 const annual=holdings.reduce((s,h)=>s+h.shares*h.annualDistributionPerShare,0)
 const weekly=annual/52
 const largest=[...holdings].sort((a,b)=>b.shares*b.currentPrice-a.shares*a.currentPrice)[0]
 const score=calculateIncomeOSScore(holdings,weekly,weeklyGoal)
 const evidence:CopilotEvidence[]=[
  {label:'Portfolio value',value:value.toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}),source:'portfolio'},
  {label:'Modeled weekly income',value:weekly.toLocaleString('en-US',{style:'currency',currency:'USD'}),source:'model'},
  {label:'Income OS Score',value:`${score.total}/100 (${score.grade})`,source:'model'},
 ]
 if(route.intent==='risk') return {intent:route.intent,headline:'Your largest visible risk is concentration.',answer:`${largest?.ticker??'The largest holding'} is the biggest position by market value. The weakest score component is ${score.weakest.label.toLowerCase()} at ${Math.round(score.weakest.score)}.`,confidence:'high',evidence,nextActions:['Open the Digital Twin and reduce the largest position by 5–10%.','Compare the revised Income OS Score.'],verifiedDataRequired:false}
 if(route.intent==='scenario') return {intent:route.intent,headline:'A Digital Twin scenario is the safest way to test that change.',answer:'Create a clone of the current portfolio, apply the proposed capital or allocation change, and compare ending income, real portfolio value, and sustainability without changing the live portfolio.',confidence:'high',evidence,nextActions:['Open Digital Twin Studio.','Run base, recession, and bull cases.'],verifiedDataRequired:false}
 if(route.intent==='research') return {intent:route.intent,headline:'ETF research requires verified universe data.',answer:'The research engine can route and compare ETF records now, but live fund facts should remain labeled modeled until a verified provider feed is connected.',confidence:'medium',evidence,nextActions:['Open ETF Universe Foundation.','Import a verified provider master file.'],verifiedDataRequired:true}
 return {intent:route.intent,headline:'Income is below the current weekly target.',answer:`Modeled weekly income is ${weekly.toLocaleString('en-US',{style:'currency',currency:'USD'})}, or ${weeklyGoal?Math.round(weekly/weeklyGoal*100):0}% of the ${weeklyGoal.toLocaleString('en-US',{style:'currency',currency:'USD'})} goal.`,confidence:'high',evidence,nextActions:['Run a contribution scenario in Digital Twin Studio.','Review income concentration before increasing yield.'],verifiedDataRequired:false}
}
