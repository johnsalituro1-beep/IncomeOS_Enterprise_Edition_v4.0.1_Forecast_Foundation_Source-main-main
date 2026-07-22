export type EtfProfile = {
  ticker: string
  name: string
  issuer: string
  strategy: string
  assetClass: string
  distributionFrequency: 'Weekly' | 'Monthly' | 'Quarterly'
  expenseRatio?: number
  riskCategory: 'Moderate' | 'Elevated' | 'High'
  tags: string[]
}

export const ETF_KNOWLEDGE_BASE: EtfProfile[] = [
  { ticker: 'EDGQ', name: 'Income & Growth ETF', issuer: 'Demo Dataset', strategy: 'Equity income and growth', assetClass: 'US Equity', distributionFrequency: 'Weekly', riskCategory: 'Moderate', tags: ['income', 'growth', 'weekly'] },
  { ticker: 'XDTE', name: 'S&P 500 0DTE Covered Call', issuer: 'Demo Dataset', strategy: 'Same-day covered-call income', assetClass: 'US Large Cap', distributionFrequency: 'Weekly', riskCategory: 'Elevated', tags: ['covered call', 'weekly', '0DTE'] },
  { ticker: 'KYLD', name: 'Yield Premium Strategy ETF', issuer: 'Demo Dataset', strategy: 'Option-premium equity income', assetClass: 'US Equity', distributionFrequency: 'Weekly', riskCategory: 'Elevated', tags: ['covered call', 'income', 'weekly'] },
  { ticker: 'BCCC', name: 'Crypto Income Strategy ETF', issuer: 'Demo Dataset', strategy: 'Crypto-linked option income', assetClass: 'Digital Assets', distributionFrequency: 'Weekly', riskCategory: 'High', tags: ['crypto', 'options', 'weekly'] },
]
