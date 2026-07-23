import { ArrowUpRight, CalendarDays, CircleDollarSign, RefreshCw, TrendingUp, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePortfolio, usePortfolioMetrics } from '../features/portfolio/PortfolioContext'
import { DailyBriefing } from '../components/command/DailyBriefing'
import { IncomeTimeline } from '../components/command/IncomeTimeline'
import { IncomeIntelligencePanel } from '../components/intelligence/IncomeIntelligencePanel'
import { PortfolioHealthCard } from '../components/command/PortfolioHealthCard'
import { IncomeOSNavigation } from '../components/command/IncomeOSNavigation'
import { ForecastDashboardPanel } from '../components/forecast/ForecastDashboardPanel'

const money = (value: number, digits = 0) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: digits })

export function DashboardPage() {
  const { holdings } = usePortfolio()
  const metrics = usePortfolioMetrics()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const displayName = 'John'
  const upcoming = holdings.slice(0, 4).map((h, index) => ({ ...h, pay: ['Tomorrow', 'Friday', 'Next Tuesday', 'Next Friday'][index], expected: h.shares * h.annualDistributionPerShare / 52 }))
  return <div className="dashboard-page">
    <section className="page-heading dynamic-heading"><div><span className="eyebrow">{greeting.toUpperCase()}, {displayName.toUpperCase()}</span><h1>Income Command Center</h1><p>Next dividend payment: <strong>{upcoming[0]?.pay ?? 'Not scheduled'}</strong> <span className="heading-separator">•</span> Estimated deposit: <strong>{money(upcoming[0]?.expected ?? 0, 2)}</strong></p></div><div className="heading-actions"><button className="secondary-button" type="button" onClick={() => setNow(new Date())}><RefreshCw size={15}/> Refresh Data</button><Link className="gold-button" to="/portfolio">Manage Portfolio <ArrowUpRight size={15}/></Link></div></section>

    <IncomeOSNavigation />
    <DailyBriefing />

    <section className="metric-grid">
      <Metric icon={<WalletCards/>} label="Portfolio Value" value={money(metrics.portfolioValue)} detail={`${money(metrics.gainLoss)} unrealized`} positive />
      <Metric icon={<CalendarDays/>} label="Weekly Income" value={money(metrics.weeklyIncome,2)} detail={`${metrics.goalProgress.toFixed(1)}% of goal`} positive />
      <Metric icon={<CircleDollarSign/>} label="Annual Income" value={money(metrics.annualIncome)} detail={`${money(metrics.monthlyIncome)} monthly avg.`} positive />
      <Metric icon={<TrendingUp/>} label="Portfolio Yield" value={`${metrics.yieldPct.toFixed(2)}%`} detail="Forward distribution yield" positive />
    </section>

    <section className="dashboard-grid command-center-grid">
      <article className="panel income-center-panel">
        <div className="panel-title"><div><span>INCOME COMMAND CENTER</span><h2>{money(metrics.weeklyIncome,2)}</h2></div><span className="score-pill">{Math.round(metrics.goalProgress)}%</span></div>
        <div className="goal-track"><div style={{width: `${Math.min(metrics.goalProgress,100)}%`}}></div></div>
        <div className="goal-labels"><span>Weekly goal progress</span><strong>{money(metrics.weeklyGoal)} goal</strong></div>
        <div className="mini-stats"><div><small>MONTHLY</small><strong>{money(metrics.monthlyIncome)}</strong></div><div><small>ANNUAL</small><strong>{money(metrics.annualIncome)}</strong></div><div><small>HOLDINGS</small><strong>{holdings.length}</strong></div></div>
      </article>

      <PortfolioHealthCard />
    </section>

    <section className="dashboard-grid signature-grid"><IncomeTimeline />
      <article className="panel quick-actions"><div className="panel-heading"><div><span className="eyebrow">QUICK ACTIONS</span><h3>Manage your income system</h3></div></div><div className="quick-action-grid"><Link to="/portfolio">Add or review holdings</Link><Link to="/strategy">Run a strategy scenario</Link><Link to="/research">Research an ETF</Link><Link to="/settings">Update income goals</Link></div></article></section>

    <ForecastDashboardPanel />

    <section className="dashboard-grid lower-grid">
      <article className="panel payments-panel"><div className="panel-heading"><h3>Upcoming Payments</h3><Link to="/calendar">View calendar →</Link></div><div className="data-table compact"><div className="table-row table-head"><span>Ticker</span><span>Pay date</span><span>Frequency</span><span>Expected</span></div>{upcoming.map(item=><div className="table-row" key={item.id}><span className="ticker">{item.ticker}</span><span>{item.pay}</span><span><em>{item.paymentFrequency[0]}</em>{item.paymentFrequency}</span><strong className="positive">{money(item.expected,2)}</strong></div>)}</div></article>

      <IncomeIntelligencePanel />
    </section>
  </div>
}

function Metric({icon,label,value,detail,positive}:{icon:React.ReactNode,label:string,value:string,detail:string,positive?:boolean}){return <article className="metric-card"><div className="metric-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small className={positive?'positive':''}>{positive ? '↗ ' : ''}{detail}</small></div></article>}
