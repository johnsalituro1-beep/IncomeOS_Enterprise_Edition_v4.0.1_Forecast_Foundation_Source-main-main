import type { TwinScenario } from './types'
const baseHoldings=[
 {ticker:'EDGQ',value:100000,annualYield:.13,annualGrowth:.065,volatility:.18,expenseRatio:.0053},
 {ticker:'EDGX',value:100000,annualYield:.12,annualGrowth:.07,volatility:.19,expenseRatio:.0053},
 {ticker:'XDTE',value:50000,annualYield:.22,annualGrowth:.02,volatility:.16,expenseRatio:.0095},
]
export const TWIN_SCENARIOS:TwinScenario[]=[
 {id:'current',name:'Current Income Plan',kind:'current',holdings:baseHoldings,assumptions:{startAge:50,retirementAge:58,years:25,inflation:.025,taxRate:.18,reinvestmentRate:.35,annualContribution:12000,annualWithdrawal:104000},events:[]},
 {id:'retirement',name:'Retire at 58',kind:'retirement',holdings:baseHoldings,assumptions:{startAge:50,retirementAge:58,years:30,inflation:.025,taxRate:.18,reinvestmentRate:.5,annualContribution:18000,annualWithdrawal:90000},events:[{id:'ss',year:17,amount:30000,type:'income',label:'Social Security',recurring:true}]},
 {id:'stress',name:'Early Crash Stress Test',kind:'stress',holdings:baseHoldings,assumptions:{startAge:50,retirementAge:58,years:25,inflation:.03,taxRate:.2,reinvestmentRate:.3,annualContribution:10000,annualWithdrawal:104000,sequenceShockYear:2,sequenceShockPct:-.28},events:[]},
]
