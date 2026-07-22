import test from 'node:test'
import assert from 'node:assert/strict'
import { reconcileDistributionFeed } from '../src/features/distributions/distributionSyncEngine.ts'
import type { DataEnvelope, DistributionRecord as ProviderDistribution } from '../src/domain/live-data/types.ts'
import type { DistributionRecord } from '../src/features/distributions/distributionEngine.ts'

const envelope=(amount=0.25,revision=1,id='p1'):DataEnvelope<ProviderDistribution>=>({providerId:'vendor',kind:'distribution',symbol:'EDGQ',retrievedAt:'2026-07-21T12:00:00Z',effectiveAt:'2026-07-21T10:00:00Z',classification:'provider',confidence:.98,sourceRecordId:id,payload:{symbol:'EDGQ',exDate:'2026-07-24',payDate:'2026-07-31',recordDate:'2026-07-24',amount,distributionType:'income',revision}})
const existing=(overrides:Partial<DistributionRecord>={}):DistributionRecord=>({id:'e1',ticker:'EDGQ',amountPerShare:.2,declarationDate:null,exDate:'2026-07-24',recordDate:'2026-07-24',paymentDate:'2026-07-31',frequency:'Weekly',status:'declared',source:'vendor',notes:'',providerId:'vendor',providerRecordId:'p1',revision:1,...overrides})

test('inserts a new provider distribution',()=>{const r=reconcileDistributionFeed([], [envelope()]);assert.equal(r.inserted,1);assert.equal(r.decisions[0].record?.amountPerShare,.25)})
test('updates a revised provider record',()=>{const r=reconcileDistributionFeed([existing()], [envelope(.3,2)]);assert.equal(r.updated,1);assert.equal(r.decisions[0].record?.revision,2)})
test('preserves manual overrides',()=>{const r=reconcileDistributionFeed([existing({providerId:null,providerRecordId:null,source:'Manual',isManualOverride:true})], [envelope()]);assert.equal(r.skippedManual,1)})
test('rejects invalid provider amounts',()=>{const r=reconcileDistributionFeed([], [envelope(0)]);assert.equal(r.rejected,1)})
