import type { ForecastTimelinePoint } from '../../types/forecast'

export interface ForecastChartPoint {
  x: number
  y: number
  value: number
  label: string
}

export function sampleForecastTimeline(timeline: ForecastTimelinePoint[], maxPoints = 13): ForecastTimelinePoint[] {
  if (timeline.length <= maxPoints) return timeline
  const result: ForecastTimelinePoint[] = []
  for (let index = 0; index < maxPoints; index += 1) {
    const sourceIndex = Math.round(index * (timeline.length - 1) / (maxPoints - 1))
    result.push(timeline[sourceIndex])
  }
  return result
}

export function buildForecastChartPoints(
  timeline: ForecastTimelinePoint[],
  width = 600,
  height = 220,
  padding = 36,
): ForecastChartPoint[] {
  const sampled = sampleForecastTimeline(timeline)
  if (sampled.length === 0) return []
  const values = sampled.map(point => point.annualIncome)
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = Math.max(maximum - minimum, Math.abs(maximum) * 0.05, 1)
  const plotWidth = width - padding * 2
  const plotHeight = height - padding * 2
  return sampled.map((point, index) => ({
    x: padding + (sampled.length === 1 ? plotWidth / 2 : index * plotWidth / (sampled.length - 1)),
    y: padding + (maximum - point.annualIncome) / range * plotHeight,
    value: point.annualIncome,
    label: new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
  }))
}

export function buildLinePath(points: ForecastChartPoint[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
}
