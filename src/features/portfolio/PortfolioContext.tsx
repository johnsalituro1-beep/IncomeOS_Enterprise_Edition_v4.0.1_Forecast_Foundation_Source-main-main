import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { addTransaction as saveTransaction, loadPortfolio, persistHoldings, persistWeeklyGoal, removeTransaction as deleteTransaction } from './portfolioRepository'
import type { Holding, PortfolioTransaction, TransactionDraft } from '../../types/portfolio'
import { calculatePortfolioPositions } from './positionEngine'
import { deleteDistribution, loadDistributions, saveDistribution } from '../distributions/distributionRepository'
import { buildIncomeProjection } from '../distributions/distributionEngine'
import type { DistributionDraft, DistributionRecord } from '../../types/distribution'
import { reconcilePortfolio } from './reconciliationEngine'
import { refreshPortfolioMarketData } from '../../services/live-data/portfolioRefresh'
import { classifyFreshness } from '../market-data/marketDataEngine'
import type { PriceFreshness } from '../../types/market'
import { syncPortfolioDistributions, type DistributionSyncResult } from '../../services/live-data/distributionSync'

export type { Holding } from '../../types/portfolio'

type SyncState = 'loading' | 'synced' | 'saving' | 'offline' | 'error'

type PortfolioContextValue = {
  holdings: Holding[]
  transactions: PortfolioTransaction[]
  distributions: DistributionRecord[]
  addHolding: (holding: Omit<Holding, 'id'>) => void
  updateHolding: (id: string, holding: Omit<Holding, 'id'>) => void
  replaceHoldings: (holdings: Array<Omit<Holding, 'id'> | Holding>) => void
  clearHoldings: () => void
  removeHolding: (id: string) => void
  recordTransaction: (draft: TransactionDraft) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
  recordDistribution: (draft: DistributionDraft) => Promise<void>
  removeDistribution: (id: string) => Promise<void>
  weeklyGoal: number
  setWeeklyGoal: (goal: number) => void
  syncState: SyncState
  syncError: string | null
  refreshPortfolio: () => Promise<void>
  refreshMarketData: () => Promise<void>
  marketDataState: 'idle' | 'refreshing' | 'fresh' | 'fallback' | 'error'
  marketDataError: string | null
  marketDataRefreshedAt: string | null
  priceFreshness: PriceFreshness
  syncDistributions: () => Promise<void>
  distributionSyncState: 'idle' | 'syncing' | 'synced' | 'fallback' | 'error'
  distributionSyncError: string | null
  distributionSyncedAt: string | null
  lastDistributionSync: DistributionSyncResult | null
}

export const starterHoldings: Holding[] = [
  { id: '1', ticker: 'EDGQ', fundName: 'Income & Growth ETF', shares: 1150, averageCost: 28.15, currentPrice: 29.04, annualDistributionPerShare: 3.72, paymentFrequency: 'Weekly', category: 'Equity Income' },
  { id: '2', ticker: 'XDTE', fundName: 'S&P 500 0DTE Covered Call', shares: 800, averageCost: 49.45, currentPrice: 51.88, annualDistributionPerShare: 10.92, paymentFrequency: 'Weekly', category: 'Covered Call' },
  { id: '3', ticker: 'KYLD', fundName: 'Yield Premium Strategy ETF', shares: 720, averageCost: 24.80, currentPrice: 25.33, annualDistributionPerShare: 5.64, paymentFrequency: 'Weekly', category: 'Covered Call' },
  { id: '4', ticker: 'BCCC', fundName: 'Crypto Income Strategy ETF', shares: 900, averageCost: 31.20, currentPrice: 32.74, annualDistributionPerShare: 8.16, paymentFrequency: 'Weekly', category: 'Crypto Income' },
]

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

