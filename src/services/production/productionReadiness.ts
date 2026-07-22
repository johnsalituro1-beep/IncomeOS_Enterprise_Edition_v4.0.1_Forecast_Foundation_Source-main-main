import type { ConfigurationIssue } from '../../config/runtime'

export type ReadinessCheck = { id:string; label:string; status:'pass'|'warn'|'fail'; detail:string }
export type ReadinessReport = { score:number; launchReady:boolean; checks:ReadinessCheck[] }

export function buildProductionReadiness(input:{issues:ConfigurationIssue[]; supabaseConfigured:boolean; monitoringConfigured:boolean; backupPolicyConfigured:boolean; serverSchedulerConfigured:boolean}):ReadinessReport {
  const checks:ReadinessCheck[] = [
    {id:'environment',label:'Production environment',status:input.issues.some(i=>i.severity==='error')?'fail':input.issues.length?'warn':'pass',detail:input.issues.length?`${input.issues.length} configuration issue(s) remain.`:'Runtime configuration passed.'},
    {id:'auth',label:'Authentication and persistence',status:input.supabaseConfigured?'pass':'fail',detail:input.supabaseConfigured?'Supabase authentication is configured.':'Supabase credentials are missing.'},
    {id:'monitoring',label:'Error monitoring',status:input.monitoringConfigured?'pass':'warn',detail:input.monitoringConfigured?'Monitoring endpoint configured.':'Configure VITE_SENTRY_DSN before public launch.'},
    {id:'backups',label:'Backup policy',status:input.backupPolicyConfigured?'pass':'warn',detail:input.backupPolicyConfigured?'Backup policy acknowledged.':'Set VITE_BACKUP_POLICY_CONFIRMED=true after recovery testing.'},
    {id:'scheduler',label:'Server scheduler',status:input.serverSchedulerConfigured?'pass':'warn',detail:input.serverSchedulerConfigured?'Unattended jobs endpoint configured.':'Browser scheduling remains the fallback.'},
  ]
  const points = checks.reduce((sum,c)=>sum+(c.status==='pass'?20:c.status==='warn'?10:0),0)
  return {score:points,launchReady:checks.every(c=>c.status!=='fail') && points>=80,checks}
}
