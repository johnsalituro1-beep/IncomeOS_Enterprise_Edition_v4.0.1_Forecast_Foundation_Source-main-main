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
import {
  createForecastPreset,
  FORECAST_PRESETS_STORAGE_KEY,
  parseForecastPresets,
  upsertForecastPreset,
  type ForecastPreset,
} from '../../services/forecast/forecastPresets'
import type { ForecastAssumptions, ForecastResult, ForecastScenario } from '../../types/forecast'

type ForecastStatus = 'idle' | 'calculating' | 'ready' | 'error'

type ForecastContextValue = {
  assumptions: ForecastAssumptions
  result: ForecastResult
  status: ForecastStatus
  error: string | null
  presets: ForecastPreset[]
  scenarios: ForecastScenario[]
  updateAssumptions: (changes: Partial<ForecastAssumptions>) => void
  resetAssumptions: () => void
  recalculate: () => void
  savePreset: (name: string) => void
  loadPreset: (id: string) => void
  deletePreset: (id: string) => void
  addScenario: (name: string) => void
  removeScenario: (id: string) => void
  clearScenarios: () => void
}

const ForecastContext = createContext<ForecastContextValue | null>(null)

function loadInitialPresets(): ForecastPreset[] {
  if (typeof window === 'undefined') return []
  return parseForecastPresets(window.localStorage.getItem(FORECAST_PRESETS_STORAGE_KEY))
}

export function ForecastProvider({ children }: { children: ReactNode }) {
  const { holdings } = usePortfolio()
  const [assumptions, setAssumptions] = useState<ForecastAssumptions>(defaultForecastAssumptions)
  const [status, setStatus] = useState<ForecastStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [presets, setPresets] = useState<ForecastPreset[]>(loadInitialPresets)
  const [scenarios, setScenarios] = useState<ForecastScenario[]>([])
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
  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(FORECAST_PRESETS_STORAGE_KEY, JSON.stringify(presets))
  }, [presets])

  const updateAssumptions = useCallback((changes: Partial<ForecastAssumptions>) => {
    setAssumptions(current => ({ ...current, ...changes }))
  }, [])
  const resetAssumptions = useCallback(() => setAssumptions(defaultForecastAssumptions), [])
  const savePreset = useCallback((name: string) => {
    setPresets(current => upsertForecastPreset(current, createForecastPreset(name, assumptions)))
  }, [assumptions])
  const loadPreset = useCallback((id: string) => {
    const preset = presets.find(item => item.id === id)
    if (preset) setAssumptions({ ...preset.assumptions })
  }, [presets])
  const deletePreset = useCallback((id: string) => setPresets(current => current.filter(item => item.id !== id)), [])
  const addScenario = useCallback((name: string) => {
    const trimmed = name.trim() || `Scenario ${scenarios.length + 1}`
    const scenarioResult = runForecast(forecastHoldings, assumptions)
    const scenario: ForecastScenario = {
      id: `scenario-${Date.now()}-${scenarios.length}`,
      name: trimmed.slice(0, 48),
      assumptions: { ...assumptions },
      result: scenarioResult,
    }
    setScenarios(current => [...current, scenario].slice(-4))
  }, [assumptions, forecastHoldings, scenarios.length])
  const removeScenario = useCallback((id: string) => setScenarios(current => current.filter(item => item.id !== id)), [])
  const clearScenarios = useCallback(() => setScenarios([]), [])

  const value = useMemo<ForecastContextValue>(() => ({
    assumptions, result, status, error, presets, scenarios,
    updateAssumptions, resetAssumptions, recalculate,
    savePreset, loadPreset, deletePreset, addScenario, removeScenario, clearScenarios,
  }), [assumptions, result, status, error, presets, scenarios, updateAssumptions, resetAssumptions, recalculate, savePreset, loadPreset, deletePreset, addScenario, removeScenario, clearScenarios])

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
