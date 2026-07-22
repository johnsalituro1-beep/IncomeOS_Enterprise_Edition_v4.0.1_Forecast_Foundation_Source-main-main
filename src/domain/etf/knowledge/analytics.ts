import type { EtfKnowledgeDistributionRecord, EtfKnowledgeRecord, EtfRelationship, RiskAssessment } from './types'

export function calculateIncomeMetrics(etfId:string, distributions:EtfKnowledgeDistributionRecord[], currentPrice?:number) {
  const rows=distributions.filter(d=>d.etfId===etfId).sort((a,b)=>a.payDate.localeCompare(b.payDate))
  const total=rows.reduce((s,r)=>s+r.amount,0); const avg=rows.length?total/rows.length:0
  const variance=rows.length?rows.reduce((s,r)=>s+(r.amount-avg)**2,0)/rows.length:0
  return {etfId,trailing12MonthDistribution:total,rolling12MonthYieldPct:currentPrice?total/currentPrice*100:undefined,distributionVolatilityPct:avg?Math.sqrt(variance)/avg*100:0,payoutConsistencyScore:Math.max(0,100-(avg?Math.sqrt(variance)/avg*100:100)),paymentStreak:rows.length,averageDistribution:avg,projectedAnnualDistribution:total,projectedMonthlyDistribution:total/12,projectedWeeklyDistribution:total/52,calculatedAt:new Date().toISOString()}
}

export function calculateRiskAssessment(record:EtfKnowledgeRecord):RiskAssessment {
  const classification=record.classification
  const optionRisk=classification?.optionStrategies.some(v=>v!=='None')?65:10
  const leverageRisk=classification?.leverageType==='None'?5:80
  const thematic=classification?.marketSegments.includes('Thematic')?65:35
  const liquidity=record.master.averageDailyVolume && record.master.averageDailyVolume>1000000?15:45
  const expense=(record.master.netExpenseRatio ?? record.master.grossExpenseRatio ?? 0.5)>1?60:25
  const overall=Math.round((optionRisk+leverageRisk+thematic+liquidity+expense)/5)
  const band:RiskAssessment['overallBand']=overall>=75?'Very High':overall>=60?'High':overall>=45?'Elevated':overall>=25?'Moderate':'Low'
  return {etfId:record.master.id,overallBand:band,volatilityScore:thematic,navStabilityScore:100-thematic,distributionStabilityScore:record.income?.payoutConsistencyScore ?? 50,leverageRiskScore:leverageRisk,optionsComplexityScore:optionRisk,interestRateRiskScore:record.master.primaryAssetClass.includes('Fixed')?65:15,currencyRiskScore:record.classification?.marketSegments.some(v=>v.includes('International')||v.includes('Emerging'))?55:10,liquidityRiskScore:liquidity,concentrationRiskScore:thematic,issuerRiskScore:35,rationale:[optionRisk>50?'Uses an options strategy.':'No complex options strategy identified.',leverageRisk>50?'Uses leveraged, inverse, or defined-outcome exposure.':'No leverage classification identified.'],calculatedAt:new Date().toISOString()}
}

export function buildRelationships(records:EtfKnowledgeRecord[]):EtfRelationship[] {
  const out:EtfRelationship[]=[]
  for(let i=0;i<records.length;i++) for(let j=i+1;j<records.length;j++) {
    const a=records[i],b=records[j]
    if(a.master.issuer===b.master.issuer) out.push({id:`issuer-${a.master.id}-${b.master.id}`,fromEtfId:a.master.id,toEtfId:b.master.id,type:'Same Issuer',score:1,explanation:`Both funds are issued by ${a.master.issuer}.`})
    if(a.master.benchmark && a.master.benchmark===b.master.benchmark) out.push({id:`benchmark-${a.master.id}-${b.master.id}`,fromEtfId:a.master.id,toEtfId:b.master.id,type:'Same Benchmark',score:1})
    const tagsA=new Set(a.classification?.tags??[]), tagsB=new Set(b.classification?.tags??[]); const common=[...tagsA].filter(t=>tagsB.has(t))
    if(common.length) out.push({id:`similar-${a.master.id}-${b.master.id}`,fromEtfId:a.master.id,toEtfId:b.master.id,type:'Similar Strategy',score:Math.min(1,common.length/3),explanation:`Shared classifications: ${common.join(', ')}.`})
  }
  return out
}

export function compareFunds(a:EtfKnowledgeRecord,b:EtfKnowledgeRecord) {
  return {tickers:[a.master.ticker,b.master.ticker],frequency:[a.master.distributionFrequency,b.master.distributionFrequency],expenseRatio:[a.master.netExpenseRatio??a.master.grossExpenseRatio,a.master.netExpenseRatio??b.master.grossExpenseRatio],risk:[a.risk?.overallBand,b.risk?.overallBand],assetClass:[a.master.primaryAssetClass,b.master.primaryAssetClass],strategy:[a.master.strategy,b.master.strategy],fitSummary:`${a.master.ticker} emphasizes ${a.master.strategy}; ${b.master.ticker} emphasizes ${b.master.strategy}.`}
}
