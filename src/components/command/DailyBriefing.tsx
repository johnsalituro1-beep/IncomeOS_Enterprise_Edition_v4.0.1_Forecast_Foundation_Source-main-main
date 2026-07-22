import { AlertTriangle, CalendarClock, CheckCircle2, Target, Trophy } from 'lucide-react'
import { usePortfolio, usePortfolioMetrics } from '../../features/portfolio/PortfolioContext'

const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function DailyBriefing() {
  const { holdings } = usePortfolio()
  const metrics = usePortfolioMetrics()
  const top = [...holdings].sort((a,b) => b.shares*b.annualDistributionPerShare - a.shares*a.annualDistributionPerShare)[0]
  const onTrack = metrics.goalProgress >= 80
  return <article className="panel daily-briefing">
    <div className="panel-heading"><div><span className="eyebrow">TODAY'S INCOME BRIEFING</span><h3>Portfolio at a glance</h3></div><span className={`brief-status ${onTrack ? 'good' : 'watch'}`}>{onTrack ? <CheckCircle2 size={14}/> : <AlertTriangle size={14}/>} {onTrack ? 'ON TRACK' : 'REVIEW'}</span></div>
    <div className="briefing-grid">
      <Brief icon={<CalendarClock/>} label="Estimated this week" value={money(metrics.weeklyIncome)} />
      <Brief icon={<Target/>} label="Goal completion" value={`${metrics.goalProgress.toFixed(0)}%`} />
      <Brief icon={<Trophy/>} label="Top income holding" value={top?.ticker ?? '—'} />
      <Brief icon={<CheckCircle2/>} label="Action required" value={onTrack ? 'None' : 'Review allocations'} />
    </div>
  </article>
}

function Brief({icon,label,value}:{icon:React.ReactNode,label:string,value:string}) { return <div className="brief-item"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div> }
