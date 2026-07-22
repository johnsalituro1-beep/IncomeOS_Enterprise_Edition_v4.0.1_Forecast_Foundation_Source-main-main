import { AlertTriangle, ArrowUpRight, BrainCircuit, CheckCircle2, Info, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../../features/portfolio/PortfolioContext'
import { generateIncomeInsights, type InsightSeverity } from '../../services/intelligence/incomeIntelligence'

const severityIcon = (severity: InsightSeverity) => {
  if (severity === 'positive') return <CheckCircle2 size={17} />
  if (severity === 'warning') return <AlertTriangle size={17} />
  if (severity === 'critical') return <ShieldAlert size={17} />
  return <Info size={17} />
}

export function IncomeIntelligencePanel() {
  const { holdings, weeklyGoal } = usePortfolio()
  const insights = generateIncomeInsights(holdings, weeklyGoal)

  return <article className="panel intelligence-engine-panel">
    <div className="panel-heading">
      <div><span className="eyebrow">INCOME INTELLIGENCE ENGINE™</span><h3>Portfolio briefing</h3></div>
      <BrainCircuit size={20} aria-hidden="true" />
    </div>
    <div className="intelligence-list">
      {insights.map((insight) => <div className={`intelligence-item ${insight.severity}`} key={insight.id}>
        <div className="intelligence-icon">{severityIcon(insight.severity)}</div>
        <div className="intelligence-copy"><div><strong>{insight.title}</strong>{insight.metric && <span>{insight.metric}</span>}</div><p>{insight.message}</p>{insight.actionPath && insight.actionLabel && <Link to={insight.actionPath}>{insight.actionLabel}<ArrowUpRight size={14}/></Link>}</div>
      </div>)}
    </div>
    <p className="intelligence-disclaimer">Rule-based preview for planning and portfolio monitoring. It does not provide investment advice.</p>
  </article>
}
