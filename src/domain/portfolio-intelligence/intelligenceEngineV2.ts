import type { Holding } from '../../types/portfolio'

export type IntelligenceBand = 'excellent' | 'strong' | 'watch' | 'critical'
export type IntelligenceMetric = {
  key: string
  label: string
  score: number
  band: IntelligenceBand
  summary: string
  drivers: string[]
  action: string
}
export type IntelligenceAlert = { severity:'info'|'watch'|'critical'; title:string; detail:string; action:string }
export type PortfolioIntelligenceV2 = {
  composite: number
  grade: string
  metrics: IntelligenceMetric[]
  alerts: IntelligenceAlert[]
  concentration: { largestTicker:string; largestWeight:number; topThreeWeight:number; categoryCount:number }
  income: { annual:number; weekly:number; portfolioYield:number; highestYieldTicker:string; highestYield:number }
}

const clamp=(n:number)=>Math.max(0,Math.min(100,n))
const band=(n:number):IntelligenceBand=>n>=85?'excellent':n>=70?'strong':n>=55?'watch':'critical'
const metric=(key:string,label:string,score:number,summary:string,drivers:string[],action:string):IntelligenceMetric=>({key,label,score:Math.round(clamp(score)),band:band(score),summary,drivers,action})

export function analyzePortfolioIntelligence(holdings:Holding[]):PortfolioIntelligenceV2{
  const value=holdings.reduce((s,h)=>s+h.shares*h.currentPrice,0)
  const annual=holdings.reduce((s,h)=>s+h.shares*h.annualDistributionPerShare,0)
  const rows=holdings.map(h=>{
    const marketValue=h.shares*h.currentPrice
    const annualIncome=h.shares*h.annualDistributionPerShare
    return {...h,marketValue,annualIncome,weight:value?marketValue/value:0,yieldPct:marketValue?annualIncome/marketValue*100:0}
  }).sort((a,b)=>b.weight-a.weight)
  const largest=rows[0]
  const topThree=rows.slice(0,3).reduce((s,r)=>s+r.weight,0)
  const categoryWeights=new Map<string,number>()
  rows.forEach(r=>categoryWeights.set(r.category,(categoryWeights.get(r.category)??0)+r.weight))
  const maxCategory=Math.max(0,...categoryWeights.values())
  const categoryCount=categoryWeights.size
  const portfolioYield=value?annual/value*100:0
  const weeklyWeight=rows.filter(r=>r.paymentFrequency==='Weekly').reduce((s,r)=>s+r.weight,0)
  const highYieldWeight=rows.filter(r=>r.yieldPct>18).reduce((s,r)=>s+r.weight,0)
  const coveredCallWeight=rows.filter(r=>r.category.toLowerCase().includes('covered')).reduce((s,r)=>s+r.weight,0)
  const cryptoWeight=rows.filter(r=>r.category.toLowerCase().includes('crypto')).reduce((s,r)=>s+r.weight,0)
  const hhi=rows.reduce((s,r)=>s+r.weight*r.weight,0)
  const effectiveHoldings=hhi?1/hhi:0
  const yieldSpread=rows.length?Math.max(...rows.map(r=>r.yieldPct))-Math.min(...rows.map(r=>r.yieldPct)):0
  const highestYield=[...rows].sort((a,b)=>b.yieldPct-a.yieldPct)[0]

  const metrics=[
    metric('income-stability','Income Stability',82-highYieldWeight*45-Math.max(0,portfolioYield-15)*2+Math.min(8,rows.length*1.5),'Estimates how dependable modeled portfolio income may be across changing market conditions.',[`Portfolio yield ${portfolioYield.toFixed(1)}%`,`${(highYieldWeight*100).toFixed(0)}% in holdings above 18% modeled yield`,`${rows.length} income sources`],'Reduce reliance on the highest-yield sleeve and add durable dividend-growth exposure.'),
    metric('distribution-quality','Distribution Quality',86-coveredCallWeight*24-cryptoWeight*22-Math.max(0,yieldSpread-15)*.7,'Evaluates the mix of distribution strategies and the likelihood that headline yield depends on option premiums or volatile assets.',[`Covered-call weight ${(coveredCallWeight*100).toFixed(0)}%`,`Crypto-income weight ${(cryptoWeight*100).toFixed(0)}%`,`Yield dispersion ${yieldSpread.toFixed(1)} points`],'Balance option-income strategies with conventional equity income and total-return holdings.'),
    metric('yield-quality','Yield Quality',94-Math.max(0,portfolioYield-8)*3.2-highYieldWeight*28,'Distinguishes sustainable portfolio income from yield that may come with elevated NAV or distribution risk.',[`Modeled portfolio yield ${portfolioYield.toFixed(1)}%`,`Highest holding yield ${highestYield?.yieldPct.toFixed(1)??'0.0'}%`,`High-yield allocation ${(highYieldWeight*100).toFixed(0)}%`],'Treat unusually high distributions as variable cash flow and monitor total return, not yield alone.'),
    metric('diversification','Diversification',35+effectiveHoldings*13+categoryCount*5-(largest?.weight??0)*35-maxCategory*18,'Measures effective position count, category breadth, and concentration.',[`Effective holdings ${effectiveHoldings.toFixed(1)}`,`Largest position ${((largest?.weight??0)*100).toFixed(1)}%`,`Largest category ${(maxCategory*100).toFixed(1)}%`],'Reduce the largest position and add exposures with genuinely different return drivers.'),
    metric('cashflow','Cash-Flow Consistency',55+weeklyWeight*32+Math.min(10,rows.length*2)-highYieldWeight*12,'Assesses payment cadence and dependence on a small number of high-distribution holdings.',[`Weekly-pay allocation ${(weeklyWeight*100).toFixed(0)}%`,`${rows.length} payers`,`Top three positions ${(topThree*100).toFixed(0)}%`],'Maintain multiple payers and diversify payment sources rather than only payment frequency.'),
    metric('drawdown','Drawdown Risk',90-coveredCallWeight*24-cryptoWeight*38-(largest?.weight??0)*24-highYieldWeight*18,'Offline risk proxy based on strategy type, concentration, and modeled yield intensity.',[`Crypto-income weight ${(cryptoWeight*100).toFixed(0)}%`,`Covered-call weight ${(coveredCallWeight*100).toFixed(0)}%`,`Largest holding ${((largest?.weight??0)*100).toFixed(0)}%`],'Add a resilient core sleeve and define maximum allocations for high-volatility strategies.'),
    metric('growth','Growth Potential',88-coveredCallWeight*34-cryptoWeight*8+Math.min(8,categoryCount*2),'Estimates how much of the portfolio can participate in long-term capital and distribution growth.',[`Covered-call allocation ${(coveredCallWeight*100).toFixed(0)}%`,`Strategy categories ${categoryCount}`,`Income yield ${portfolioYield.toFixed(1)}%`],'Increase uncapped equity-growth or dividend-growth exposure if long-term principal growth is important.'),
    metric('resilience','Portfolio Resilience',82-(largest?.weight??0)*38-maxCategory*24-cryptoWeight*26+Math.min(10,effectiveHoldings*2),'Combines concentration, category balance, and strategy-risk proxies into a stress-resilience estimate.',[`Top-three weight ${(topThree*100).toFixed(0)}%`,`Category concentration ${(maxCategory*100).toFixed(0)}%`,`Effective holdings ${effectiveHoldings.toFixed(1)}`],'Create allocation guardrails and test the portfolio against income cuts and market drawdowns.'),
  ]
  const weights=[.16,.13,.13,.15,.11,.12,.1,.1]
  const composite=Math.round(metrics.reduce((s,m,i)=>s+m.score*weights[i],0))
  const alerts:IntelligenceAlert[]=[]
  if((largest?.weight??0)>.30) alerts.push({severity:'critical',title:'Single-position concentration',detail:`${largest.ticker} represents ${((largest.weight)*100).toFixed(1)}% of modeled portfolio value.`,action:'Set a maximum position target and model a staged rebalance.'})
  if(maxCategory>.50) alerts.push({severity:'watch',title:'Strategy concentration',detail:`The largest strategy category represents ${(maxCategory*100).toFixed(1)}% of the portfolio.`,action:'Add a differentiated income or growth sleeve.'})
  if(portfolioYield>15) alerts.push({severity:'watch',title:'Elevated modeled yield',detail:`The portfolio yield is ${portfolioYield.toFixed(1)}%, which may indicate variable distributions or elevated NAV risk.`,action:'Review distribution coverage and total-return history when verified data is connected.'})
  if(cryptoWeight>.20) alerts.push({severity:'watch',title:'Crypto-income exposure',detail:`Crypto-income strategies represent ${(cryptoWeight*100).toFixed(1)}% of value.`,action:'Stress test a 40% drawdown and a 30% distribution reduction.'})
  if(!alerts.length) alerts.push({severity:'info',title:'No critical construction alerts',detail:'The offline rules engine did not identify a severe portfolio construction issue.',action:'Connect verified holdings, distribution, and price history for deeper validation.'})
  return {composite,grade:composite>=90?'A':composite>=80?'B':composite>=70?'C':composite>=60?'D':'F',metrics,alerts,concentration:{largestTicker:largest?.ticker??'—',largestWeight:(largest?.weight??0)*100,topThreeWeight:topThree*100,categoryCount},income:{annual,weekly:annual/52,portfolioYield,highestYieldTicker:highestYield?.ticker??'—',highestYield:highestYield?.yieldPct??0}}
}
