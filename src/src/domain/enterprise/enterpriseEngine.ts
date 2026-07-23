import type { EnterpriseState } from './types'
export const enterpriseState:EnterpriseState={users:1248,tenants:84,portfolios:3920,apiHealth:99.97,syncHealth:98.8,queueDepth:17,
 flags:[
 {key:'digital_twin_v3',name:'Digital Twin v3',enabled:true,tiers:['pro','advisor','enterprise'],rollout:65},
 {key:'advisor_households',name:'Advisor households',enabled:true,tiers:['advisor','enterprise'],rollout:100},
 {key:'copilot_research',name:'Copilot research',enabled:false,tiers:['pro','advisor','enterprise'],rollout:15},
 {key:'enterprise_api',name:'Enterprise API',enabled:true,tiers:['enterprise'],rollout:100}],
 jobs:[
 {id:'j1',type:'universe-sync',status:'running',progress:72,nextRun:'2026-07-21T18:00:00-04:00'},
 {id:'j2',type:'score-refresh',status:'completed',progress:100,nextRun:'2026-07-22T02:00:00-04:00'},
 {id:'j3',type:'notification-digest',status:'queued',progress:0,nextRun:'2026-07-21T19:00:00-04:00'},
 {id:'j4',type:'report-generation',status:'completed',progress:100,nextRun:'on demand'}],
 audit:[
 {id:'a1',actor:'system',action:'ETF universe sync started',resource:'universe/us-etf',timestamp:'2026-07-21 16:00',severity:'info'},
 {id:'a2',actor:'admin@example.com',action:'Feature rollout changed',resource:'flags/copilot_research',timestamp:'2026-07-21 15:42',severity:'warning'},
 {id:'a3',actor:'system',action:'Backup verified',resource:'backup/daily',timestamp:'2026-07-21 03:10',severity:'info'}],
 integrations:[
 {id:'i1',category:'market-data',name:'Market Data Provider',status:'configured',mode:'sandbox'},
 {id:'i2',category:'brokerage',name:'Brokerage Connector',status:'not-connected',mode:'sandbox'},
 {id:'i3',category:'crm',name:'Advisor CRM',status:'configured',mode:'sandbox'},
 {id:'i4',category:'ai',name:'Copilot Provider',status:'configured',mode:'sandbox'}]}
export function readinessScore(s=enterpriseState){const pieces=[s.apiHealth,s.syncHealth,s.jobs.filter(j=>j.status!=='failed').length/s.jobs.length*100,s.integrations.filter(i=>i.status!=='not-connected').length/s.integrations.length*100,s.flags.filter(f=>f.enabled).length/s.flags.length*100];return Math.round(pieces.reduce((a,b)=>a+b,0)/pieces.length)}
export const apiModules=['/v1/portfolios','/v1/households','/v1/etfs','/v1/research','/v1/digital-twin','/v1/income-os-score','/v1/reports']
export const securityControls=['Tenant isolation','Role-based authorization','MFA-ready authentication','Encrypted secrets contract','Immutable audit trail','Backup and recovery runbook','Rate limiting','Data-retention policy']
