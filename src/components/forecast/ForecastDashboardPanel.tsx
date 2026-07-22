import { RotateCcw, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { useForecast } from '../../features/forecast/ForecastContext'
import { buildForecastChartPoints, buildLinePath } from './forecastChart'

const money = (value: number, digits = 0) => value.toLocaleString('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: digits,
})
const percent = (value: number) => `${value.toFixed(1)}%`

export function ForecastDashboardPanel() {
  const { assumptions, result, status, error, updateAssumptions, resetAssumptions } = useForecast()
  const { summary, confidence, timeline, warnings } = result
  const points = useMemo(() => buildForecastChartPoints(timeline), [timeline])
  const linePath = buildLinePath(points)
  const areaPath = points.length ? `${linePath} L${points.at(-1)!.x.toFixed(1)} 190 L${points[0].x.toFixed(1)} 190 Z` : ''
  const incomeGrowth = summary.startingAnnualIncome > 0
    ? (summary.projectedAnnualIncome / summary.startingAnnualIncome - 1) * 100
    : 0

  return <section className="forecast-workspace" aria-labelledby="forecast-heading">
    <article className="panel forecast-controls-panel">
      <div className="panel-heading forecast-heading-row">
        <div><span className="eyebrow">FORECAST ENGINE</span><h3 id="forecast-heading">Income projection controls</h3></div>
        <div className="forecast-status"><i className={status}/><span>{status}</span></div>
      </div>
      <div className="forecast-control-grid">
        <ForecastRange label="Reinvest distributions" value={assumptions.reinvestmentRate} suffix="%" min={0} max={100} step={5} onChange={value => updateAssumptions({ reinvestmentRate: value })}/>
        <ForecastRange label="Distribution growth" value={assumptions.annualDistributionGrowthRate * 100} suffix="%" min={0} max={15} step={0.5} onChange={value => updateAssumptions({ annualDistributionGrowthRate: value / 100 })}/>
        <ForecastRange label="Price growth" value={assumptions.annualPriceGrowthRate * 100} suffix="%" min={0} max={15} step={0.5} onChange={value => updateAssumptions({ annualPriceGrowthRate: value / 100 })}/>
        <ForecastRange label="Inflation" value={assumptions.inflationRate * 100} suffix="%" min={0} max={10} step={0.25} onChange={value => updateAssumptions({ inflationRate: value / 100 })}/>
        <label className="forecast-select"><span>Forecast horizon</span><select value={assumptions.horizonYears} onChange={event => updateAssumptions({ horizonYears: Number(event.target.value) })}>{[1,3,5,10,20,30].map(years=><option key={years} value={years}>{years} year{years === 1 ? '' : 's'}</option>)}</select></label>
        <button className="secondary-button forecast-reset" type="button" onClick={resetAssumptions}><RotateCcw size={14}/> Reset assumptions</button>
      </div>
      {error && <p className="forecast-message error-text">{error}</p>}
      {!error && warnings.length > 0 && <p className="forecast-message">{warnings[0]}</p>}
    </article>

    <div className="forecast-summary-grid">
      <ForecastCard label={`Projected weekly income · Year ${assumptions.horizonYears}`} value={money(summary.projectedWeeklyIncome, 2)} detail={`${incomeGrowth >= 0 ? '+' : ''}${percent(incomeGrowth)} total income growth`} />
      <ForecastCard label="Projected annual income" value={money(summary.projectedAnnualIncome)} detail={`${money(summary.inflationAdjustedAnnualIncome)} inflation-adjusted`} />
      <ForecastCard label="Ending portfolio value" value={money(summary.endingPortfolioValue)} detail={`${money(summary.totalReinvested)} distributions reinvested`} />
      <ForecastCard label="Forecast confidence" value={`${confidence.score}/100`} detail={`${confidence.level} confidence · ${summary.projectedYield.toFixed(2)}% projected yield`} />
    </div>

    <article className="panel forecast-chart-panel">
      <div className="panel-heading"><div><span className="eyebrow">PROJECTED TRAJECTORY</span><h3>Annual income timeline</h3></div><span className="forecast-horizon-badge"><TrendingUp size={13}/>{assumptions.horizonYears}Y MODEL</span></div>
      {points.length ? <>
        <svg viewBox="0 0 600 220" role="img" aria-label={`${assumptions.horizonYears}-year projected annual income timeline`}>
          <defs><linearGradient id="forecastArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f4b91f" stopOpacity=".36"/><stop offset="1" stopColor="#f4b91f" stopOpacity="0"/></linearGradient></defs>
          <g className="grid-lines"><line x1="36" y1="36" x2="564" y2="36"/><line x1="36" y1="87" x2="564" y2="87"/><line x1="36" y1="139" x2="564" y2="139"/><line x1="36" y1="190" x2="564" y2="190"/></g>
          <path className="chart-area" d={areaPath}/><path className="chart-line" d={linePath}/>
          {points.map((point,index)=><g key={`${point.label}-${index}`}><circle className="forecast-chart-dot" cx={point.x} cy={point.y} r="3"/><text className="forecast-axis-label" x={point.x} y="211" textAnchor="middle">{index % Math.max(1, Math.floor(points.length / 6)) === 0 || index === points.length - 1 ? point.label : ''}</text></g>)}
        </svg>
        <div className="forecast-chart-footer"><span>Starting annual income <strong>{money(summary.startingAnnualIncome)}</strong></span><span>Cumulative distributions <strong>{money(summary.cumulativeDistributions)}</strong></span><span>Ending annual income <strong>{money(summary.projectedAnnualIncome)}</strong></span></div>
      </> : <div className="forecast-empty"><SlidersHorizontal size={24}/><strong>Add holdings to activate the forecast timeline</strong><span>The model will recalculate automatically from your portfolio.</span></div>}
    </article>
  </section>
}

function ForecastRange({ label, value, suffix, min, max, step, onChange }: { label: string, value: number, suffix: string, min: number, max: number, step: number, onChange: (value: number) => void }) {
  return <label className="forecast-range"><span>{label}<strong>{value.toFixed(step < 1 ? 2 : value % 1 ? 1 : 0)}{suffix}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))}/></label>
}
function ForecastCard({ label, value, detail }: { label: string, value: string, detail: string }) {
  return <article className="forecast-summary-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}
