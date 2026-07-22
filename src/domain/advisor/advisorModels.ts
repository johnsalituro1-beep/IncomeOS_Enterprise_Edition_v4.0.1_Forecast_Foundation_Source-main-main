export type AdvisorClient={id:string;name:string;householdId:string;riskProfile:'Conservative'|'Moderate'|'Growth';weeklyIncomeGoal:number;status:'Active'|'Review Due'|'Onboarding'}
export type AdvisorHousehold={id:string;name:string;clientIds:string[];totalAssets:number;nextReview:string}
export const advisorDemoClients:AdvisorClient[]=[
 {id:'c1',name:'Demo Income Client',householdId:'h1',riskProfile:'Moderate',weeklyIncomeGoal:2000,status:'Review Due'},
 {id:'c2',name:'Demo Retirement Client',householdId:'h2',riskProfile:'Conservative',weeklyIncomeGoal:850,status:'Active'},
]
