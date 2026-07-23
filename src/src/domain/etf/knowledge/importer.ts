import type { EtfKnowledgeRecord, EtfMasterRecord } from './types'

export type ProviderFundRow = Record<string, string | number | boolean | null | undefined>
export type ImportIssue = { row:number; field?:string; message:string; severity:'warning'|'error' }
export type ImportResult = { accepted:EtfKnowledgeRecord[]; rejected:number; issues:ImportIssue[] }

export type ProviderMapping = {
  sourceId:string
  ticker:string
  fundName:string
  issuer:string
  strategy?:string
  primaryAssetClass?:string
  distributionFrequency?:string
  expenseRatio?:string
  aum?:string
  exchange?:string
  inceptionDate?:string
}

const frequency = (value:unknown):EtfMasterRecord['distributionFrequency'] => {
  const v=String(value ?? '').toLowerCase()
  if(v.includes('week')) return 'Weekly'; if(v.includes('month')) return 'Monthly'; if(v.includes('quarter')) return 'Quarterly'; if(v.includes('semi')) return 'Semiannual'; if(v.includes('annual')) return 'Annual'; if(v.includes('none')) return 'None'; return 'Irregular'
}
const numberOrUndefined=(value:unknown)=>{const n=Number(value);return Number.isFinite(n)?n:undefined}

export function importProviderRows(rows:ProviderFundRow[], mapping:ProviderMapping):ImportResult {
  const accepted:EtfKnowledgeRecord[]=[]; const issues:ImportIssue[]=[]; let rejected=0
  rows.forEach((row,index)=>{
    const ticker=String(row[mapping.ticker] ?? '').trim().toUpperCase()
    const fundName=String(row[mapping.fundName] ?? '').trim()
    if(!ticker || !fundName){ rejected++; issues.push({row:index+1,message:'Ticker and fund name are required.',severity:'error'}); return }
    const issuer=String(row[mapping.issuer] ?? 'Unknown').trim()
    accepted.push({master:{id:`${mapping.sourceId}-${ticker}`,ticker,fundName,issuer,exchange:mapping.exchange?String(row[mapping.exchange]??''):undefined,inceptionDate:mapping.inceptionDate?String(row[mapping.inceptionDate]??''):undefined,status:'Active',strategy:mapping.strategy?String(row[mapping.strategy]??'Unclassified'):'Unclassified',primaryAssetClass:mapping.primaryAssetClass?String(row[mapping.primaryAssetClass]??'Unclassified'):'Unclassified',grossExpenseRatio:mapping.expenseRatio?numberOrUndefined(row[mapping.expenseRatio]):undefined,assetsUnderManagement:mapping.aum?numberOrUndefined(row[mapping.aum]):undefined,distributionFrequency:mapping.distributionFrequency?frequency(row[mapping.distributionFrequency]):'Irregular',currency:'USD',lastUpdatedAt:new Date().toISOString(),sourceId:mapping.sourceId},intelligence:{etfId:`${mapping.sourceId}-${ticker}`,labels:['Research Required'],strengths:[],considerations:['Imported record requires data-quality review']}})
  })
  return {accepted,rejected,issues}
}

export function parseCsv(text:string):ProviderFundRow[] {
  const lines=text.replace(/\r/g,'').split('\n').filter(Boolean); if(lines.length<2)return[]
  const headers=lines[0].split(',').map(h=>h.trim().replace(/^"|"$/g,''))
  return lines.slice(1).map(line=>{const values=line.split(',').map(v=>v.trim().replace(/^"|"$/g,'')); return Object.fromEntries(headers.map((h,i)=>[h,values[i]??'']))})
}
