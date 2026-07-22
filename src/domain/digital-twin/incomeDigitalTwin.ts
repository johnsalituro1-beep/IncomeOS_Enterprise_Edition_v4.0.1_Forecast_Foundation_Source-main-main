import type { Holding } from '../../types/portfolio'
export type TwinAssumptions={years:number; annualGrowthPct:number; distributionGrowthPct:number; reinvestPct:number; monthlyContribution:number; stressDrawdownPct:number}
export type TwinYear={year:number; portfolioValue:number; annualIncome:number; withdrawnIncome:number; reinvestedIncome:number}
export type TwinScenario={id:string;name:string;createdAt:string;assumptions:TwinAssumptions;timeline:TwinYear[];endingValue:number;endingWeeklyIncome:number}
export function runIncomeDigitalTwin(name:string, holdings:Holding[], a:TwinAssumptions):TwinScenario{
 let value=holdings.reduce((s,h)=>s+h.shares*h.currentPrice,0)*(1-a.stressDrawdownPct/100)
 let annualIncome=holdings.reduce((s,h)=>s+h.shares*h.annualDistributionPerShare,0)
 const timeline:TwinYear[]=[]
 for(let year=1;year<=a.years;year++){
  const reinvested=annualIncome*a.reinvestPct/100
  const withdrawn=annualIncome-reinvested
  value=(value+reinvested+a.monthlyContribution*12)*(1+a.annualGrowthPct/100)
  annualIncome=annualIncome*(1+a.distributionGrowthPct/100)+reinvested*(annualIncome/Math.max(1,value))
  timeline.push({year,portfolioValue:value,annualIncome,withdrawnIncome:withdrawn,reinvestedIncome:reinvested})
 }
 return {id:crypto.randomUUID(),name,createdAt:new Date().toISOString(),assumptions:a,timeline,endingValue:value,endingWeeklyIncome:annualIncome/52}
}
