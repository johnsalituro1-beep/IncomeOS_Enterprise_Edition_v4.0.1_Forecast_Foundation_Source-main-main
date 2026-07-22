import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleDollarSign, Download, FileSpreadsheet, Flag, Gauge, ShieldCheck, Sparkles, Upload, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { sampleCsv, onboardingReadiness, parsePortfolioCsv, type OnboardingProfile, type RiskTolerance } from '../features/onboarding/onboarding'
import { starterHoldings, usePortfolio, usePortfolioMetrics } from '../features/portfolio/PortfolioContext'
import type { Holding } from '../types/portfolio'

const defaultProfile: OnboardingProfile = {
  displayName: 'John', retirementAge: 58, weeklyIncomeTarget: 2000, annualContribution: 0,
  reinvestmentPct: 25, cashReserveMonths: 12, riskTolerance: 'Moderate', taxRatePct: 22,
}
const steps = ['Welcome', 'Portfolio', 'Goals', 'Review']
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function PortfolioOnboardingPage() {
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)
  const { holdings, replaceHoldings, setWeeklyGoal } = usePortfolio()
  const metrics = usePortfolioMetrics()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<OnboardingProfile>(() => {
    try { return JSON.parse(localStorage.getItem('incomeos-onboarding-profile') ?? '') as OnboardingProfile } catch { return defaultProfile }
  })
  const [draftHoldings, setDraftHoldings] = useState<Holding[]>(holdings)
  const [warnings, setWarnings] = useState<string[]>([])
  const readiness = useMemo(() => onboardingReadiness(profile, draftHoldings), [profile, draftHoldings])
  const projectedAnnualIncome = draftHoldings.reduce((sum, holding) => sum + holding.shares * holding.annualDistributionPerShare, 0)
  const projectedWeeklyIncome = projectedAnnualIncome / 52

  const updateProfile = <K extends keyof OnboardingProfile>(key: K, value: OnboardingProfile[K]) => setProfile((current) => ({ ...current, [key]: value }))
  const importText = (text: string) => {
    const result = parsePortfolioCsv(text)
    setWarnings(result.warnings)
    if (result.holdings.length) setDraftHoldings(result.holdings.map((holding) => ({ ...holding, id: crypto.randomUUID() })))
  }
  const loadDemo = () => { setDraftHoldings(starterHoldings.map((holding) => ({ ...holding, id: crypto.randomUUID() }))); setWarnings([]) }
  const complete = () => {
    const completedProfile = { ...profile, completedAt: new Date().toISOString() }
    replaceHoldings(draftHoldings)
    setWeeklyGoal(profile.weeklyIncomeTarget)
    localStorage.setItem('incomeos-onboarding-profile', JSON.stringify(completedProfile))
    localStorage.setItem('incomeos-onboarding-complete', 'true')
    navigate('/')
  }
  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([sampleCsv], { type: 'text/csv' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'incomeos-portfolio-import-template.csv'; anchor.click(); URL.revokeObjectURL(url)
  }

  return <section className="onboarding-page">
    <div className="page-heading"><div><div className="eyebrow">ENTERPRISE EDITION v1.3</div><h1>Portfolio Onboarding</h1><p>Build your investor profile, import holdings, and establish the goals that power IncomeOS.</p></div><div className="onboarding-readiness"><Gauge size={18}/><div><small>SETUP READINESS</small><strong>{readiness}%</strong></div></div></div>
    <div className="onboarding-stepper">{steps.map((label, index) => <div className={index === step ? 'active' : index < step ? 'complete' : ''} key={label}><span>{index < step ? <Check size={13}/> : index + 1}</span><strong>{label}</strong></div>)}</div>

    {step === 0 && <div className="onboarding-grid welcome-grid">
      <article className="panel onboarding-primary"><div className="onboarding-icon"><Sparkles/></div><div className="terminal-label">FIRST-RUN EXPERIENCE</div><h2>Welcome to your Income Operating System</h2><p>This guided setup creates the shared profile used by Mission Control, the Digital Twin, Income Copilot, and the Income OS Score.</p><label>Display name<input value={profile.displayName} onChange={(event) => updateProfile('displayName', event.target.value)} placeholder="Your name"/></label><div className="security-note"><ShieldCheck size={18}/><span>Demo mode stores onboarding data in this browser. Production mode is designed for Supabase authentication and row-level security.</span></div></article>
      <article className="panel onboarding-side"><div className="terminal-label">WHAT YOU WILL CONFIGURE</div>{[[UserRound,'Investor profile'],[FileSpreadsheet,'Portfolio holdings'],[Flag,'Income and retirement goals'],[Gauge,'Initial readiness assessment']].map(([Icon,label]) => { const C = Icon as typeof UserRound; return <div className="setup-feature" key={label as string}><C size={18}/><span>{label as string}</span><Check size={14}/></div>})}</article>
    </div>}

    {step === 1 && <div className="onboarding-grid portfolio-import-grid">
      <article className="panel onboarding-primary"><div className="panel-heading"><div><div className="terminal-label">PORTFOLIO SOURCE</div><h2>Import or start with a model portfolio</h2></div><button className="text-button" onClick={downloadTemplate}><Download size={14}/>CSV template</button></div>
        <div className="import-actions"><button className="primary-action" onClick={() => fileInput.current?.click()}><Upload size={17}/>Upload brokerage CSV</button><button className="secondary-action" onClick={loadDemo}>Load development portfolio</button><input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={async (event) => { const file = event.target.files?.[0]; if (file) importText(await file.text()) }}/></div>
        <textarea className="csv-paste" aria-label="Paste CSV" placeholder="Or paste CSV data here…" onBlur={(event) => event.target.value.trim() && importText(event.target.value)}/>
        {warnings.length > 0 && <div className="import-warnings">{warnings.map((warning) => <p key={warning}>• {warning}</p>)}</div>}
      </article>
      <article className="panel holdings-preview"><div className="terminal-label">IMPORT PREVIEW</div><h2>{draftHoldings.length} holdings</h2><div className="holding-preview-list">{draftHoldings.slice(0,8).map((holding) => <div key={holding.id}><strong>{holding.ticker}</strong><span>{holding.shares.toLocaleString()} shares</span><b>{money.format(holding.shares * holding.currentPrice)}</b></div>)}</div>{draftHoldings.length > 8 && <small>+ {draftHoldings.length - 8} more holdings</small>}</article>
    </div>}

    {step === 2 && <div className="onboarding-grid goals-grid">
      <article className="panel onboarding-primary"><div className="terminal-label">INVESTOR GOALS</div><h2>Define the operating parameters</h2><div className="goal-form">
        <label>Target retirement age<input type="number" value={profile.retirementAge} onChange={(e) => updateProfile('retirementAge', Number(e.target.value))}/></label>
        <label>Weekly income target<input type="number" value={profile.weeklyIncomeTarget} onChange={(e) => updateProfile('weeklyIncomeTarget', Number(e.target.value))}/></label>
        <label>Annual contributions<input type="number" value={profile.annualContribution} onChange={(e) => updateProfile('annualContribution', Number(e.target.value))}/></label>
        <label>Reinvestment percentage<input type="number" min="0" max="100" value={profile.reinvestmentPct} onChange={(e) => updateProfile('reinvestmentPct', Number(e.target.value))}/></label>
        <label>Cash reserve (months)<input type="number" value={profile.cashReserveMonths} onChange={(e) => updateProfile('cashReserveMonths', Number(e.target.value))}/></label>
        <label>Estimated tax rate<input type="number" min="0" max="60" value={profile.taxRatePct} onChange={(e) => updateProfile('taxRatePct', Number(e.target.value))}/></label>
      </div><div className="risk-options">{(['Conservative','Moderate','Growth','Aggressive'] as RiskTolerance[]).map((risk) => <button className={profile.riskTolerance === risk ? 'selected' : ''} key={risk} onClick={() => updateProfile('riskTolerance', risk)}>{risk}</button>)}</div></article>
      <article className="panel goal-summary"><CircleDollarSign size={28}/><div className="terminal-label">CURRENT INCOME ESTIMATE</div><strong>{money.format(projectedWeeklyIncome)}<small>/week</small></strong><p>Your imported holdings currently cover {profile.weeklyIncomeTarget ? Math.round(projectedWeeklyIncome / profile.weeklyIncomeTarget * 100) : 0}% of the target.</p><div className="progress"><i style={{ width: `${Math.min(100, profile.weeklyIncomeTarget ? projectedWeeklyIncome / profile.weeklyIncomeTarget * 100 : 0)}%` }}/></div></article>
    </div>}

    {step === 3 && <div className="onboarding-grid review-grid">
      <article className="panel onboarding-primary"><div className="terminal-label">ACTIVATION REVIEW</div><h2>Your IncomeOS workspace is ready to initialize</h2><div className="review-list"><div><span>Investor</span><strong>{profile.displayName}</strong></div><div><span>Holdings</span><strong>{draftHoldings.length}</strong></div><div><span>Portfolio value</span><strong>{money.format(draftHoldings.reduce((sum,h)=>sum+h.shares*h.currentPrice,0))}</strong></div><div><span>Estimated weekly income</span><strong>{money.format(projectedWeeklyIncome)}</strong></div><div><span>Weekly target</span><strong>{money.format(profile.weeklyIncomeTarget)}</strong></div><div><span>Risk profile</span><strong>{profile.riskTolerance}</strong></div><div><span>Reinvestment</span><strong>{profile.reinvestmentPct}%</strong></div><div><span>Readiness</span><strong>{readiness}%</strong></div></div></article>
      <article className="panel activation-panel"><ShieldCheck size={34}/><h2>Initialize investor workspace</h2><p>This will replace the current browser portfolio, save your goals, and open Enterprise Mission Control.</p><button className="primary-action" onClick={complete} disabled={!profile.displayName || draftHoldings.length === 0}><Sparkles size={17}/>Complete onboarding</button><small>Nothing in this workflow places trades or connects to a brokerage.</small></article>
    </div>}

    <div className="onboarding-footer"><button className="secondary-action" disabled={step === 0} onClick={() => setStep((current) => Math.max(0,current-1))}><ArrowLeft size={16}/>Back</button><span>Step {step + 1} of {steps.length}</span>{step < steps.length - 1 ? <button className="primary-action" disabled={(step === 0 && !profile.displayName) || (step === 1 && draftHoldings.length === 0)} onClick={() => setStep((current) => Math.min(steps.length-1,current+1))}>Continue<ArrowRight size={16}/></button> : <button className="primary-action" onClick={complete}>Finish<Check size={16}/></button>}</div>
    <div className="onboarding-baseline">Existing workspace baseline: {money.format(metrics.portfolioValue)} · {holdings.length} holdings</div>
  </section>
}
