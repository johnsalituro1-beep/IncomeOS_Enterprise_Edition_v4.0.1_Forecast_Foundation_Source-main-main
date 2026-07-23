import { useMemo, useState } from 'react'
import { Activity, ArrowUpRight, BellRing, Bot, CalendarClock, CheckCircle2, ChevronDown, CircleDollarSign, Gauge, LayoutDashboard, RefreshCw, Settings2, ShieldAlert, Sparkles, Target, TrendingUp } from 'lucide-react'
import { usePortfolio, usePortfolioMetrics } from '../features/portfolio/PortfolioContext'
import { buildCashEvents } from '../domain/mission-control/missionControl'
import { buildMissionSnapshot, defaultMissionWidgets } from '../domain/mission-control/missionControlV2'
import { askIncomeCopilot } from '../domain/copilot/incomeCopilot'

const money = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`

export function StageFourBuildPage() {
  const { holdings, weeklyGoal } = usePortfolio()
  const metrics = usePortfolioMetrics()
  const snapshot = useMemo(() => buildMissionSnapshot(holdings, weeklyGoal), [holdings, weeklyGoal])
  const events = useMemo(() => buildCashEvents(holdings), [holdings])
  const [range, setRange] = useState<'12W' | '26W' | '52W'>('12W')
  const [widgets, setWidgets] = useState(defaultMissionWidgets)
  const [customizing, setCustomizing] = useState(false)
  const [question, setQuestion] = useState('Give me today’s portfolio briefing')
  const [copilot, setCopilot] = useState(() => askIncomeCopilot(question, holdings, metrics.weeklyIncome, weeklyGoal))

  const maxPulse = Math.max(...snapshot.pulse.map((p) => p.amount), weeklyGoal)
  const projected30 = events.slice(0, 8).reduce((sum, event) => sum + event.amount, 0)
  const osScore = Math.max(0, Math.min(100, Math.round(
    78 - snapshot.concentration * 25 + Math.min(12, snapshot.incomeCoverage * 8) - snapshot.priorities.filter((p) => p.severity === 'critical').length * 8,
  )))

  const ask = () => setCopilot(askIncomeCopilot(question, holdings, metrics.weeklyIncome, weeklyGoal))
  const toggleWidget = (id: string) => setWidgets((current) => current.map((widget) => widget.id === id ? { ...widget, enabled: !widget.enabled } : widget))

  return <div className="stage4-page">
    <div className="page-heading stage4-heading">
      <div><span className="eyebrow">VERSION 10 · STAGE 4</span><h1>Mission Control 2.0</h1><p>A Bloomberg-style operating surface for income, risk, goals, research, and next-best actions.</p></div>
      <div className="stage4-heading-actions"><button className="terminal-button secondary" onClick={() => setCustomizing((value) => !value)}><Settings2 size={15}/>Customize</button><span className="heading-badge"><Activity size={15}/> MODEL ONLINE</span></div>
    </div>

    {customizing && <section className="panel widget-config"><div className="panel-title"><LayoutDashboard size={16}/><h2>Workspace Configuration</h2></div><div>{widgets.map((widget) => <label key={widget.id}><input type="checkbox" checked={widget.enabled} onChange={() => toggleWidget(widget.id)}/><span>{widget.title}</span><small>Widget {widget.rank}</small></label>)}</div></section>}

    <section className="stage4-command-strip">
      <article><CircleDollarSign/><div><small>PORTFOLIO VALUE</small><strong>{money(snapshot.portfolioValue)}</strong><span className={metrics.gainLoss >= 0 ? 'positive' : 'negative'}>{metrics.gainLoss >= 0 ? '+' : ''}{money(metrics.gainLoss)} unrealized</span></div></article>
      <article><TrendingUp/><div><small>WEEKLY INCOME</small><strong>{money(snapshot.weeklyIncome)}</strong><span>{(snapshot.incomeCoverage * 100).toFixed(1)}% mission coverage</span></div></article>
      <article><CalendarClock/><div><small>NEXT CASH WINDOW</small><strong>{money(projected30)}</strong><span>{events.slice(0, 8).length} modeled distributions</span></div></article>
      <article><Gauge/><div><small>INCOME OS SCORE</small><strong>{osScore}</strong><span>{osScore >= 75 ? 'Operating range' : 'Needs attention'}</span></div></article>
      <article><Target/><div><small>MISSION GAP</small><strong>{money(Math.max(0, weeklyGoal - snapshot.weeklyIncome))}</strong><span>per week to target</span></div></article>
    </section>

    <section className="stage4-grid-main">
      {widgets.find((w) => w.id === 'income-pulse')?.enabled && <article className="panel income-pulse-panel">
        <div className="panel-title split"><div><Activity size={16}/><h2>Income Pulse</h2></div><div className="range-tabs">{(['12W','26W','52W'] as const).map((item) => <button className={range === item ? 'active' : ''} onClick={() => setRange(item)} key={item}>{item}</button>)}</div></div>
        <div className="pulse-chart" aria-label={`Income pulse ${range}`}>
          {snapshot.pulse.map((point) => <div className="pulse-column" key={point.label}><div className="pulse-bar-shell"><i style={{ height: `${Math.max(8, point.amount / maxPulse * 100)}%` }} className={point.amount >= weeklyGoal ? 'above' : 'below'}></i><b>{money(point.amount)}</b></div><small>{point.label}</small></div>)}
          <span className="pulse-target" style={{ bottom: `${weeklyGoal / maxPulse * 100}%` }}><em>Target {money(weeklyGoal)}</em></span>
        </div>
        <div className="pulse-footer"><div><small>ANNUALIZED</small><strong>{money(snapshot.annualIncome)}</strong></div><div><small>YEAR-1 MODELED</small><strong>{money(snapshot.projectedYearOneIncome)}</strong></div><div><small>LARGEST INCOME SOURCE</small><strong>{snapshot.largestIncomeSource}</strong></div></div>
      </article>}

      {widgets.find((w) => w.id === 'priorities')?.enabled && <article className="panel priority-queue-panel">
        <div className="panel-title split"><div><ShieldAlert size={16}/><h2>Priority Queue</h2></div><span>{snapshot.priorities.length} OPEN</span></div>
        <div className="priority-list">{snapshot.priorities.length ? snapshot.priorities.map((priority) => <div className={`priority-item ${priority.severity}`} key={priority.id}><i></i><div><header><b>{priority.title}</b><span>{priority.impact}</span></header><p>{priority.detail}</p><button>{priority.action}<ArrowUpRight size={13}/></button></div></div>) : <div className="all-clear"><CheckCircle2/><b>All systems within configured parameters</b><span>No mission-critical issues detected.</span></div>}</div>
      </article>}
    </section>

    <section className="stage4-grid-secondary">
      {widgets.find((w) => w.id === 'calendar')?.enabled && <article className="panel mission-calendar"><div className="panel-title split"><div><CalendarClock size={16}/><h2>Cash Calendar</h2></div><button className="text-button">Open calendar <ArrowUpRight size={12}/></button></div><div>{events.slice(0, 6).map((event) => <div key={event.id}><time>{new Date(event.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</time><b>{event.ticker}</b><span>{event.type}</span><strong>{money(event.amount)}</strong></div>)}</div></article>}

      {widgets.find((w) => w.id === 'digital-twin')?.enabled && <article className="panel twin-snapshot"><div className="panel-title split"><div><Sparkles size={16}/><h2>Digital Twin Snapshot</h2></div><span>BASE CASE</span></div><div className="twin-orbit"><div><small>NOW</small><strong>{money(snapshot.portfolioValue)}</strong></div><i><ArrowUpRight/></i><div><small>12-MONTH INCOME</small><strong>{money(snapshot.projectedYearOneIncome)}</strong></div></div><div className="twin-facts"><span><b>3.5%</b> modeled income growth</span><span><b>{(snapshot.incomeCoverage * 100).toFixed(0)}%</b> goal coverage</span><span><b>{(snapshot.concentration * 100).toFixed(0)}%</b> largest position</span></div><button className="terminal-button secondary full">Open Digital Twin Workspace</button></article>}

      {widgets.find((w) => w.id === 'watchlist')?.enabled && <article className="panel research-watch"><div className="panel-title split"><div><BellRing size={16}/><h2>Research Watch</h2></div><span>3 SIGNALS</span></div>{holdings.slice(0,3).map((holding,index) => <div key={holding.id}><b>{holding.ticker}</b><p>{index === 0 ? 'Distribution consistency review queued' : index === 1 ? 'Peer comparison ready' : 'Concentration sensitivity updated'}</p><small>{index === 0 ? 'INCOME' : index === 1 ? 'RESEARCH' : 'RISK'}</small></div>)}</article>}
    </section>

    <section className="panel stage4-copilot">
      <div className="copilot-title"><Bot/><div><span>INCOME COPILOT™ COMMAND BAR</span><small>Ask about income, risk, goals, research, or Digital Twin scenarios.</small></div><button className="icon-button" title="Refresh" onClick={ask}><RefreshCw size={16}/></button></div>
      <div className="stage4-copilot-body"><div className="copilot-response"><small>PORTFOLIO BRIEFING</small><h3>{copilot.headline}</h3><p>{copilot.answer}</p><div>{copilot.evidence.slice(0,3).map((item) => <span key={item}><CheckCircle2 size={12}/>{item}</span>)}</div></div><div className="copilot-command"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} aria-label="Ask Income Copilot"/><button onClick={ask}>Run command <ArrowUpRight size={14}/></button><label>Confidence: {copilot.confidence}<ChevronDown size={12}/></label></div></div>
    </section>

    <section className="stage4-delivery panel"><div className="panel-title"><CheckCircle2 size={16}/><h2>Stage 4 Delivery</h2></div><div><span>Mission Control 2.0 workspace</span><span>Configurable widget registry</span><span>Income pulse visualization</span><span>Priority decision queue</span><span>Digital Twin snapshot card</span><span>Copilot command bar</span><span>Cash calendar integration</span><span>Responsive terminal layout</span></div></section>
  </div>
}
