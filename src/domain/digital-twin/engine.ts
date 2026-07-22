import type { MonteCarloResult, ProjectionPoint, TwinProjection, TwinScenario } from './types'

const weighted = (scenario: TwinScenario, key: 'annualYield'|'annualGrowth'|'volatility'|'expenseRatio') => {
  const total = scenario.holdings.reduce((s,h)=>s+h.value,0) || 1
  return scenario.holdings.reduce((s,h)=>s+(h.value/total)*h[key],0)
}

export function projectScenario(scenario: TwinScenario): TwinProjection {
  const a = scenario.assumptions
  const yieldRate = weighted(scenario,'annualYield')
  const growthRate = weighted(scenario,'annualGrowth') - weighted(scenario,'expenseRatio')
  let value = scenario.holdings.reduce((s,h)=>s+h.value,0)
  let totalIncome = 0, totalWithdrawals = 0
  const points: ProjectionPoint[] = []
  for (let year=1; year<=a.years; year++) {
    const openingValue = value
    const age = a.startAge + year
    const retired = age >= a.retirementAge
    const recurringEvents = scenario.events.filter(e => e.year === year || e.recurring)
    const eventContribution = recurringEvents.filter(e=>e.type==='contribution'||e.type==='income').reduce((s,e)=>s+e.amount,0)
    const eventWithdrawal = recurringEvents.filter(e=>e.type==='withdrawal'||e.type==='expense').reduce((s,e)=>s+e.amount,0)
    const contributions = a.annualContribution + eventContribution
    const distributions = Math.max(0, openingValue * yieldRate)
    const taxes = distributions * a.taxRate
    const reinvested = (distributions - taxes) * a.reinvestmentRate
    const withdrawals = (retired ? a.annualWithdrawal : 0) + eventWithdrawal
    const shock = a.sequenceShockYear === year ? (a.sequenceShockPct ?? 0) : 0
    const growth = openingValue * (growthRate + shock)
    value = Math.max(0, openingValue + contributions + reinvested + growth - withdrawals)
    const realValue = value / Math.pow(1+a.inflation, year)
    totalIncome += distributions
    totalWithdrawals += withdrawals
    points.push({year,age,openingValue,contributions,distributions,reinvested,withdrawals,taxes,growth,closingValue:value,realValue})
  }
  const drawdownYears = points.filter(p=>p.closingValue < p.openingValue).length
  const sustainabilityScore = Math.max(0, Math.min(100, Math.round(100 - drawdownYears*4 - (value===0?45:0) + (value > points[0].openingValue?10:0))))
  return {scenarioId:scenario.id,points,endingValue:value,endingRealValue:points.at(-1)?.realValue??value,totalIncome,totalWithdrawals,sustainabilityScore,goalStatus:sustainabilityScore>=80?'on-track':sustainabilityScore>=60?'watch':'at-risk'}
}

function mulberry32(seed:number){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function normal(rand:()=>number){const u=Math.max(rand(),1e-9),v=Math.max(rand(),1e-9);return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}

export function runMonteCarlo(scenario:TwinScenario,trials=1000,seed=20260721):MonteCarloResult{
  const rand=mulberry32(seed), baseGrowth=weighted(scenario,'annualGrowth')-weighted(scenario,'expenseRatio'), vol=weighted(scenario,'volatility')
  const endings:number[]=[]
  for(let t=0;t<trials;t++){
    const clone: TwinScenario = JSON.parse(JSON.stringify(scenario))
    let value=clone.holdings.reduce((s,h)=>s+h.value,0)
    for(let y=1;y<=clone.assumptions.years;y++){
      const age=clone.assumptions.startAge+y, retired=age>=clone.assumptions.retirementAge
      const distribution=value*weighted(clone,'annualYield')
      const afterTax=distribution*(1-clone.assumptions.taxRate)
      const reinvest=afterTax*clone.assumptions.reinvestmentRate
      const withdrawal=retired?clone.assumptions.annualWithdrawal:0
      value=Math.max(0,value+clone.assumptions.annualContribution+reinvest+value*(baseGrowth+normal(rand)*vol)-withdrawal)
    }
    endings.push(value)
  }
  endings.sort((a,b)=>a-b)
  const initial=scenario.holdings.reduce((s,h)=>s+h.value,0)
  return {successRate:Math.round(endings.filter(v=>v>initial*.5).length/trials*100),medianEndingValue:endings[Math.floor(trials*.5)],percentile10:endings[Math.floor(trials*.1)],percentile90:endings[Math.floor(trials*.9)],trials}
}
