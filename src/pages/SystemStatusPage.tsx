import { useEffect, useState } from 'react'
import { runtimeConfig, validateRuntimeConfig } from '../config/runtime'
import { checkSupabaseHealth, type ServiceHealth } from '../services/systemHealth'

export function SystemStatusPage() {
  const [health, setHealth] = useState<ServiceHealth>({ service: 'Supabase', status: 'not-configured', detail: 'Health check pending.' })
  const issues = validateRuntimeConfig()

  useEffect(() => { void checkSupabaseHealth().then(setHealth) }, [])

  return <section className="page-stack">
    <header className="page-header">
      <div><span className="eyebrow">Production Foundation</span><h1>System Status</h1><p>Deployment configuration, runtime health, and release identity.</p></div>
    </header>
    <div className="status-grid">
      <article className="terminal-card"><span>Application</span><strong>{runtimeConfig.appName}</strong><p>Version {runtimeConfig.version}</p></article>
      <article className="terminal-card"><span>Environment</span><strong>{runtimeConfig.environment.toUpperCase()}</strong><p>Demo mode {runtimeConfig.enableDemoMode ? 'enabled' : 'disabled'}</p></article>
      <article className="terminal-card"><span>{health.service}</span><strong className={`status-${health.status}`}>{health.status.toUpperCase()}</strong><p>{health.detail}{health.latencyMs ? ` · ${health.latencyMs} ms` : ''}</p></article>
    </div>
    <article className="terminal-card">
      <h2>Configuration checks</h2>
      {issues.length === 0 ? <p className="status-healthy">All required production checks passed.</p> : issues.map(issue => <div className="config-issue" key={issue.key}><strong>{issue.severity.toUpperCase()} · {issue.key}</strong><p>{issue.message}</p></div>)}
    </article>
    <article className="terminal-card"><h2>Release gates</h2><ul className="release-gates"><li>TypeScript compilation</li><li>Vite production bundle</li><li>Static asset verification</li><li>Environment validation</li><li>Supabase connectivity test</li></ul></article>
  </section>
}
