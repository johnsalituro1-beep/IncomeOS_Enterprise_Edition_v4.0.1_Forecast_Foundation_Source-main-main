export const ETF_TAXONOMY = {
  incomeStyles: ['Covered Call','Option Income','High Dividend','Dividend Growth','Preferred Stock','REIT','MLP','BDC','Treasury','Corporate Bond','Municipal Bond','Floating Rate','Multi-Asset Income'],
  growthThemes: ['Artificial Intelligence','Technology','Semiconductors','Quantum Computing','Cybersecurity','Healthcare Innovation','Robotics','Space','Cloud Computing','Infrastructure','Clean Energy'],
  marketSegments: ['US Large Cap','US Mid Cap','US Small Cap','International Developed','Emerging Markets','Global','Value','Growth','Blend','Sector','Thematic'],
  optionStrategies: ['None','Traditional Covered Call','0DTE Covered Call','Put Write','Synthetic Covered Call','Collar','Defined Outcome','Option Spread'],
  assetClasses: ['Equity','Fixed Income','Commodity','Real Estate','Digital Asset Exposure','Multi-Asset','Currency','Alternatives'],
} as const

export function normalizeTaxonomyValue(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}
