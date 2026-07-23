import type { ForecastAssumptions } from '../../types/forecast'

export interface ForecastPreset {
  id: string
  name: string
  assumptions: ForecastAssumptions
  createdAt: string
  updatedAt: string
}

export const FORECAST_PRESETS_STORAGE_KEY = 'incomeos.forecast.presets.v1'

export function normalizePresetName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').slice(0, 48)
}

export function createForecastPreset(
  name: string,
  assumptions: ForecastAssumptions,
  now = new Date(),
  id = `forecast-${now.getTime()}`,
): ForecastPreset {
  const normalizedName = normalizePresetName(name)
  if (!normalizedName) throw new Error('Preset name is required.')
  const timestamp = now.toISOString()
  return { id, name: normalizedName, assumptions: { ...assumptions }, createdAt: timestamp, updatedAt: timestamp }
}

export function parseForecastPresets(raw: string | null): ForecastPreset[] {
  if (!raw) return []
  try {
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value.filter((item): item is ForecastPreset => {
      if (!item || typeof item !== 'object') return false
      const candidate = item as Partial<ForecastPreset>
      return typeof candidate.id === 'string'
        && typeof candidate.name === 'string'
        && typeof candidate.createdAt === 'string'
        && typeof candidate.updatedAt === 'string'
        && !!candidate.assumptions
        && typeof candidate.assumptions.horizonYears === 'number'
    })
  } catch {
    return []
  }
}

export function upsertForecastPreset(presets: ForecastPreset[], preset: ForecastPreset): ForecastPreset[] {
  return [preset, ...presets.filter(item => item.id !== preset.id)].slice(0, 20)
}
