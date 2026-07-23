import test from 'node:test'
import assert from 'node:assert/strict'
import { reconcilePortfolio, resolveImportConflicts } from '../src/features/portfolio/reconciliationEngine.ts'
import type { Holding } from '../src/features/portfolio/PortfolioContext.tsx'
import { calculatePortfolioPositions } from '../src/features/portfolio/positionEngine.ts'

const holdings: Holding[]=[{id:'1',ticker:'AAA',fundName:'AAA ETF',shares:10,averageCost:10,currentPrice:0,annualDistributionPerShare:0,paymentFrequency:'Monthly',category:'Other'},{id:'2',ticker:'BBB',fundName:'BBB ETF',shares:1,averageCost:20,currentPrice:20,annualDistributionPerShare:1,paymentFrequency:'Monthly',category:'Other'}]
test('health engine flags missing price and income data',()=>{const calc=calculatePortfolioPositions(holdings,[]);const health=reconcilePortfolio(holdings,[],[],calc,new Date('2026-07-21'));assert.ok(health.counts.critical>=1);assert.ok(health.alerts.some(a=>a.id==='income-AAA'));assert.ok(health.score<100)})
test('health engine flags high concentration',()=>{const hs=holdings.map((h,i)=>({...h,currentPrice:i?1:100}));const calc=calculatePortfolioPositions(hs,[]);const health=reconcilePortfolio(hs,[],[],calc);assert.ok(health.alerts.some(a=>a.category==='concentration'))})
test('merge import keeps ids and updates matching tickers',()=>{const result=resolveImportConflicts(holdings,[{...holdings[0],shares:99}],'merge');const a=result.find(h=>h.ticker==='AAA');assert.equal(a?.id,'1');assert.equal(a?.shares,99)})
test('skip import preserves conflicting holding and adds new ticker',()=>{const result=resolveImportConflicts(holdings,[{...holdings[0],shares:99},{...holdings[0],ticker:'CCC'}],'skip');assert.equal(result.find(h=>h.ticker==='AAA')?.shares,10);assert.ok(result.some(h=>h.ticker==='CCC'))})
