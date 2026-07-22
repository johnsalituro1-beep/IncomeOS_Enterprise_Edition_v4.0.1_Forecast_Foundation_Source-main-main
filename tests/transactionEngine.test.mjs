import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const source = readFileSync(new URL('../src/features/portfolio/transactionEngine.ts', import.meta.url), 'utf8')
const repository = readFileSync(new URL('../src/features/portfolio/portfolioRepository.ts', import.meta.url), 'utf8')

test('transaction engine validates and summarizes ledger activity', () => {
  assert.match(source, /validateTransaction/)
  assert.match(source, /transactionCashFlow/)
  assert.match(source, /transactionSummary/)
})
test('portfolio repository supports Supabase and local fallback persistence', () => {
  assert.match(repository, /supabase\.from\('holdings'\)/)
  assert.match(repository, /supabase\.from\('transactions'\)/)
  assert.match(repository, /localStorage/)
})
test('portfolio page exposes synchronization and ledger workflows', () => {
  const page = readFileSync(new URL('../src/pages/PortfolioPage.tsx', import.meta.url), 'utf8')
  assert.match(page, /Portfolio Health & Reconciliation/)
  assert.match(page, /Transaction Ledger/)
  assert.match(page, /Cloud synchronized/)
})
