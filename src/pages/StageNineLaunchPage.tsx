import { Activity, BadgeCheck, CloudCog, Gauge, LifeBuoy, LockKeyhole, Rocket, ServerCog, TriangleAlert } from 'lucide-react'
import { calculateLaunchReadiness, environments, launchGates, serviceLevelObjectives } from '../services/production/launchReadiness'

export function StageNineLaunchPage() {
  const readiness = calculateLaunchReadiness()
  return <section className="stage-workspace launch-stage">
    <div className="page-heading"><div><span className="eyebrow">VERSION 15 · STAGE 9 FOUNDATION</span><h1>Commercial Launch & Production Readiness</h1><p>The operating model for testing, deployment, observability, security, support, and controlled release.</p></div><div className="stage-badge">{readiness.score}% LAUNCH READY</div></div>

    <div className="metric-grid compact"><div className="metric-tile"><Rocket/><span>Launch gates</span><strong>{launchGates.length}</strong></div><div className="metric-tile"><BadgeCheck/><span>Ready now</span><strong>{readiness.readyCount}</strong></div><div className="metric-tile"><TriangleAlert/><span>Blockers</span><strong>{readiness.blockers.length}</strong></div><div className="metric-tile"><CloudCog/><span>Environments</span><strong>{environments.length}</strong></div></div>

    <div className="two-column-grid">
      <article className="terminal-card"><div className="card-heading"><h2>Launch Gate Control</h2><Gauge size={18}/></div>{launchGates.map(gate => <div className="launch-gate" key={gate.id}><div><strong>{gate.title}</strong><span>{gate.category} · owner: {gate.owner}</span><small>{gate.evidence.join(' • ')}</small></div><b className={`gate-status ${gate.status}`}>{gate.status}</b></div>)}</article>
      <article className="terminal-card"><div className="card-heading"><h2>Deployment Environments</h2><ServerCog size={18}/></div>{environments.map(env => <div className="data-row" key={env.name}><span>{env.name}<small>{env.branch} · {env.dataMode} data</small></span><b className={`status-pill ${env.health === 'healthy' ? 'synced' : 'pending'}`}>{env.health}</b></div>)}</article>
    </div>

    <div className="two-column-grid">
      <article className="terminal-card"><div className="card-heading"><h2>Service-Level Objectives</h2><Activity size={18}/></div>{serviceLevelObjectives.map(slo => <div className="data-row" key={slo.name}><span>{slo.name}<small>{slo.window} · early warning {slo.alertAt}</small></span><b>{slo.target}</b></div>)}</article>
      <article className="terminal-card"><div className="card-heading"><h2>Production Workstreams Started</h2><LockKeyhole size={18}/></div><ul className="terminal-list"><li>CI/CD pipeline contracts and release promotion policy</li><li>Automated unit, integration, accessibility, and route smoke testing plan</li><li>Error reporting, structured logs, tracing, and SLO monitoring model</li><li>Security review, secrets management, privacy controls, and audit retention</li><li>Customer onboarding, support severity levels, and incident communications</li><li>Licensing, subscription activation, disclosure, and compliance review checklist</li></ul></article>
    </div>

    <article className="terminal-card blocker-card"><div className="card-heading"><h2>Critical Path</h2><LifeBuoy size={18}/></div><p>Stage 9 has started, but commercial launch remains intentionally blocked until a verified ETF data source is connected, dependencies compile in a registry-enabled environment, automated tests pass, and legal/security reviews are completed.</p></article>
  </section>
}
