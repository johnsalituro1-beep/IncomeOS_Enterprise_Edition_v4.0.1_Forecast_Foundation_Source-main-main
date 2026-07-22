export type MarketQuote = { ticker: string; price: number; asOf: string; currency: string }
export type IntegrationDistributionRecord = { ticker: string; exDate: string; payDate: string; amount: number; frequency: string }
export type BrokeragePosition = { accountId: string; ticker: string; shares: number; averageCost?: number }

export interface MarketDataProvider {
  getQuotes(tickers: string[]): Promise<MarketQuote[]>
  getDistributionHistory(ticker: string, from: string, to: string): Promise<IntegrationDistributionRecord[]>
}

export interface BrokerageProvider {
  listPositions(): Promise<BrokeragePosition[]>
}

export interface NotificationProvider {
  send(input: { title: string; message: string; channel: 'email' | 'push' | 'in-app' }): Promise<void>
}
