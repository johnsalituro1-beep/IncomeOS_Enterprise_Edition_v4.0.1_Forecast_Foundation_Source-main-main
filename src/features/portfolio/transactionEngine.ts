import type { PortfolioTransaction, TransactionDraft } from '../../types/portfolio'

export type { PortfolioTransaction, TransactionDraft, TransactionType } from '../../types/portfolio'

export function validateTransaction(input: Partial<TransactionDraft>) {
  const errors: string[] = []
  const type = input.type ?? 'buy'
  const ticker = String(input.ticker ?? '').trim().toUpperCase()
  const tradeDate = String(input.tradeDate ?? '')
  const shares = Number(input.shares ?? 0)
  const price = Number(input.price ?? 0)
  const fees = Number(input.fees ?? 0)
  const notes = String(input.notes ?? '').trim()
  const securityTrade = type === 'buy' || type === 'sell' || type === 'dividend'

  if (!['buy','sell','dividend','fee','deposit','withdrawal'].includes(type)) errors.push('Select a supported transaction type.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tradeDate)) errors.push('Enter a valid transaction date.')
  if (securityTrade && !/^[A-Z][A-Z0-9.-]{0,9}$/.test(ticker)) errors.push('Ticker is required for security transactions.')
  if ((type === 'buy' || type === 'sell') && (!Number.isFinite(shares) || shares <= 0)) errors.push('Shares must be greater than zero for buys and sells.')
  if (!Number.isFinite(price) || price < 0) errors.push('Price or amount cannot be negative.')
  if (!Number.isFinite(fees) || fees < 0) errors.push('Fees cannot be negative.')

  return errors.length
    ? { valid: false as const, errors }
    : { valid: true as const, transaction: { holdingId: input.holdingId ?? null, ticker: ticker || null, type, tradeDate, shares, price, fees, notes } }
}

export function transactionCashFlow(transaction: PortfolioTransaction) {
  const gross = transaction.shares > 0 ? transaction.shares * transaction.price : transaction.price
  switch (transaction.type) {
    case 'buy': return -(gross + transaction.fees)
    case 'sell': return gross - transaction.fees
    case 'dividend':
    case 'deposit': return gross
    case 'fee':
    case 'withdrawal': return -gross
  }
}

export function transactionSummary(transactions: PortfolioTransaction[]) {
  return transactions.reduce((summary, transaction) => {
    summary.netCashFlow += transactionCashFlow(transaction)
    if (transaction.type === 'dividend') summary.distributions += transactionCashFlow(transaction)
    if (transaction.type === 'buy') summary.invested += Math.abs(transactionCashFlow(transaction))
    if (transaction.type === 'sell') summary.proceeds += transactionCashFlow(transaction)
    return summary
  }, { netCashFlow: 0, distributions: 0, invested: 0, proceeds: 0 })
}
