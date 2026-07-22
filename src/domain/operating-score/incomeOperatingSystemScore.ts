import type { Holding } from '../../types/portfolio'

export type ScoreDimension = { key:string; label:string; score:number; weight:number; explanation:string; improvement:string }
export type IncomeOSScore = { total:number; grade:string; dimensions:ScoreDimension[]; strongest:ScoreDimension; weakest:ScoreDimension }

const clamp=(n:number)=>Math.max(0,Math.min(100,n))
export function calculateIncomeOSScore(holdings:Holding[], weeklyIncome:number, weeklyGoal:number):IncomeOSScore{
 const value=holdings.reduce((s,h)=>s+h.shares*h.currentPrice,0)
 const annual=holdings.reduce((s,h)=>s+h.shares*h.annualDistributionPerShare,0)
 const weights=holdings.map(h=>value? h.shares*h.currentPrice/value:0)
 const maxWeight=Math.max(0,...weights)
 const categories=new Set(holdings.map(h=>h.category)).size
 const weeklyShare=value?holdings.filter(h=>h.paymentFrequency==='Weekly').reduce((s,h)=>s+h.shares*h.currentPrice,0)/value:0
 const expenseProxy=holdings.length>=5?88:holdings.length>=3?78:62
 const goal=weeklyGoal?clamp(weeklyIncome/weeklyGoal*100):50
 const dims:ScoreDimension[]=[
  {key:'sustainability',label:'Income Sustainability',score:clamp(100-Math.max(0,(annual/value*100-10))*5),weight:.16,explanation:'Rewards income that is meaningful without relying on an extreme modeled portfolio yield.',improvement:'Reduce dependence on unusually high distribution rates.'},
  {key:'growth',label:'Income Growth',score:clamp(45+categories*7),weight:.11,explanation:'Uses strategy breadth as an offline proxy for multiple future income-growth drivers.',improvement:'Add durable dividend-growth or total-return exposure.'},
  {key:'diversification',label:'Diversification',score:clamp(100-maxWeight*120+categories*6),weight:.14,explanation:'Measures single-position concentration and category breadth.',improvement:'Reduce the largest position or add genuinely different exposures.'},
  {key:'resilience',label:'Portfolio Resilience',score:clamp(82-maxWeight*55+(categories-1)*4),weight:.11,explanation:'Estimates how well the portfolio can absorb stress without one holding dominating outcomes.',improvement:'Add defensive and lower-correlation sleeves.'},
  {key:'cashflow',label:'Cash-Flow Reliability',score:clamp(55+weeklyShare*35+Math.min(10,holdings.length*2)),weight:.12,explanation:'Rewards frequent payment cadence and multiple income sources.',improvement:'Broaden the payment schedule and avoid relying on one payer.'},
  {key:'expense',label:'Expense Efficiency',score:expenseProxy,weight:.08,explanation:'Offline proxy pending verified fund expense data from the ETF Universe.',improvement:'Prefer lower-cost exposure when two funds serve the same role.'},
  {key:'goal',label:'Goal Alignment',score:goal,weight:.12,explanation:'Compares modeled weekly income with the user-defined weekly target.',improvement:'Adjust capital, yield assumptions, or the income target.'},
  {key:'risk',label:'Risk Balance',score:clamp(92-maxWeight*65-(annual/value*100>15?15:0)),weight:.09,explanation:'Penalizes concentration and exceptionally high modeled yield.',improvement:'Balance high-income strategies with resilient core exposure.'},
  {key:'quality',label:'Portfolio Quality',score:clamp(58+categories*6+Math.min(12,holdings.length*2)),weight:.05,explanation:'Offline composite of breadth and portfolio construction discipline.',improvement:'Use verified fund quality, liquidity, and distribution data when connected.'},
  {key:'tax',label:'Tax Awareness',score:50,weight:.02,explanation:'Neutral score until account type and verified distribution tax character are available.',improvement:'Add account type and return-of-capital/qualified-income data.'},
 ]
 const total=Math.round(dims.reduce((s,d)=>s+d.score*d.weight,0))
 const sorted=[...dims].sort((a,b)=>b.score-a.score)
 return {total,grade:total>=90?'A':total>=80?'B':total>=70?'C':total>=60?'D':'F',dimensions:dims,strongest:sorted[0],weakest:sorted.at(-1)!}
}
