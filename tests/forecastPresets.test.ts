import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultForecastAssumptions } from '../src/services/forecast/ForecastEngine.ts'
import { createForecastPreset, normalizePresetName, parseForecastPresets, upsertForecastPreset } from '../src/services/forecast/forecastPresets.ts'

test('normalizes and creates a deterministic forecast preset', () => {
  const preset = createForecastPreset('  Income   Goal  ', defaultForecastAssumptions, new Date('2026-07-22T00:00:00Z'), 'p1')
  assert.equal(preset.name, 'Income Goal')
  assert.equal(preset.id, 'p1')
  assert.deepEqual(preset.assumptions, defaultForecastAssumptions)
})

test('rejects an empty preset name', () => {
  assert.equal(normalizePresetName('   '), '')
  assert.throws(() => createForecastPreset(' ', defaultForecastAssumptions), /required/)
})

test('parses safe preset storage and ignores malformed data', () => {
  const preset = createForecastPreset('Base', defaultForecastAssumptions, new Date('2026-07-22T00:00:00Z'), 'p1')
  assert.equal(parseForecastPresets(JSON.stringify([preset])).length, 1)
  assert.deepEqual(parseForecastPresets('{bad'), [])
  assert.deepEqual(parseForecastPresets(JSON.stringify([{ id: 1 }])), [])
})

test('upserts presets by id and caps storage at twenty', () => {
  const presets = Array.from({ length: 20 }, (_, index) => createForecastPreset(`P${index}`, defaultForecastAssumptions, new Date('2026-07-22T00:00:00Z'), `p${index}`))
  const replacement = createForecastPreset('Replacement', defaultForecastAssumptions, new Date('2026-07-22T00:00:00Z'), 'p5')
  const result = upsertForecastPreset(presets, replacement)
  assert.equal(result.length, 20)
  assert.equal(result[0].name, 'Replacement')
  assert.equal(result.filter(item => item.id === 'p5').length, 1)
})
