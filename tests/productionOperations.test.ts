import test from 'node:test'
import assert from 'node:assert/strict'
import { buildOperationsSnapshot, calculateAvailability, classifyBackupStatus, classifyOverallStatus, decideAlert, nextBackoffSeconds, type BackupVerification, type HealthCheck, type Incident } from '../src/services/production/operationsMonitoring.ts'
const check=(status:HealthCheck['status']):HealthCheck=>({id:status,name:status,status,latencyMs:100,checkedAt:'2026-07-21T12:00:00Z',detail:''})
test('classifies operational, degraded, outage, and maintenance states',()=>{
 assert.equal(classifyOverallStatus([check('operational')]),'operational')
 assert.equal(classifyOverallStatus([check('operational'),check('degraded')]),'degraded')
 assert.equal(classifyOverallStatus([check('outage')]),'outage')
 assert.equal(classifyOverallStatus([check('outage')],true),'maintenance')
})
test('calculates availability from service checks',()=>assert.equal(calculateAvailability([check('operational'),check('degraded'),check('outage'),check('unknown')]),50))
test('escalates critical and repeated incidents',()=>{
 const incident:Incident={id:'1',title:'Provider failure',severity:'critical',status:'open',startedAt:'2026-07-21T12:00:00Z',resolvedAt:null,message:''}
 assert.equal(decideAlert(incident).channel,'pager')
 assert.equal(decideAlert({...incident,severity:'warning'},3).channel,'pager')
 assert.equal(decideAlert({...incident,severity:'info',status:'resolved'}).notify,false)
})
test('classifies verified recent backups as healthy',()=>{
 const backups:BackupVerification[]=[{id:'1',backupAt:'2026-07-21T10:00:00Z',verifiedAt:'2026-07-21T11:00:00Z',restoreTestedAt:'2026-07-21T11:00:00Z',status:'verified',notes:''}]
 assert.equal(classifyBackupStatus(backups,new Date('2026-07-21T12:00:00Z')),'healthy')
 assert.equal(buildOperationsSnapshot({checks:[check('operational')],incidents:[],backups}).backupStatus,'healthy')
})
test('uses bounded exponential retry intervals',()=>{
 assert.equal(nextBackoffSeconds(1),30); assert.equal(nextBackoffSeconds(2),60); assert.equal(nextBackoffSeconds(10),900)
})
