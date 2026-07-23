export interface OptimizationAsset { ticker:string; expectedIncome:number; expectedGrowth:number; risk:number; diversification:number; expense:number; currentWeight:number }
export interface OptimizationConstraints { minIncome:number; maxRisk:number; maxSingleAssetWeight:number; minCashWeight?:number; lockedTickers?:string[] }
export interface OptimizationObjectives { income:number; growth:number; diversification:number; riskControl:number; costEfficiency:number }
export interface ProposedAllocation { ticker:string; currentWeight:number; proposedWeight:number; rationale:string[] }
export interface OptimizationResult { feasible:boolean; score:number; projectedIncome:number; projectedRisk:number; allocations:ProposedAllocation[]; tradeoffs:string[]; audit:string[] }
