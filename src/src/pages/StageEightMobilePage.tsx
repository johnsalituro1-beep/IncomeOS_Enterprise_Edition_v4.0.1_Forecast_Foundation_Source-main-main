import { BellRing, Fingerprint, Mic2, RefreshCw, Smartphone, Tablet, Watch, WifiOff } from 'lucide-react'
import { buildOfflineSnapshot, defaultMobileWidgets, mobileReadinessScore, notificationPreferences, sampleDevices } from '../services/mobile/mobileEcosystem'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function StageEightMobilePage() {
  const readiness = mobileReadinessScore()
  const snapshot = buildOfflineSnapshot('primary-income-portfolio')
  return <section className="stage-workspace mobile-stage">
    <div className="page-heading"><div><span className="eyebrow">VERSION 14 · STAGE 8</span><h1>Mobile Ecosystem</h1><p>A shared mobile command layer for iPhone, iPad, Android, and companion devices.</p></div><div className="stage-badge">{readiness.score}% MOBILE READY</div></div>

    <div className="mobile-command-grid">
      <article className="phone-frame">
        <div className="phone-top"><span>9:41</span><strong>Income OS</strong><BellRing size={15}/></div>
        <div className="phone-body">
          <span className="eyebrow">MISSION CONTROL</span><h2>{money.format(350000)}</h2><small>Modeled portfolio value</small>
          <div className="phone-metrics"><div><b>$2,014</b><span>Weekly income</span></div><div><b>82</b><span>OS Score</span></div></div>
          <div className="mobile-progress"><i style={{width:'78%'}}></i></div><small>78% of weekly goal</small>
          <div className="mobile-card"><strong>Next payment window</strong><span>4 modeled distributions · $1,842</span></div>
          <div className="mobile-card"><strong>Copilot briefing</strong><span>Income remains on plan; issuer concentration needs review.</span></div>
        </div>
      </article>

      <div className="mobile-stage-panels">
        <div className="metric-grid compact"><div className="metric-tile"><Smartphone/><span>Phone</span><strong>Mission Control</strong></div><div className="metric-tile"><Tablet/><span>Tablet</span><strong>Research Workspace</strong></div><div className="metric-tile"><Watch/><span>Watch</span><strong>Income Glance</strong></div><div className="metric-tile"><Mic2/><span>Voice</span><strong>Copilot Ready</strong></div></div>
        <article className="terminal-card"><div className="card-heading"><h2>Device & Sync Control</h2><RefreshCw size={18}/></div>{sampleDevices.map(device => <div className="data-row" key={device.id}><span>{device.name}<small>{device.platform} · biometric {device.biometricEnabled ? 'on' : 'off'}</small></span><b className={`status-pill ${device.syncState}`}>{device.syncState}</b></div>)}</article>
        <article className="terminal-card"><div className="card-heading"><h2>Offline Portfolio Mode</h2><WifiOff size={18}/></div><div className="data-row"><span>Cached holdings</span><b>{snapshot.holdingsCount}</b></div><div className="data-row"><span>Research records</span><b>{snapshot.researchRecords}</b></div><div className="data-row"><span>Digital Twin scenarios</span><b>{snapshot.twinScenarios}</b></div><p className="fine-print">Snapshot contract includes expiration, checksum, and conflict-ready sync state.</p></article>
      </div>
    </div>

    <div className="two-column-grid">
      <article className="terminal-card"><div className="card-heading"><h2>Mobile Dashboard Builder</h2><Smartphone size={18}/></div>{defaultMobileWidgets.map(widget => <div className="data-row" key={widget.id}><span>#{widget.order} {widget.title}</span><b>{widget.enabled ? 'VISIBLE' : 'HIDDEN'}</b></div>)}</article>
      <article className="terminal-card"><div className="card-heading"><h2>Notification Center</h2><BellRing size={18}/></div>{notificationPreferences.map(pref => <div className="data-row" key={pref.event}><span>{pref.event.replaceAll('-', ' ')}</span><b>{pref.enabled ? pref.channels.join(' · ') : 'OFF'}</b></div>)}</article>
    </div>

    <article className="terminal-card"><div className="card-heading"><h2>Mobile Security & Release Readiness</h2><Fingerprint size={18}/></div><div className="readiness-grid">{readiness.checks.map(check => <div className={check.ready ? 'readiness-item ready' : 'readiness-item pending'} key={check.name}><span>{check.name}</span><b>{check.ready ? 'READY' : 'NEXT'}</b></div>)}</div></article>
  </section>
}
