import type { DistributionRecord } from '../../types/distribution'
import type { Holding } from '../../types/portfolio'
import type { CalculatedPosition, PortfolioCalculation } from './positionEngine'
import type { PortfolioTransaction } from '../../types/portfolio'

export type AlertSeverity = 'critical' | 'warning' | 'info'
export type ReconciliationAlert = {
  id: string
  severity: AlertSeverity
  category: 'ledger' | 'pricing' | 'income' | 'concentration' | 'metadata'
  ticker: string | null
  title: string
  detail: string
  action: string
}
export type PortfolioHealth = {
  score: number
  grade: 'Excellent' | 'Good' | 'Needs attention' | 'Critical'
  alerts: ReconciliationAlert[]
  counts: Record<AlertSeverity, number>
  dataCoveragePct: number
  incomeCoveragePct: number
  concentrationPct: number
}

const daysBetween = (a: Date, b: string) => Math.floor((a.getTime() - new Date(`${b}T12:00:00Z`).getTime()) / 86_400_000)
const round = (n: number) => Math.round(n * 10) / 10

export function reconcilePortfolio(
  holdings: Holding[], transactions: PortfolioTransaction[], distributions: DistributionRecord[], calculation: PortfolioCalculation,
  asOf = new Date(),
): PortfolioHealth {
  const alerts: ReconciliationAlert[] = []
  const byTicker = new Map(holdings.map(h => [h.ticker, h]))
  const distributionTickers = new Set(distributions.map(d => d.ticker))

  calculation.warnings.forEach((detail, index) => alerts.push({ id:`ledger-${index}`, severity: detail.toLowerCase().includes('exceed') ? 'critical' : 'warning', category:'ledger', ticker:null, title:'Ledger reconciliation issue', detail, action:'Review the transaction ledger and correct the affected entry.' }))

  for (const position of calculation.positions) {
    const holding = byTicker.get(position.ticker)
    if (!holding) alerts.push({ id:`metadata-${position.ticker}`, severity:'warning', category:'metadata', ticker:position.ticker, title:'Missing holding metadata', detail:`${position.ticker} exists in the ledger but has no portfolio record.`, action:'Create or reconcile the holding record.' })
    if (position.currentPrice <= 0) alerts.push({ id:`price-${position.ticker}`, severity:'critical', category:'pricing', ticker:position.ticker, title:'Missing current price', detail:`${position.ticker} cannot be valued because its current price is zero.`, action:'Enter a current price or connect live market data.' })
    if (position.averageCost <= 0 && position.shares > 0) alerts.push({ id:`cost-${position.ticker}`, severity:'warning', category:'ledger', ticker:position.ticker, title:'Incomplete cost basis', detail:`${position.ticker} has shares but no usable cost basis.`, action:'Add opening cost basis or complete buy transactions.' })
    if (!distributionTickers.has(position.ticker) && position.annualDistributionPerShare <= 0) alerts.push({ id:`income-${position.ticker}`, severity:'warning', category:'income', ticker:position.ticker, title:'Missing income data', detail:`${position.ticker} has no distribution history or annual income assumption.`, action:'Add a distribution record or annual distribution estimate.' })
    const latest = distributions.filter(d => d.ticker === position.ticker).sort((a,b)=>b.paymentDate.localeCompare(a.paymentDate))[0]
    if (latest && daysBetween(asOf, latest.paymentDate) > 120 && latest.frequency !== 'Irregular') alerts.push({ id:`stale-${position.ticker}`, severity:'warning', category:'income', ticker:position.ticker, title:'Stale distribution history', detail:`${position.ticker}'s latest payment record is more than 120 days old.`, action:'Confirm the latest declared distribution.' })
  }

  const duplicateTransactions = new Map<string, number>()
  transactions.forEach(t => { const key=[t.ticker,t.type,t.tradeDate,t.shares,t.price,t.fees].join('|'); duplicateTransactions.set(key,(duplicateTransactions.get(key)??0)+1) })
  ;[...duplicateTransactions.entries()].filter(([,count])=>count>1).forEach(([key],index)=>alerts.push({id:`duplicate-tx-${index}`,severity:'warning',category:'ledger',ticker:key.split('|')[0]||null,title:'Possible duplicate transaction',detail:'Two or more ledger entries have identical trade details.',action:'Confirm the entries and remove any duplicate.'}))

  const duplicateDistributions = new Map<string, number>()
  distributions.forEach(d => { const key=[d.ticker,d.paymentDate,d.amountPerShare].join('|'); duplicateDistributions.set(key,(duplicateDistributions.get(key)??0)+1) })
  ;[...duplicateDistributions.entries()].filter(([,count])=>count>1).forEach(([key],index)=>alerts.push({id:`duplicate-dist-${index}`,severity:'warning',category:'income',ticker:key.split('|')[0],title:'Possible duplicate distribution',detail:'Multiple distribution records share the same ticker, payment date, and amount.',action:'Keep one authoritative distribution record.'}))

  const largest = calculation.positions.reduce((max,p)=>Math.max(max,p.marketValue),0)
  const concentrationPct = calculation.marketValue > 0 ? largest / calculation.marketValue * 100 : 0
  const largestPosition = calculation.positions.find(p=>p.marketValue===largest)
  if (concentrationPct >= 40 && largestPosition) alerts.push({id:'concentration',severity:concentrationPct>=60?'critical':'warning',category:'concentration',ticker:largestPosition.ticker,title:'High single-position concentration',detail:`${largestPosition.ticker} represents ${round(concentrationPct)}% of portfolio market value.`,action:'Review whether this concentration matches the portfolio risk plan.'})

  const valued = calculation.positions.filter(p=>p.currentPrice>0).length
  const incomeReady = calculation.positions.filter(p=>distributionTickers.has(p.ticker)||p.annualDistributionPerShare>0).length
  const total = calculation.positions.length || 1
  const dataCoveragePct = valued/total*100
  const incomeCoveragePct = incomeReady/total*100
  const counts = { critical: alerts.filter(a=>a.severity==='critical').length, warning: alerts.filter(a=>a.severity==='warning').length, info: alerts.filter(a=>a.severity==='info').length }
  const score = Math.max(0, Math.round(100 - counts.critical*18 - counts.warning*7 - Math.max(0,40-dataCoveragePct)*.35 - Math.max(0,40-incomeCoveragePct)*.25))
  const grade = score>=90?'Excellent':score>=75?'Good':score>=50?'Needs attention':'Critical'
  return { score, grade, alerts: alerts.sort((a,b)=>({critical:0,warning:1,info:2}[a.severity]-{critical:0,warning:1,info:2}[b.severity])), counts, dataCoveragePct:round(dataCoveragePct), incomeCoveragePct:round(incomeCoveragePct), concentrationPct:round(concentrationPct) }
}

export type ImportConflictPolicy = 'merge' | 'replace' | 'skip'
export function resolveImportConflicts(existing: Holding[], imported: Array<Omit<Holding,'id'>>, policy: ImportConflictPolicy): Holding[] {
  const current = new Map(existing.map(h=>[h.ticker.toUpperCase(),h]))
  if (policy === 'replace') return imported.map(h=>({...h,id:crypto.randomUUID(),ticker:h.ticker.toUpperCase()}))
  for (const item of imported) {
    const ticker=item.ticker.toUpperCase(), prior=current.get(ticker)
    if (!prior) current.set(ticker,{...item,id:crypto.randomUUID(),ticker})
    else if (policy==='merge') current.set(ticker,{...prior,...item,id:prior.id,ticker})
  }
  return [...current.values()]
}
