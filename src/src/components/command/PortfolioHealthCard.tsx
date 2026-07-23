import { Activity, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../../features/portfolio/PortfolioContext'
import { calculatePortfolioHealth } from '../../domain/health/portfolioHealth'

export function PortfolioHealthCard() {
  const { holdings, weeklyGoal } = usePortfolio()
  const health = calculatePortfolioHealth(holdings, weeklyGoal)
  return <article className="panel health-card">
    <div className="panel-heading"><div><span className="eyebrow">PORTFOLIO HEALTH SCORE™</span><h3>Explainable portfolio quality</h3></div><Activity size={19}/></div>
    <div className="health-summary"><div className="health-ring" style={{'--health': `${health.score * 3.6}deg`} as React.CSSProperties}><div><strong>{health.score}</strong><span>/ 100</span></div></div><div><span className="health-grade">{health.grade}</span><p>Strongest: <strong>{health.strongest.label}</strong></p><p>Review: <strong>{health.weakest.label}</strong></p></div></div>
    <div className="health-dimensions">{health.dimensions.map((dimension) => <div key={dimension.id}><span>{dimension.label}<strong>{Math.round(dimension.score)}</strong></span><i><b style={{width: `${dimension.score}%`}} /></i></div>)}</div>
    <Link className="panel-link" to="/intelligence">Open health analysis <ArrowUpRight size={14}/></Link>
  </article>
}
