import type { Holding } from '../../types/portfolio'

export type CashEvent = { id:string; ticker:string; type:'Payment'|'Ex-Date'; date:string; amount:number; confidence:'Confirmed'|'Projected' }
export type MissionAlert = { id:string; severity:'info'|'watch'|'risk'|'success'; title:string; detail:string; source:string }

export function buildCashEvents(holdings: Holding[], start = new Date()): CashEvent[] {
  const events: CashEvent[] = []
  holdings.forEach((h, index) => {
    const weekly = h.shares * h.annualDistributionPerShare / 52
    const cadence = h.paymentFrequency === 'Weekly' ? 7 : h.paymentFrequency === 'Monthly' ? 30 : 91
    for (let n=0;n<4;n++) {
      const d = new Date(start); d.setDate(d.getDate() + 2 + index + n * cadence)
      events.push({ id:`${h.id}-${n}`, ticker:h.ticker, type:'Payment', date:d.toISOString(), amount: h.paymentFrequency === 'Weekly' ? weekly : h.paymentFrequency === 'Monthly' ? weekly*52/12 : weekly*13, confidence:'Projected' })
    }
  })
  return events.sort((a,b)=>a.date.localeCompare(b.date))
}

export function buildMissionAlerts(holdings: Holding[], weeklyIncome:number, weeklyGoal:number): MissionAlert[] {
  const total = holdings.reduce((s,h)=>s+h.shares*h.currentPrice,0)
  const category = new Map<string,number>()
  holdings.forEach(h=>category.set(h.category,(category.get(h.category)||0)+h.shares*h.currentPrice))
  const largestCategory = [...category.entries()].sort((a,b)=>b[1]-a[1])[0]
  const largestHolding = [...holdings].sort((a,b)=>b.shares*b.currentPrice-a.shares*a.currentPrice)[0]
  const alerts: MissionAlert[] = []
  const progress = weeklyGoal ? weeklyIncome/weeklyGoal : 0
  alerts.push({id:'goal',severity:progress>=1?'success':progress>=.75?'info':'watch',title:progress>=1?'Weekly income goal reached':'Weekly income gap remains',detail:`Projected weekly income is ${(progress*100).toFixed(0)}% of the $${weeklyGoal.toLocaleString()} target.`,source:'Goal Alignment Engine'})
  if (largestCategory && total && largestCategory[1]/total>.4) alerts.push({id:'category',severity:'watch',title:'Strategy concentration detected',detail:`${largestCategory[0]} represents ${(largestCategory[1]/total*100).toFixed(1)}% of portfolio value.`,source:'Risk Rules'})
  if (largestHolding && total && largestHolding.shares*largestHolding.currentPrice/total>.3) alerts.push({id:'holding',severity:'risk',title:'Single-holding concentration',detail:`${largestHolding.ticker} represents ${(largestHolding.shares*largestHolding.currentPrice/total*100).toFixed(1)}% of portfolio value.`,source:'Concentration Engine'})
  alerts.push({id:'data',severity:'info',title:'Offline modeled data active',detail:'Calendar, market, and distribution events are projections until verified providers are connected.',source:'Data Quality Monitor'})
  return alerts
}
