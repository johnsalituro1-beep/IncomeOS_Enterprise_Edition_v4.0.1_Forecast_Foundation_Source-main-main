import { Flag, Gauge, Target } from 'lucide-react'
import { useMemo, useState } from 'react'
import { calculateIncomeMilestone } from '../domain/intelligence/advancedIntelligence'
import { runScenario } from '../domain/scenarios/scenarioEngine'
import { usePortfolio } from '../features/portfolio/PortfolioContext'

const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function PlanningPage() {
  const { holdings, weeklyGoal } = usePortfolio()
  const milestone = useMemo(() => calculateIncomeMilestone(holdings, weeklyGoal), [holdings, weeklyGoal])
  const [capital, setCapital] = useState(25000)
  const [yieldPct, setYieldPct] = useState(12)
  const [growthPct, setGrowthPct] = useState(3)
  const [reinvestPct, setReinvestPct] = useState(25)
  const [years, setYears] = useState(5)
  const scenario = useMemo(() => runScenario(holdings, weeklyGoal, {
    name: 'Income Goal Plan', additionalCapital: capital, targetYieldPct: yieldPct,
    priceGrowthPct: growthPct, reinvestmentPct: reinvestPct, annualContribution: 0, years,
  }), [holdings, weeklyGoal, capital, yieldPct, growthPct, reinvestPct, years])

  return <div>
    <section className="page-heading"><div><span className="eyebrow">INCOME OS / GROWTH</span><h1>Income Goal Planner</h1><p>Model the capital, yield and reinvestment path required to reach a sustainable weekly-income target.</p></div></section>
    <section className="planning-grid">
      <article className="panel"><div className="panel-heading"><div><span className="eyebrow">CURRENT MILESTONE</span><h3>{money(milestone.currentWeeklyIncome)} / week</h3></div><Target size={19}/></div>
        <div className="goal-meter"><span style={{ width: `${milestone.progressPct}%` }}></span></div>
        <div className="planning-stats"><div><small>GOAL PROGRESS</small><strong>{milestone.progressPct.toFixed(1)}%</strong></div><div><small>ANNUAL GAP</small><strong>{money(milestone.annualGap)}</strong></div><div><small>EST. CAPITAL NEEDED</small><strong>{money(milestone.capitalRequiredAtCurrentYield)}</strong></div></div>
      </article>
      <article className="panel"><div className="panel-heading"><div><span className="eyebrow">SCENARIO CONTROLS</span><h3>Projection assumptions</h3></div><Gauge size={19}/></div>
        <div className="control-grid">
          <label>Additional capital<input type="number" min="0" value={capital} onChange={(event) => setCapital(Number(event.target.value))}/></label>
          <label>Target yield %<input type="number" min="0" step="0.5" value={yieldPct} onChange={(event) => setYieldPct(Number(event.target.value))}/></label>
          <label>Price growth %<input type="number" step="0.5" value={growthPct} onChange={(event) => setGrowthPct(Number(event.target.value))}/></label>
          <label>Reinvest %<input type="number" min="0" max="100" value={reinvestPct} onChange={(event) => setReinvestPct(Number(event.target.value))}/></label>
          <label>Years<input type="number" min="1" max="30" value={years} onChange={(event) => setYears(Number(event.target.value))}/></label>
        </div>
      </article>
    </section>
    <article className="panel projection-panel"><div className="panel-heading"><div><span className="eyebrow">PROJECTED OUTCOME</span><h3>{years}-year income path</h3></div><Flag size={19}/></div>
      <div className="projection-summary"><div><small>STARTING WEEKLY INCOME</small><strong>{money(scenario.startingWeeklyIncome)}</strong></div><div><small>ENDING WEEKLY INCOME</small><strong>{money(scenario.endingWeeklyIncome)}</strong></div><div><small>ENDING PORTFOLIO VALUE</small><strong>{money(scenario.endingValue)}</strong></div></div>
      <div className="projection-table"><div className="projection-row header"><span>Year</span><span>Portfolio value</span><span>Annual income</span><span>Cash income</span><span>Reinvested</span></div>{scenario.projection.map((point) => <div className="projection-row" key={point.year}><span>{point.year}</span><span>{money(point.portfolioValue)}</span><span>{money(point.annualIncome)}</span><span>{money(point.cashIncome)}</span><span>{money(point.reinvestedIncome)}</span></div>)}</div>
    </article>
  </div>
}
