import test from 'node:test'
import assert from 'node:assert/strict'
import { buildProductionReadiness } from '../src/services/production/productionReadiness.ts'

test('production readiness passes when all controls are configured',()=>{
 const r=buildProductionReadiness({issues:[],supabaseConfigured:true,monitoringConfigured:true,backupPolicyConfigured:true,serverSchedulerConfigured:true})
 assert.equal(r.score,100); assert.equal(r.launchReady,true)
})
test('missing authentication is a launch blocker',()=>{
 const r=buildProductionReadiness({issues:[],supabaseConfigured:false,monitoringConfigured:true,backupPolicyConfigured:true,serverSchedulerConfigured:true})
 assert.equal(r.launchReady,false); assert.equal(r.checks.find(c=>c.id==='auth')?.status,'fail')
})
test('warnings reduce score without always blocking preview readiness',()=>{
 const r=buildProductionReadiness({issues:[{key:'x',severity:'warning',message:'x'}],supabaseConfigured:true,monitoringConfigured:false,backupPolicyConfigured:true,serverSchedulerConfigured:true})
 assert.equal(r.score,80); assert.equal(r.launchReady,true)
})
