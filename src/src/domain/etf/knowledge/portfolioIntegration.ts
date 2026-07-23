import type { Holding } from '../../../types/portfolio'
import type { EtfKnowledgeRecord } from './types'

export type EnrichedHolding = Holding & { knowledge?:EtfKnowledgeRecord; intelligenceFlags:string[] }

export function enrichPortfolioHoldings(holdings:Holding[], knowledge:EtfKnowledgeRecord[]):EnrichedHolding[] {
  return holdings.map(h=>{
    const record=knowledge.find(k=>k.master.ticker===h.ticker)
    const flags:string[]=[]
    if(record?.classification?.optionStrategies.some(v=>v!=='None')) flags.push('Options strategy')
    if(record?.risk?.overallBand==='High'||record?.risk?.overallBand==='Very High') flags.push('Elevated risk')
    if(record?.master.distributionFrequency==='Weekly') flags.push('Weekly payer')
    return {...h,knowledge:record,intelligenceFlags:flags}
  })
}