function normalizeHolding(holding: Omit<Holding, 'id'> | Holding): Holding {
  return { ...holding, id: 'id' in holding && holding.id ? holding.id : crypto.randomUUID(), ticker: holding.ticker.trim().toUpperCase(), fundName: holding.fundName.trim() || `${holding.ticker.trim().toUpperCase()} ETF` }
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { user, configured } = useAuth()
  const [portfolioId, setPortfolioId] = useState<string | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>([])
  const [distributions, setDistributions] = useState<DistributionRecord[]>([])
  const [weeklyGoal, setWeeklyGoalState] = useState(2000)
  const [syncState, setSyncState] = useState<SyncState>('loading')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [marketDataState, setMarketDataState] = useState<'idle' | 'refreshing' | 'fresh' | 'fallback' | 'error'>('idle')
  const [marketDataError, setMarketDataError] = useState<string | null>(null)
  const [marketDataRefreshedAt, setMarketDataRefreshedAt] = useState<string | null>(null)
  const [distributionSyncState, setDistributionSyncState] = useState<'idle' | 'syncing' | 'synced' | 'fallback' | 'error'>('idle')
  const [distributionSyncError, setDistributionSyncError] = useState<string | null>(null)
  const [distributionSyncedAt, setDistributionSyncedAt] = useState<string | null>(null)
  const [lastDistributionSync, setLastDistributionSync] = useState<DistributionSyncResult | null>(null)
  const hydrated = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshPortfolio = useCallback(async () => {
    setSyncState('loading'); setSyncError(null); hydrated.current = false
    try {
      const snapshot = await loadPortfolio(user, starterHoldings)
      setPortfolioId(snapshot.portfolioId); setHoldings(snapshot.holdings); setTransactions(snapshot.transactions); setWeeklyGoalState(snapshot.weeklyGoal)
      setDistributions(await loadDistributions(user, snapshot.portfolioId))
      hydrated.current = true; setSyncState(configured ? 'synced' : 'offline')
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Portfolio could not be loaded.')
      setSyncState('error')
    }
  }, [user, configured])

  useEffect(() => { void refreshPortfolio() }, [refreshPortfolio])

  useEffect(() => {
    if (!hydrated.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSyncState(configured ? 'saving' : 'offline')
    saveTimer.current = setTimeout(() => {
      void persistHoldings(user, portfolioId, holdings)
        .then(() => setSyncState(configured ? 'synced' : 'offline'))
        .catch(error => { setSyncError(error instanceof Error ? error.message : 'Portfolio save failed.'); setSyncState('error') })
    }, 350)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [holdings, user, portfolioId, configured])

  const addHolding = useCallback((holding: Omit<Holding, 'id'>) => setHoldings(current => [...current, normalizeHolding(holding)]), [])
  const updateHolding = useCallback((id: string, holding: Omit<Holding, 'id'>) => setHoldings(current => current.map(item => item.id === id ? { ...normalizeHolding(holding), id } : item)), [])
  const replaceHoldings = useCallback((next: Array<Omit<Holding, 'id'> | Holding>) => setHoldings(next.map(normalizeHolding)), [])
  const clearHoldings = useCallback(() => setHoldings([]), [])
  const removeHolding = useCallback((id: string) => setHoldings(current => current.filter(holding => holding.id !== id)), [])

  const recordTransaction = useCallback(async (draft: TransactionDraft) => {
    setSyncState(configured ? 'saving' : 'offline')
    try { const saved = await saveTransaction(user, portfolioId, draft); setTransactions(current => [saved, ...current]); setSyncState(configured ? 'synced' : 'offline') }
    catch (error) { setSyncError(error instanceof Error ? error.message : 'Transaction save failed.'); setSyncState('error'); throw error }
  }, [user, portfolioId, configured])

  const removeTransaction = useCallback(async (id: string) => {
    await deleteTransaction(user, id); setTransactions(current => current.filter(item => item.id !== id))
  }, [user])

  const recordDistribution = useCallback(async (draft: DistributionDraft) => {
    setSyncState(configured ? 'saving' : 'offline')
    try { const saved = await saveDistribution(user, portfolioId, draft); setDistributions(current => [saved, ...current]); setSyncState(configured ? 'synced' : 'offline') }
    catch (error) { setSyncError(error instanceof Error ? error.message : 'Distribution save failed.'); setSyncState('error'); throw error }
  }, [user, portfolioId, configured])

  const removeDistribution = useCallback(async (id: string) => {
    await deleteDistribution(user, id); setDistributions(current => current.filter(item => item.id !== id))
  }, [user])

  const refreshMarketData = useCallback(async () => {
    setMarketDataState('refreshing'); setMarketDataError(null)
    try {
      const result = await refreshPortfolioMarketData(holdings, user)
      setHoldings(result.holdings); setMarketDataRefreshedAt(result.refreshedAt)
      setMarketDataState(result.fallbackUsed ? 'fallback' : 'fresh')
    } catch (error) {
      setMarketDataError(error instanceof Error ? error.message : 'Market-data refresh failed.')
      setMarketDataState('error')
    }
  }, [holdings, user])


  const syncDistributions = useCallback(async () => {
    setDistributionSyncState('syncing'); setDistributionSyncError(null)
    try {
      const result = await syncPortfolioDistributions(holdings.map(item=>item.ticker), distributions, user, portfolioId)
      setDistributions(result.records); setDistributionSyncedAt(result.syncedAt); setLastDistributionSync(result)
      setDistributionSyncState(result.fallbackUsed ? 'fallback' : 'synced')
    } catch (error) {
      setDistributionSyncError(error instanceof Error ? error.message : 'Distribution sync failed.')
      setDistributionSyncState('error')
    }
  }, [holdings, distributions, user, portfolioId])

  const setWeeklyGoal = useCallback((goal: number) => {
    if (!Number.isFinite(goal) || goal <= 0) return
    setWeeklyGoalState(goal)
    void persistWeeklyGoal(user, goal).catch(error => { setSyncError(error instanceof Error ? error.message : 'Goal save failed.'); setSyncState('error') })
  }, [user])

  const priceFreshness = classifyFreshness(marketDataRefreshedAt)
  const value = useMemo<PortfolioContextValue>(() => ({ holdings, transactions, distributions, addHolding, updateHolding, replaceHoldings, clearHoldings, removeHolding, recordTransaction, removeTransaction, recordDistribution, removeDistribution, weeklyGoal, setWeeklyGoal, syncState, syncError, refreshPortfolio, refreshMarketData, marketDataState, marketDataError, marketDataRefreshedAt, priceFreshness, syncDistributions, distributionSyncState, distributionSyncError, distributionSyncedAt, lastDistributionSync }), [holdings, transactions, distributions, addHolding, updateHolding, replaceHoldings, clearHoldings, removeHolding, recordTransaction, removeTransaction, recordDistribution, removeDistribution, weeklyGoal, setWeeklyGoal, syncState, syncError, refreshPortfolio, refreshMarketData, marketDataState, marketDataError, marketDataRefreshedAt, priceFreshness, syncDistributions, distributionSyncState, distributionSyncError, distributionSyncedAt, lastDistributionSync])
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() { const value = useContext(PortfolioContext); if (!value) throw new Error('usePortfolio must be used inside PortfolioProvider'); return value }
export function usePortfolioMetrics() {
  const { holdings, transactions, distributions, weeklyGoal } = usePortfolio()
  const calculation = calculatePortfolioPositions(holdings, transactions)
  const incomeProjection = buildIncomeProjection(calculation.positions, distributions)
  const annualIncome = incomeProjection.annualIncome
  const monthlyIncome = incomeProjection.monthlyIncome, weeklyIncome = incomeProjection.weeklyIncome
  const yieldPct = calculation.marketValue ? annualIncome / calculation.marketValue * 100 : 0
  const goalProgress = weeklyGoal ? weeklyIncome / weeklyGoal * 100 : 0
  const portfolioHealth = reconcilePortfolio(holdings, transactions, distributions, calculation)
  return { portfolioHealth, portfolioValue: calculation.marketValue, costBasis: calculation.costBasis, annualIncome, monthlyIncome, weeklyIncome, yieldPct, gainLoss: calculation.unrealizedGain, realizedGain: calculation.realizedGain, totalReturn: calculation.totalReturn, incomeReceived: calculation.incomeReceived, ledgerCoveragePct: calculation.ledgerCoveragePct, positions: calculation.positions, calculationWarnings: [...calculation.warnings, ...incomeProjection.warnings], incomeProjection, weeklyGoal, goalProgress }
}
