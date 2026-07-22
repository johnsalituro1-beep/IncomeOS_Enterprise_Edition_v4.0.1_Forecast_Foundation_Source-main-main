import type { CopilotAnswer, CopilotIntent, CopilotPortfolioSnapshot } from './types'

const detectIntent = (question: string): CopilotIntent => {
  const q = question.toLowerCase()
  if (q.includes('compare')) return 'compare-portfolios'
  if (q.includes('replace') || q.includes('alternative')) return 'replace-etf'
  if (q.includes('what if') || q.includes('retire') || q.includes('reinvest')) return 'scenario-question'
  if (q.includes('risk') || q.includes('score')) return 'risk-explanation'
  if (q.includes('income') || q.includes('week')) return 'income-goal'
  return 'portfolio-summary'
}

export function answerPortfolioQuestion(question: string, portfolio: CopilotPortfolioSnapshot): CopilotAnswer {
  const intent = detectIntent(question)
  const concentration = [...portfolio.holdings].sort((a,b) => b.weight-a.weight)[0]
  const lowRisk = [...portfolio.holdings].sort((a,b) => a.risk-b.risk)[0]
  const incomeGap = Math.max(0, 2000 - portfolio.weeklyIncome)
  const common = {
    intent,
    confidence: 82,
    citations: [
      { sourceId: `portfolio:${portfolio.id}`, label: `${portfolio.name} snapshot`, evidence: 'user-input' as const, asOf: 'Current workspace' },
      { sourceId: 'program-a:intelligence', label: 'ETF Universe intelligence layer', evidence: 'modeled' as const, asOf: 'Offline development dataset' },
    ],
    disclaimer: 'Decision-support output only. Market data in this offline build may be modeled and must be verified before investment decisions.',
  }
  if (intent === 'income-goal') return { ...common, headline: `Income gap: $${incomeGap.toFixed(0)} per week`, narrative: `The portfolio currently models $${portfolio.weeklyIncome.toFixed(0)} in weekly income. Closing the full gap without increasing risk would require additional capital, higher distribution exposure, or a longer timeline.`, bullets: [`Largest position: ${concentration.ticker} at ${concentration.weight}%`, `Lowest modeled risk holding: ${lowRisk.ticker}`, `Current Income OS Score: ${portfolio.osScore}/100`], actions: [{ id:'simulate-income',label:'Simulate $2,000/week plan',kind:'run-simulation',payload:{target:2000}}] }
  if (intent === 'risk-explanation') return { ...common, headline: `Risk score is ${portfolio.riskScore}/100`, narrative: `${concentration.ticker} is the largest modeled concentration and therefore the most influential holding in the risk assessment.`, bullets:[`Concentration contribution: ${concentration.weight}%`, `Diversification can be improved by reducing correlated exposure`, `OS Score is ${portfolio.osScore}/100`], actions:[{id:'open-risk',label:'Review concentration drivers',kind:'open-research',payload:{ticker:concentration.ticker}}] }
  if (intent === 'replace-etf') return { ...common, headline:`Replacement analysis ready for ${concentration.ticker}`, narrative:'The advisor workflow compares income, risk, cost, liquidity, overlap, and portfolio fit before proposing a substitution.', bullets:['No trade is applied automatically','Alternatives are ranked with explicit trade-offs','A Digital Twin branch is created before review'], actions:[{id:'replacement',label:`Find alternatives to ${concentration.ticker}`,kind:'run-simulation',payload:{ticker:concentration.ticker}}] }
  if (intent === 'scenario-question') return { ...common, headline:'Decision Studio scenario prepared', narrative:'The question will be converted into a reproducible Digital Twin branch with baseline and changed assumptions shown side by side.', bullets:['Baseline remains unchanged','Assumptions are captured in an audit ledger','Results include probability ranges and trade-offs'], actions:[{id:'branch',label:'Create scenario branch',kind:'clone-scenario',payload:{question}}] }
  return { ...common, headline:`${portfolio.name} is producing $${portfolio.weeklyIncome.toFixed(0)}/week`, narrative:`The modeled portfolio value is $${portfolio.marketValue.toLocaleString()} with an Income OS Score of ${portfolio.osScore}/100.`, bullets:[`${portfolio.holdings.length} holdings analyzed`,`${concentration.ticker} is the largest position`,`Risk score: ${portfolio.riskScore}/100`], actions:[{id:'brief',label:'Open portfolio briefing',kind:'open-research',payload:{portfolioId:portfolio.id}}] }
}
