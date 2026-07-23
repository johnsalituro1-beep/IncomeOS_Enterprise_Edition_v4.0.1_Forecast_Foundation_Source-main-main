import type { ExecutiveBrief } from './types'

export function buildExecutiveBrief(input:{ score:number; scoreTrend:number; weeklyIncome:number; weeklyTarget:number; confidence:number; optimizedIncome?:number; scenarioSuccess?:number }):ExecutiveBrief {
  const coverage = (input.weeklyIncome/Math.max(1,input.weeklyTarget))*100
  const gap = Math.max(0,input.weeklyTarget-input.weeklyIncome)
  return {
    generatedAt:new Date().toISOString(),
    headline: coverage>=100 ? 'Income objective is currently funded' : 'Portfolio is progressing toward the income objective',
    summary:`Income OS Score is ${input.score} (${input.scoreTrend>=0?'+':''}${input.scoreTrend} trend). Weekly income covers ${coverage.toFixed(1)}% of the stated goal.`,
    kpis:[
      {key:'score',label:'Income OS Score',value:String(input.score),status:input.score>=75?'positive':input.score>=60?'watch':'negative',detail:'Composite, confidence-aware portfolio score'},
      {key:'income',label:'Weekly Income',value:`$${input.weeklyIncome.toLocaleString()}`,status:coverage>=100?'positive':'watch',detail:`$${gap.toLocaleString()} remaining to target`},
      {key:'confidence',label:'Evidence Confidence',value:`${input.confidence}%`,status:input.confidence>=85?'positive':input.confidence>=70?'watch':'negative',detail:'Share of decision inputs with adequate evidence'},
      {key:'scenario',label:'Scenario Success',value:`${input.scenarioSuccess??0}%`,status:(input.scenarioSuccess??0)>=75?'positive':'watch',detail:'Modeled probability, not a guarantee'}
    ],
    priorities:['Verify provider records before production decisions','Review concentration and resilience recommendations','Compare the optimized allocation in Decision Studio'],
    risks:['Modeled market assumptions can diverge from actual outcomes','Live licensed ETF data is not included in this offline package'],
    scenarioHighlights:[input.optimizedIncome?`Optimization model projects an income score of ${input.optimizedIncome}.`:'Optimization has not been run.'],
    evidenceCoverage:input.confidence
  }
}
