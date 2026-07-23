import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { Holding, PortfolioStateSnapshot, PortfolioTransaction, TransactionDraft } from '../../types/portfolio'

const HOLDINGS_KEY = 'incomeos-v1.5-holdings'
const TRANSACTIONS_KEY = 'incomeos-v1.5-transactions'
const GOAL_KEY = 'edcp-weekly-goal'

export type { PortfolioStateSnapshot } from '../../types/portfolio'

function readLocal<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback } catch { return fallback }
}
function writeLocal(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)) }

export async function loadPortfolio(user: User | null, fallbackHoldings: Holding[]): Promise<PortfolioStateSnapshot> {
  if (!user || !supabase) return {
    portfolioId: null,
    holdings: readLocal(HOLDINGS_KEY, readLocal('edcp-m2-holdings', fallbackHoldings)),
    transactions: readLocal(TRANSACTIONS_KEY, []),
    weeklyGoal: Number(localStorage.getItem(GOAL_KEY)) || 2000,
  }

  let { data: portfolio, error } = await supabase.from('portfolios').select('id').eq('user_id', user.id).eq('is_default', true).maybeSingle()
  if (error) throw error
  if (!portfolio) {
    const created = await supabase.from('portfolios').insert({ user_id: user.id, name: 'My Income Portfolio', is_default: true }).select('id').single()
    if (created.error) throw created.error
    portfolio = created.data
  }
  const [holdingResult, transactionResult, goalResult] = await Promise.all([
    supabase.from('holdings').select('*').eq('portfolio_id', portfolio.id).order('ticker'),
    supabase.from('transactions').select('*').eq('portfolio_id', portfolio.id).order('trade_date', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('income_goals').select('weekly_target').eq('user_id', user.id).order('created_at').limit(1).maybeSingle(),
  ])
  if (holdingResult.error) throw holdingResult.error
  if (transactionResult.error) throw transactionResult.error
  if (goalResult.error) throw goalResult.error
  return {
    portfolioId: portfolio.id,
    holdings: (holdingResult.data ?? []).map(row => ({ id: row.id, ticker: row.ticker, fundName: row.fund_name ?? `${row.ticker} ETF`, shares: Number(row.shares), averageCost: Number(row.average_cost), currentPrice: Number(row.current_price), annualDistributionPerShare: Number(row.annual_distribution_per_share), paymentFrequency: row.payment_frequency ?? 'Monthly', category: row.category ?? 'Other' })),
    transactions: (transactionResult.data ?? []).map(row => ({ id: row.id, holdingId: row.holding_id, ticker: row.ticker, type: row.transaction_type, tradeDate: row.trade_date, shares: Number(row.shares), price: Number(row.price), fees: Number(row.fees), notes: row.notes ?? '' })),
    weeklyGoal: Number(goalResult.data?.weekly_target) || 2000,
  }
}

export async function persistHoldings(user: User | null, portfolioId: string | null, holdings: Holding[]) {
  if (!user || !supabase || !portfolioId) { writeLocal(HOLDINGS_KEY, holdings); return }
  const payload = holdings.map(h => ({ id: h.id, portfolio_id: portfolioId, ticker: h.ticker, fund_name: h.fundName, shares: h.shares, average_cost: h.averageCost, current_price: h.currentPrice, annual_distribution_per_share: h.annualDistributionPerShare, payment_frequency: h.paymentFrequency, category: h.category }))
  if (payload.length) { const result = await supabase.from('holdings').upsert(payload); if (result.error) throw result.error }
  const existing = await supabase.from('holdings').select('id').eq('portfolio_id', portfolioId)
  if (existing.error) throw existing.error
  const keep = new Set(holdings.map(h => h.id)); const remove = (existing.data ?? []).map(row => row.id).filter(id => !keep.has(id))
  if (remove.length) { const result = await supabase.from('holdings').delete().in('id', remove); if (result.error) throw result.error }
}

export async function addTransaction(user: User | null, portfolioId: string | null, draft: TransactionDraft): Promise<PortfolioTransaction> {
  if (!user || !supabase || !portfolioId) {
    const transaction = { ...draft, id: crypto.randomUUID() }
    const current = readLocal<PortfolioTransaction[]>(TRANSACTIONS_KEY, [])
    writeLocal(TRANSACTIONS_KEY, [transaction, ...current])
    return transaction
  }
  const result = await supabase.from('transactions').insert({ portfolio_id: portfolioId, holding_id: draft.holdingId, ticker: draft.ticker, transaction_type: draft.type, trade_date: draft.tradeDate, shares: draft.shares, price: draft.price, fees: draft.fees, notes: draft.notes }).select('*').single()
  if (result.error) throw result.error
  const row = result.data
  return { id: row.id, holdingId: row.holding_id, ticker: row.ticker, type: row.transaction_type, tradeDate: row.trade_date, shares: Number(row.shares), price: Number(row.price), fees: Number(row.fees), notes: row.notes ?? '' }
}

export async function removeTransaction(user: User | null, id: string) {
  if (!user || !supabase) { writeLocal(TRANSACTIONS_KEY, readLocal<PortfolioTransaction[]>(TRANSACTIONS_KEY, []).filter(item => item.id !== id)); return }
  const result = await supabase.from('transactions').delete().eq('id', id); if (result.error) throw result.error
}

export async function persistWeeklyGoal(user: User | null, weeklyGoal: number) {
  localStorage.setItem(GOAL_KEY, String(weeklyGoal))
  if (!user || !supabase) return
  const existing = await supabase.from('income_goals').select('id').eq('user_id', user.id).order('created_at').limit(1).maybeSingle()
  if (existing.error) throw existing.error
  const result = existing.data
    ? await supabase.from('income_goals').update({ weekly_target: weeklyGoal, annual_target: weeklyGoal * 52 }).eq('id', existing.data.id)
    : await supabase.from('income_goals').insert({ user_id: user.id, name: 'Primary Income Goal', weekly_target: weeklyGoal, annual_target: weeklyGoal * 52 })
  if (result.error) throw result.error
}
