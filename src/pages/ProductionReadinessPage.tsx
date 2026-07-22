import { runtimeConfig, validateRuntimeConfig } from '../config/runtime'
import { isSupabaseConfigured } from '../lib/supabase'
import { buildProductionReadiness } from '../services/production/productionReadiness'

export function ProductionReadinessPage(){
 const report=buildProductionReadiness({issues:validateRuntimeConfig(),supabaseConfigured:isSupabaseConfigured,monitoringConfigured:Boolean(runtimeConfig.sentryDsn),backupPolicyConfigured:runtimeConfig.backupPolicyConfirmed,serverSchedulerConfigured:Boolean(runtimeConfig.serverJobsUrl)})
 return <section className="page-stack"><header className="page-header"><div><span className="eyebrow">Phase 3 · Milestone 1</span><h1>Production Readiness</h1><p>Infrastructure, security, recovery, and launch gates for IncomeOS v3.0.</p></div></header>
 <div className="status-grid"><article className="terminal-card"><span>Readiness score</span><strong>{report.score}/100</strong><p>{report.launchReady?'Launch gates satisfied':'Additional production work required'}</p></article><article className="terminal-card"><span>Environment</span><strong>{runtimeConfig.environment.toUpperCase()}</strong><p>Version {runtimeConfig.version}</p></article></div>
 <article className="terminal-card"><h2>Launch checklist</h2>{report.checks.map(c=><div className="config-issue" key={c.id}><strong className={`status-${c.status==='pass'?'healthy':c.status==='fail'?'unhealthy':'not-configured'}`}>{c.status.toUpperCase()} · {c.label}</strong><p>{c.detail}</p></div>)}</article>
 <article className="terminal-card"><h2>Required production controls</h2><ul className="release-gates"><li>Separate development, preview, and production environment variables</li><li>Supabase email verification and password recovery</li><li>Server-side cron/queue worker for unattended refreshes</li><li>Daily backups with documented restore testing</li><li>Error monitoring, security headers, and deployment rollback</li></ul></article></section>
}
