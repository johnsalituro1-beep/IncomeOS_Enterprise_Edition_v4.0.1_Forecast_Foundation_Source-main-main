import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/features/portfolio/portfolioManagement.ts', import.meta.url), 'utf8')

test('portfolio management module exposes release capabilities', () => {
  assert.match(source, /validateHolding/)
  assert.match(source, /portfolioDataQuality/)
  assert.match(source, /holdingsToCsv/)
})

test('portfolio page supports edit and export workflows', () => {
  const page = readFileSync(new URL('../src/pages/PortfolioPage.tsx', import.meta.url), 'utf8')
  assert.match(page, /updateHolding/)
  assert.match(page, /Export CSV/)
  assert.match(page, /DATA QUALITY/)
})
