export type DataConfidence='verified'|'provider'|'modeled'|'missing'
export type EtfUniverseRecord={
  ticker:string; name:string; issuer:string; assetClass:string; category:string; strategy:string;
  benchmark?:string; inceptionDate?:string; expenseRatioPct?:number; distributionFrequency?:string;
  indicatedYieldPct?:number; assetsUsd?:number; averageVolume?:number; optionsStrategy?:string;
  tags:string[]; updatedAt?:string; confidence:DataConfidence; source?:string
}
export type UniverseQualityReport={score:number; completenessPct:number; verifiedPct:number; duplicateTickers:string[]; missingCritical:Record<string,string[]>}

export interface EtfUniverseProvider {
  id:string
  label:string
  fetchMaster():Promise<EtfUniverseRecord[]>
}

const critical:(keyof EtfUniverseRecord)[]=['ticker','name','issuer','assetClass','category','strategy','confidence']
export function evaluateUniverseQuality(records:EtfUniverseRecord[]):UniverseQualityReport{
  const counts=new Map<string,number>()
  const missingCritical:Record<string,string[]>={}
  let filled=0
  for(const r of records){
    counts.set(r.ticker,(counts.get(r.ticker)??0)+1)
    const missing=critical.filter(k=>r[k]===undefined||r[k]==='').map(String)
    if(missing.length) missingCritical[r.ticker]=missing
    filled += critical.length-missing.length
  }
  const duplicateTickers=[...counts.entries()].filter(([,n])=>n>1).map(([t])=>t)
  const completenessPct=records.length?filled/(records.length*critical.length)*100:0
  const verifiedPct=records.length?records.filter(r=>r.confidence==='verified').length/records.length*100:0
  const score=Math.max(0,Math.min(100,Math.round(completenessPct*.65+verifiedPct*.3-Math.min(15,duplicateTickers.length*3)+5)))
  return {score,completenessPct,verifiedPct,duplicateTickers,missingCritical}
}

export function searchUniverse(records:EtfUniverseRecord[],query:string,filters?:Partial<Pick<EtfUniverseRecord,'issuer'|'assetClass'|'category'|'strategy'|'distributionFrequency'>>){
 const q=query.trim().toLowerCase()
 return records.filter(r=>{
  const text=[r.ticker,r.name,r.issuer,r.assetClass,r.category,r.strategy,...r.tags].join(' ').toLowerCase()
  const matchesQuery=!q||text.includes(q)
  const matchesFilters=!filters||Object.entries(filters).every(([k,v])=>!v||r[k as keyof EtfUniverseRecord]===v)
  return matchesQuery&&matchesFilters
 })
}

export const stageOneUniverseSeed:EtfUniverseRecord[]=[
 {ticker:'EDGQ',name:'Income & Growth ETF',issuer:'Demo Issuer',assetClass:'Equity',category:'Equity Income',strategy:'Income + Growth',distributionFrequency:'Weekly',indicatedYieldPct:13,tags:['weekly','growth','income'],confidence:'modeled'},
 {ticker:'XDTE',name:'S&P 500 0DTE Covered Call ETF',issuer:'Demo Issuer',assetClass:'Equity',category:'Covered Call',strategy:'0DTE Covered Call',distributionFrequency:'Weekly',tags:['weekly','options','s&p 500'],confidence:'modeled'},
 {ticker:'KYLD',name:'Yield Premium Strategy ETF',issuer:'Demo Issuer',assetClass:'Equity',category:'Covered Call',strategy:'Yield Premium',distributionFrequency:'Weekly',tags:['weekly','covered call'],confidence:'modeled'},
 {ticker:'BCCC',name:'Crypto Income Strategy ETF',issuer:'Demo Issuer',assetClass:'Alternatives',category:'Crypto Income',strategy:'Options Income',distributionFrequency:'Weekly',tags:['crypto','weekly','income'],confidence:'modeled'},
]
