import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePortfolio } from '../portfolio/PortfolioContext'
import { defaultForecastAssumptions, runForecast } from '../../services/forecast/ForecastEngine'
import { portfolioHoldingsToForecastHoldings } from '../../services/forecast/portfolioForecastAdapter'
import type { ForecastAssumptions, ForecastResult } from '../../types/forecast'

type ForecastStatus = 'idle' | 'calculating' | 'ready' | 'error'

type ForecastContextValue = {
  assumptions: ForecastAssumptions
  result: ForecastResult
  status: ForecastStatus
  error: string | null
  updateAssumptions: (changes: Partial<ForecastAssumptions>) => void
  resetAssumptions: () => void
  recalculate: () => void
}

const ForecastContext = createContext<ForecastContextValue | null>(null)

export function ForecastProvider({ children }: { children: ReactNode }) {
  const { holdings } = usePortfolio()
  const [assumptions, setAssumptions] = useState<ForecastAssumptions>(defaultForecastAssumptions)
  const [status, setStatus] = useState<ForecastStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const forecastHoldings = useMemo(() => portfolioHoldingsToForecastHoldings(holdings), [holdings])
  const [result, setResult] = useState<ForecastResult>(() => runForecast([], defaultForecastAssumptions))

  const recalculate = useCallback(() => {
    setStatus('calculating')
    setError(null)
    try {
      setResult(runForecast(forecastHoldings, assumptions))
      setStatus('ready')
    } catch (forecastError) {
      setError(forecastError instanceof Error ? forecastError.message : 'Forecast calculation failed.')
      setStatus('error')
    }
  }, [forecastHoldings, assumptions])

  useEffect(() => { recalculate() }, [recalculate])

  const updateAssumptions = useCallback((changes: Partial<ForecastAssumptions>) => {
    setAssumptions(current => ({ ...current, ...changes }))
  }, [])
  const resetAssumptions = useCallback(() => setAssumptions(defaultForecastAssumptions), [])
  const value = useMemo<ForecastContextValue>(() => ({
    assumptions,
    result,
    status,
    error,
    updateAssumptions,
    resetAssumptions,
    recalculate,
  }), [assumptions, result, status, error, updateAssumptions, resetAssumptions, recalculate])

  return <ForecastContext.Provider value={value}>{children}</ForecastContext.Provider>
}

export function useForecast(): ForecastContextValue {
  const value = useContext(ForecastContext)
  if (!value) throw new Error('useForecast must be used inside ForecastProvider')
  return value
}

export function useForecastSummary() {
  const { result, status, error } = useForecast()
  return { ...result.summary, confidence: result.confidence, warnings: result.warnings, status, error }
}
