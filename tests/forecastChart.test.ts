import test from 'node:test'
import assert from 'node:assert/strict'
import { buildForecastChartPoints, buildLinePath, sampleForecastTimeline } from '../src/components/forecast/forecastChart.ts'
import type { ForecastTimelinePoint } from '../src/types/forecast.ts'

const timeline = Array.from({ length: 60 }, (_, index): ForecastTimelinePoint => ({
  month: index + 1,
  date: new Date(Date.UTC(2026, index + 1, 1)).toISOString(),
  portfolioValue: 100000 + index * 1000,
  annualIncome: 12000 + index * 100,
  monthlyIncome: 1000,
  weeklyIncome: 230,
  cumulativeDistributions: index * 1000,
  reinvestedDistributions: index * 500,
  inflationAdjustedAnnualIncome: 12000,
}))

test('samples long forecast timelines while preserving endpoints', () => {
  const sampled = sampleForecastTimeline(timeline, 13)
  assert.equal(sampled.length, 13)
  assert.equal(sampled[0].month, 1)
  assert.equal(sampled.at(-1)?.month, 60)
})

test('builds bounded chart points and an SVG path', () => {
  const points = buildForecastChartPoints(timeline)
  assert.equal(points.length, 13)
  assert.ok(points.every(point => point.x >= 36 && point.x <= 564))
  assert.ok(points.every(point => point.y >= 36 && point.y <= 190))
  const path = buildLinePath(points)
  assert.match(path, /^M/)
  assert.match(path, / L/)
})
