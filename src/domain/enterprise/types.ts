export type SubscriptionTier='free'|'pro'|'advisor'|'enterprise'
export type JobStatus='queued'|'running'|'completed'|'failed'
export interface FeatureFlag { key:string; name:string; enabled:boolean; tiers:SubscriptionTier[]; rollout:number }
export interface BackgroundJob { id:string; type:'universe-sync'|'score-refresh'|'report-generation'|'notification-digest'|'digital-twin'; status:JobStatus; progress:number; nextRun:string }
export interface AuditEvent { id:string; actor:string; action:string; resource:string; timestamp:string; severity:'info'|'warning'|'critical' }
export interface Integration { id:string; category:'brokerage'|'market-data'|'crm'|'calendar'|'tax'|'ai'; name:string; status:'connected'|'configured'|'not-connected'; mode:'sandbox'|'production' }
export interface EnterpriseState { users:number; tenants:number; portfolios:number; apiHealth:number; syncHealth:number; queueDepth:number; flags:FeatureFlag[]; jobs:BackgroundJob[]; audit:AuditEvent[]; integrations:Integration[] }
