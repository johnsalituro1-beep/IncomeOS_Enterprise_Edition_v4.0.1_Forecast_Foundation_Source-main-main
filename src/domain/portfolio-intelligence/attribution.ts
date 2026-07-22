import type { Holding } from '../../types/portfolio'
export type AttributionRow={ticker:string;portfolioWeight:number;incomeWeight:number;annualIncome:number;yieldPct:number;category:string}
export function buildAttribution(holdings:Holding[]):AttributionRow[]{
 const value=holdings.reduce((s,h)=>s+h.shares*h.currentPrice,0); const income=holdings.reduce((s,h)=>s+h.shares*h.annualDistributionPerShare,0)
 return holdings.map(h=>{const v=h.shares*h.currentPrice;const i=h.shares*h.annualDistributionPerShare;return{ticker:h.ticker,portfolioWeight:value?v/value*100:0,incomeWeight:income?i/income*100:0,annualIncome:i,yieldPct:v?i/v*100:0,category:h.category}}).sort((a,b)=>b.incomeWeight-a.incomeWeight)
}
