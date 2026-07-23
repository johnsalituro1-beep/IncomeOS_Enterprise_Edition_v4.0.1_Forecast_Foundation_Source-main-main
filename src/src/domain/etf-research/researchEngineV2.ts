import type { Holding } from '../../types/portfolio'

export type EvidenceStatus = 'verified' | 'provider' | 'modeled' | 'missing'
export type ResearchRiskLevel = 'Low' | 'Moderate' | 'Elevated' | 'High'

export type ResearchEvidence = {
  label: string
  value: string
  status: EvidenceStatus
  note: string
}

export type ResearchDimension = {
  id: 'income' | 'growth' | 'risk' | 'diversification' | 'cost' | 'data-quality'
  label: string
  score: number
  explanation: string
}

export type DistributionInsight = {
  annualDistributionPerShare: number
  indicatedYieldPct: number
  estimatedWeeklyPerShare: number
  cadence: string
  sustainabilityFlag: 'Favorable' | 'Review' | 'Elevated Review'
  explanation: string
}

export type PortfolioFit = {
  role: string
  fitScore: number
  currentWeightPct: number
  projectedAnnualIncome: number
  contributionToPortfolioIncomePct: number
  observations: string[]
}

export type EtfResearchProfileV2 = {
  ticker: string
  name: string
  category: string
  strategy: string
  summary: string
  role: string
  riskLevel: ResearchRiskLevel
  dataQuality: number
  strengths: string[]
  considerations: string[]
  dimensions: ResearchDimension[]
  distribution: DistributionInsight
  portfolioFit: PortfolioFit
  peers: string[]
  evidence: ResearchEvidence[]
}

