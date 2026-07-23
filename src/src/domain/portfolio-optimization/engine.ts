import type { OptimizationAsset, OptimizationConstraints, OptimizationObjectives, OptimizationResult } from './types'

const normalize = (weights:number[]) => { const total = weights.reduce((a,b)=>a+b,0) || 1; return weights.map(w=>w/total) }
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))

export function optimizePortfolio(assets:OptimizationAsset[], constraints:OptimizationConstraints, objectives:OptimizationObjectives):OptimizationResult {
  if (!assets.length) return { feasible:false, score:0, projectedIncome:0, projectedRisk:0, allocations:[], tradeoffs:['No eligible assets supplied.'], audit:['EMPTY_UNIVERSE'] }
  const raw = assets.map(a => Math.max(0.001,
    a.expectedIncome*objectives.income + a.expectedGrowth*objectives.growth + a.diversification*objectives.diversification +
    (100-a.risk)*objectives.riskControl + (100-a.expense)*objectives.costEfficiency))
  let proposed = normalize(raw).map(w=>Math.min(w,constraints.maxSingleAssetWeight))
  proposed = normalize(proposed)
  const projectedIncome = assets.reduce((s,a,i)=>s+a.expectedIncome*proposed[i],0)
  const projectedRisk = assets.reduce((s,a,i)=>s+a.risk*proposed[i],0)
  const feasible = projectedIncome >= constraints.minIncome && projectedRisk <= constraints.maxRisk && proposed.every(w=>w<=constraints.maxSingleAssetWeight+0.001)
  const allocations = assets.map((a,i)=>({ ticker:a.ticker, currentWeight:a.currentWeight, proposedWeight:+proposed[i].toFixed(4), rationale:[proposed[i]>a.currentWeight?'Improves weighted objective mix':'Reduced by constraint-aware ranking', a.risk>constraints.maxRisk?'Risk contribution controlled':'Within risk preference'] }))
  const score = clamp(projectedIncome*objectives.income + (100-projectedRisk)*objectives.riskControl + assets.reduce((s,a,i)=>s+a.diversification*proposed[i],0)*objectives.diversification,0,100)
  return { feasible, score:+score.toFixed(2), projectedIncome:+projectedIncome.toFixed(2), projectedRisk:+projectedRisk.toFixed(2), allocations, tradeoffs:[`Projected income score: ${projectedIncome.toFixed(1)}`,`Projected risk score: ${projectedRisk.toFixed(1)}`, feasible?'All hard constraints satisfied.':'One or more hard constraints require revision.'], audit:['DETERMINISTIC_WEIGHTED_OPTIMIZATION','NO_AUTOMATIC_TRADING','USER_APPROVAL_REQUIRED'] }
}
