import { STRATEGY_CANDIDATES } from './candidates'
import type { ConstraintCheck, GeneratedStrategy, StrategyAllocation, StrategyBuilderProfile, StrategyCandidate, StrategyConstraints, StrategyTemplate } from './types'

const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(n)))
const sum=(values:number[])=>values.reduce((a,b)=>a+b,0)

function buildAllocations(template:StrategyTemplate, capital:number):StrategyAllocation[]{
  const entries=Object.entries(template.categoryTargets) as Array<[StrategyCandidate['category'],number]>
  const rows:StrategyAllocation[]=[]
  entries.forEach(([category,target])=>{
    const matches=STRATEGY_CANDIDATES.filter(c=>c.category===category)
    if(!matches.length||!target)return
    const split=target/matches.length
    matches.forEach(candidate=>rows.push({...candidate,allocationPct:split,dollars:capital*split/100,annualIncome:capital*split/100*candidate.modeledYieldPct/100}))
  })
  const allocated=sum(rows.map(r=>r.allocationPct));
  if(allocated<100){const fallback=STRATEGY_CANDIDATES[0];const pct=100-allocated;rows.push({...fallback,allocationPct:pct,dollars:capital*pct/100,annualIncome:capital*pct/100*fallback.modeledYieldPct/100})}
  return rows.sort((a,b)=>b.allocationPct-a.allocationPct)
}

function weightedAverage(rows:StrategyAllocation[],key:'modeledYieldPct'|'modeledGrowthPct'|'stabilityScore'|'riskScore'|'expenseRatioPct'){
  return rows.reduce((total,row)=>total+row[key]*row.allocationPct/100,0)
}

function constraintChecks(rows:StrategyAllocation[], constraints:StrategyConstraints):ConstraintCheck[]{
  const covered=sum(rows.filter(r=>r.coveredCall).map(r=>r.allocationPct))
  const fixed=sum(rows.filter(r=>r.fixedIncome).map(r=>r.allocationPct))
  const growth=sum(rows.filter(r=>r.growthAsset).map(r=>r.allocationPct))
  const maxEtf=Math.max(...rows.map(r=>r.allocationPct),0)
  const issuerMap=new Map<string,number>(); const sectorMap=new Map<string,number>()
  rows.forEach(r=>{issuerMap.set(r.issuer,(issuerMap.get(r.issuer)||0)+r.allocationPct);sectorMap.set(r.sector,(sectorMap.get(r.sector)||0)+r.allocationPct)})
  const maxIssuer=Math.max(...issuerMap.values(),0), maxSector=Math.max(...sectorMap.values(),0)
  return [
    {label:'Minimum holdings',passed:rows.length>=constraints.minimumHoldings,actual:rows.length,limit:constraints.minimumHoldings,unit:'count'},
    {label:'Maximum single ETF',passed:maxEtf<=constraints.maximumSingleEtfPct,actual:maxEtf,limit:constraints.maximumSingleEtfPct,unit:'%'},
    {label:'Maximum single issuer',passed:maxIssuer<=constraints.maximumSingleIssuerPct,actual:maxIssuer,limit:constraints.maximumSingleIssuerPct,unit:'%'},
    {label:'Maximum covered-call exposure',passed:covered<=constraints.maximumCoveredCallPct,actual:covered,limit:constraints.maximumCoveredCallPct,unit:'%'},
    {label:'Minimum growth allocation',passed:growth>=constraints.minimumGrowthPct,actual:growth,limit:constraints.minimumGrowthPct,unit:'%'},
    {label:'Minimum fixed-income allocation',passed:fixed>=constraints.minimumFixedIncomePct,actual:fixed,limit:constraints.minimumFixedIncomePct,unit:'%'},
    {label:'Maximum sector exposure',passed:maxSector<=constraints.maximumSectorPct,actual:maxSector,limit:constraints.maximumSectorPct,unit:'%'},
  ]
}

