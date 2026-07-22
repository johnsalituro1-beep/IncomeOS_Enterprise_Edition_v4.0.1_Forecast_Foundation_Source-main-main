export type WorkspaceWidget='mission-kpis'|'goal-flight-plan'|'income-copilot'|'cash-events'|'intelligence-feed'|'operating-score'|'digital-twin'
export type WorkspaceLayout={id:string;name:string;widgets:WorkspaceWidget[];density:'comfortable'|'compact'}
export const defaultWorkspaces:WorkspaceLayout[]=[
 {id:'income-operator',name:'Income Operator',widgets:['mission-kpis','goal-flight-plan','cash-events','intelligence-feed','income-copilot'],density:'comfortable'},
 {id:'portfolio-risk',name:'Portfolio Risk',widgets:['operating-score','intelligence-feed','goal-flight-plan','digital-twin'],density:'compact'},
]
