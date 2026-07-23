export interface ExecutiveKpi { key:string; label:string; value:string; status:'positive'|'neutral'|'watch'|'negative'; detail:string }
export interface ExecutiveBrief { generatedAt:string; headline:string; summary:string; kpis:ExecutiveKpi[]; priorities:string[]; risks:string[]; scenarioHighlights:string[]; evidenceCoverage:number }
