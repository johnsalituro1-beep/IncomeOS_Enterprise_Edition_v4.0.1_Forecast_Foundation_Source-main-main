import test from 'node:test'
import assert from 'node:assert/strict'
import { buildIncomeProjection, validateDistribution, type DistributionRecord } from '../src/features/distributions/distributionEngine.ts'
import type { CalculatedPosition } from '../src/features/portfolio/positionEngine.ts'

const position: CalculatedPosition = { id:'h1',ticker:'TEST',fundName:'Test ETF',shares:100,averageCost:20,currentPrice:25,annualDistributionPerShare:5.2,paymentFrequency:'Weekly',category:'Income',source:'manual',costBasis:2000,marketValue:2500,unrealizedGain:500,realizedGain:0,totalReturn:500,incomeReceived:0,transactionCount:0,warnings:[] }

test('uses latest weekly record to annualize forward income',()=>{
 const records:DistributionRecord[]=[{id:'d1',ticker:'TEST',amountPerShare:.12,declarationDate:'2026-07-20',exDate:'2026-07-21',recordDate:'2026-07-21',paymentDate:'2026-07-24',frequency:'Weekly',status:'declared',source:'Sponsor',notes:''}]
 const result=buildIncomeProjection([position],records,new Date('2026-07-21T00:00:00Z'))
 assert.equal(result.annualIncome,624)
 assert.equal(result.weeklyIncome,12)
 assert.equal(result.events[0].confidence,'Confirmed')
 assert.equal(result.holdings[0].dataStatus,'declared')
})

test('falls back to holding annual assumption when history is missing',()=>{
 const result=buildIncomeProjection([position],[],new Date('2026-07-21T00:00:00Z'))
 assert.equal(result.annualIncome,520)
 assert.equal(result.holdings[0].dataStatus,'holding-assumption')
 assert.ok(result.events.length>=51)
})

test('does not duplicate an explicit payment date',()=>{
 const records:DistributionRecord[]=[{id:'d1',ticker:'TEST',amountPerShare:.1,declarationDate:null,exDate:null,recordDate:null,paymentDate:'2026-07-28',frequency:'Weekly',status:'declared',source:'',notes:''}]
 const result=buildIncomeProjection([position],records,new Date('2026-07-21T00:00:00Z'),14)
 assert.equal(result.events.filter(e=>e.paymentDate==='2026-07-28').length,1)
})

test('validates malformed distribution records',()=>{
 const errors=validateDistribution({ticker:'',amountPerShare:0,declarationDate:null,exDate:'2026-08-02',recordDate:null,paymentDate:'2026-08-01',frequency:'Monthly',status:'declared',source:'',notes:''})
 assert.equal(errors.length,3)
})