function project(profile:StrategyBuilderProfile, annualYieldPct:number, growthPct:number){
  let value=Math.max(0,profile.investableCapital), cash=0, reinvested=0
  return Array.from({length:profile.horizonYears},(_,index)=>{
    const annualIncome=value*annualYieldPct/100; const reinvest=annualIncome*profile.reinvestmentPct/100; const cashIncome=annualIncome-reinvest
    cash+=cashIncome; reinvested+=reinvest; value=Math.max(0,value*(1+growthPct/100)+reinvest+profile.monthlyContribution*12)
    return {year:index+1,portfolioValue:value,annualIncome,weeklyIncome:annualIncome/52,cumulativeCashIncome:cash,cumulativeReinvestedIncome:reinvested}
  })
}

export function generateStrategy(template:StrategyTemplate,profile:StrategyBuilderProfile,constraints:StrategyConstraints):GeneratedStrategy{
  const allocations=buildAllocations(template,profile.investableCapital)
  const yieldPct=weightedAverage(allocations,'modeledYieldPct'), growthPct=weightedAverage(allocations,'modeledGrowthPct')
  const stability=weightedAverage(allocations,'stabilityScore'), risk=weightedAverage(allocations,'riskScore')
  const annualIncome=profile.investableCapital*yieldPct/100, weeklyIncome=annualIncome/52, annualTarget=profile.targetWeeklyIncome*52
  const goalProgress=annualTarget?annualIncome/annualTarget*100:100
  const checks=constraintChecks(allocations,constraints); const passRate=checks.filter(c=>c.passed).length/checks.length*100
  const categories=new Set(allocations.map(a=>a.category)).size, issuers=new Set(allocations.map(a=>a.issuer)).size
  const incomeScore=clamp(yieldPct/Math.max(1,annualTarget/profile.investableCapital*100)*100)
  const growthScore=clamp(50+growthPct*7)
  const diversification=clamp(categories*11+issuers*6-Math.max(0,Math.max(...allocations.map(a=>a.allocationPct))-25)*2)
  const riskTarget=profile.riskTolerance==='Conservative'?25:profile.riskTolerance==='Moderate'?45:profile.riskTolerance==='Growth'?58:72
  const riskFit=clamp(100-Math.abs(risk-riskTarget)*2)
  const alignment=clamp(goalProgress*.55+passRate*.45)
  const overall=clamp(incomeScore*profile.incomePriority/100*.3+growthScore*profile.growthPriority/100*.3+diversification*.15+stability*.1+riskFit*.1+alignment*.35)
  const observations=[
    weeklyIncome>=profile.targetWeeklyIncome?`Modeled weekly income exceeds the target by $${Math.round(weeklyIncome-profile.targetWeeklyIncome).toLocaleString()}.`:`Modeled weekly income is $${Math.round(profile.targetWeeklyIncome-weeklyIncome).toLocaleString()} below the target.`,
    checks.every(c=>c.passed)?'All selected portfolio constraints are satisfied.':`${checks.filter(c=>!c.passed).length} selected constraint(s) require review.`,
    allocations.filter(a=>a.coveredCall).reduce((s,a)=>s+a.allocationPct,0)>35?'The strategy relies materially on covered-call income, which may limit upside participation.':'Covered-call exposure remains within a moderate range.',
    growthPct<2?'Modeled capital growth is limited; income sustainability should be monitored carefully.':'The allocation retains a modeled long-term growth component.',
  ]
  return {id:template.id,name:template.name,description:template.description,allocations,scores:{incomePotential:incomeScore,growthPotential:growthScore,diversification,incomeStability:clamp(stability),riskFit,goalAlignment:alignment,overall},checks,projectedAnnualIncome:annualIncome,projectedWeeklyIncome:weeklyIncome,modeledYieldPct:yieldPct,modeledGrowthPct:growthPct,goalProgressPct:goalProgress,incomeGapAnnual:Math.max(0,annualTarget-annualIncome),projection:project(profile,yieldPct,growthPct),observations}
}

export function rankStrategies(templates:StrategyTemplate[],profile:StrategyBuilderProfile,constraints:StrategyConstraints){
  return templates.map(t=>generateStrategy(t,profile,constraints)).sort((a,b)=>b.scores.overall-a.scores.overall)
}