const peerMap: Record<string, string[]> = {
  'Equity Income': ['SCHD', 'DIVO', 'JEPI'],
  'Covered Call': ['JEPI', 'JEPQ', 'QYLD'],
  'Crypto Income': ['YBTC', 'MAXI', 'BLOX'],
  'Dividend Growth': ['DGRO', 'VIG', 'SCHD'],
  'Fixed Income': ['BND', 'AGG', 'JNK'],
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function categoryRisk(category: string, yieldPct: number): ResearchRiskLevel {
  if (category.includes('Crypto') || yieldPct >= 25) return 'High'
  if (category.includes('Covered') || yieldPct >= 16) return 'Elevated'
  if (yieldPct >= 10) return 'Moderate'
  return 'Low'
}

function strategyDescription(category: string) {
  if (category.includes('Covered')) return 'Equity exposure paired with an options-income overlay designed to convert volatility into cash distributions.'
  if (category.includes('Crypto')) return 'Digital-asset-linked income strategy with elevated volatility, concentration, and distribution variability.'
  if (category.includes('Equity Income')) return 'Equity income strategy balancing recurring distributions with participation in underlying company growth.'
  if (category.includes('Dividend Growth')) return 'Quality-oriented equity strategy emphasizing companies with a history of growing dividends.'
  if (category.includes('Fixed')) return 'Bond-oriented allocation designed to provide recurring income and portfolio ballast.'
  return 'Income-oriented ETF strategy requiring verified issuer documentation for a complete methodology assessment.'
}

export function buildEtfResearchProfileV2(holding: Holding, portfolio: Holding[]): EtfResearchProfileV2 {
  const marketValue = holding.shares * holding.currentPrice
  const annualIncome = holding.shares * holding.annualDistributionPerShare
  const portfolioValue = portfolio.reduce((sum, item) => sum + item.shares * item.currentPrice, 0)
  const portfolioIncome = portfolio.reduce((sum, item) => sum + item.shares * item.annualDistributionPerShare, 0)
  const yieldPct = holding.currentPrice ? holding.annualDistributionPerShare / holding.currentPrice * 100 : 0
  const weightPct = portfolioValue ? marketValue / portfolioValue * 100 : 0
  const incomeContributionPct = portfolioIncome ? annualIncome / portfolioIncome * 100 : 0
  const riskLevel = categoryRisk(holding.category, yieldPct)
  const concentrationPenalty = Math.max(0, weightPct - 25) * 1.4
  const highYieldPenalty = Math.max(0, yieldPct - 12) * 1.25
  const incomeScore = clamp(62 + Math.min(yieldPct, 20) * 1.6)
  const growthScore = clamp(78 - Math.max(0, yieldPct - 8) * 2.2 - (holding.category.includes('Crypto') ? 8 : 0))
  const riskScore = clamp(88 - highYieldPenalty - concentrationPenalty - (holding.category.includes('Crypto') ? 20 : 0))
  const diversificationScore = clamp(90 - concentrationPenalty - (portfolio.filter(item => item.category === holding.category).length - 1) * 8)
  const fitScore = clamp((incomeScore * .30) + (growthScore * .20) + (riskScore * .25) + (diversificationScore * .25))
  const dataQuality = 48
  const sustainabilityFlag = yieldPct >= 22 ? 'Elevated Review' : yieldPct >= 14 ? 'Review' : 'Favorable'

  const strengths = [
    `${holding.paymentFrequency} distribution cadence supports recurring cash-flow planning.`,
    `${yieldPct.toFixed(1)}% modeled indicated yield provides meaningful portfolio income.`,
    weightPct <= 25 ? 'Current position size remains below the modeled 25% concentration threshold.' : 'Position is a major income contributor to the portfolio.',
  ]
  const considerations = [
    yieldPct >= 14 ? 'The modeled yield is high enough to require distribution-coverage and NAV-sustainability review.' : 'Long-term total return should be reviewed alongside distribution yield.',
    weightPct > 25 ? `The position represents ${weightPct.toFixed(1)}% of portfolio value, creating concentration risk.` : 'Issuer and underlying holdings overlap require verified provider data.',
    'Expense ratio, assets under management, benchmark, holdings history, and tax character remain unverified in offline mode.',
  ]

  return {
    ticker: holding.ticker,
    name: holding.fundName,
    category: holding.category,
    strategy: strategyDescription(holding.category),
    summary: `${holding.ticker} is modeled as a ${holding.category} ETF with ${holding.paymentFrequency.toLowerCase()} distributions. In the current portfolio it represents ${weightPct.toFixed(1)}% of value and ${incomeContributionPct.toFixed(1)}% of projected annual income.`,
    role: holding.category.includes('Covered') || holding.category.includes('Crypto') ? 'Satellite income sleeve' : 'Core income and growth sleeve',
    riskLevel,
    dataQuality,
    strengths,
    considerations,
    dimensions: [
      { id: 'income', label: 'Income Potential', score: Math.round(incomeScore), explanation: 'Based on modeled indicated yield and payment cadence.' },
      { id: 'growth', label: 'Growth Participation', score: Math.round(growthScore), explanation: 'High distribution rates can reduce retained upside; verified total-return history is still required.' },
      { id: 'risk', label: 'Risk Balance', score: Math.round(riskScore), explanation: 'Reflects modeled yield, category risk, and current position concentration.' },
      { id: 'diversification', label: 'Diversification Fit', score: Math.round(diversificationScore), explanation: 'Measures position weight and duplication of portfolio strategy categories.' },
      { id: 'cost', label: 'Cost Efficiency', score: 50, explanation: 'Neutral placeholder until a verified expense ratio and trading-cost dataset is connected.' },
      { id: 'data-quality', label: 'Research Confidence', score: dataQuality, explanation: 'Portfolio inputs are available, but issuer and market-provider facts are not yet connected.' },
    ],
    distribution: {
      annualDistributionPerShare: holding.annualDistributionPerShare,
      indicatedYieldPct: yieldPct,
      estimatedWeeklyPerShare: holding.annualDistributionPerShare / 52,
      cadence: holding.paymentFrequency,
      sustainabilityFlag,
      explanation: sustainabilityFlag === 'Favorable'
        ? 'The modeled yield is within a range that can be evaluated without an automatic elevated-yield warning.'
        : 'The modeled yield requires deeper review of option premium, return of capital, realized gains, and NAV behavior.',
    },
    portfolioFit: {
      role: holding.category.includes('Covered') || holding.category.includes('Crypto') ? 'Income satellite' : 'Core allocation',
      fitScore: Math.round(fitScore),
      currentWeightPct: weightPct,
      projectedAnnualIncome: annualIncome,
      contributionToPortfolioIncomePct: incomeContributionPct,
      observations: [
        `${holding.ticker} contributes approximately $${annualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} of modeled annual income.`,
        weightPct > 25 ? 'Reducing the position would improve concentration balance.' : 'Position weight is within the modeled concentration guardrail.',
        incomeContributionPct > weightPct * 1.6 ? 'Income contribution is substantially higher than capital weight, indicating yield concentration.' : 'Income contribution is broadly proportional to capital allocation.',
      ],
    },
    peers: peerMap[holding.category] ?? ['JEPI', 'SCHD', 'DIVO'],
    evidence: [
      { label: 'Portfolio shares', value: holding.shares.toLocaleString(), status: 'modeled', note: 'Stored in the local portfolio workspace.' },
      { label: 'Current price', value: `$${holding.currentPrice.toFixed(2)}`, status: 'modeled', note: 'Offline demonstration value, not a live quote.' },
      { label: 'Distribution cadence', value: holding.paymentFrequency, status: 'modeled', note: 'Portfolio input requiring issuer verification.' },
      { label: 'Indicated yield', value: `${yieldPct.toFixed(2)}%`, status: 'modeled', note: 'Calculated from local price and annualized distribution inputs.' },
      { label: 'Issuer methodology', value: 'Provider not connected', status: 'missing', note: 'Required before production research can be considered complete.' },
      { label: 'Holdings and benchmark', value: 'Provider not connected', status: 'missing', note: 'Will be supplied by the ETF Universe research pipeline.' },
    ],
  }
}

export function searchResearchUniverse(query: string, holdings: Holding[]) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return holdings
  return holdings.filter(holding => [holding.ticker, holding.fundName, holding.category, holding.paymentFrequency]
    .some(value => value.toLowerCase().includes(normalized)))
}

export function compareResearchProfiles(profiles: EtfResearchProfileV2[]) {
  if (!profiles.length) return null
  return {
    highestIncome: [...profiles].sort((a, b) => b.dimensions[0].score - a.dimensions[0].score)[0],
    bestRiskBalance: [...profiles].sort((a, b) => b.dimensions[2].score - a.dimensions[2].score)[0],
    bestPortfolioFit: [...profiles].sort((a, b) => b.portfolioFit.fitScore - a.portfolioFit.fitScore)[0],
    highestConfidence: [...profiles].sort((a, b) => b.dataQuality - a.dataQuality)[0],
  }
}
