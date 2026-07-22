import { Download, FileBarChart2 } from 'lucide-react'
import { useMemo } from 'react'
import { calculateIntelligenceScores } from '../domain/intelligence/advancedIntelligence'
import { usePortfolio } from '../features/portfolio/PortfolioContext'
import { createPortfolioReport, downloadPortfolioReport } from '../services/reports/portfolioReport'

export function ReportsPage() {
  const { holdings, weeklyGoal } = usePortfolio()
  const report = useMemo(() => createPortfolioReport(holdings, weeklyGoal), [holdings, weeklyGoal])
  const scores = calculateIntelligenceScores(holdings, weeklyGoal)
  return <div>
    <section className="page-heading"><div><span className="eyebrow">INCOME OS / REPORTING</span><h1>Institutional Reporting</h1><p>Generate a portable portfolio snapshot containing metrics, explainable scores, holdings and current intelligence signals.</p></div><button className="gold-button" type="button" onClick={() => downloadPortfolioReport(report)}><Download size={15}/> Export JSON report</button></section>
    <section className="score-grid">{scores.map((score) => <article className={`panel score-card ${score.status}`} key={score.id}><div className="score-ring"><strong>{score.score}</strong><small>/100</small></div><div><span className="eyebrow">{score.status.toUpperCase()}</span><h3>{score.label}</h3><p>{score.explanation}</p></div></article>)}</section>
    <article className="panel report-preview"><div className="panel-heading"><div><span className="eyebrow">REPORT CONTENTS</span><h3>Current export package</h3></div><FileBarChart2 size={19}/></div><div className="report-sections"><span>Portfolio metrics</span><span>Income milestone</span><span>Health dimensions</span><span>Intelligence insights</span><span>Complete holdings</span><span>Generation timestamp</span></div></article>
  </div>
}
