export type AdvisorRole = 'administrator' | 'advisor' | 'associate' | 'analyst' | 'client' | 'read-only'
export type AccountType = 'taxable' | 'ira' | 'roth-ira' | 'trust' | 'joint' | 'business'
export interface AdvisorUser { id:string; name:string; email:string; role:AdvisorRole; firmId:string }
export interface ManagedPortfolio { id:string; name:string; accountType:AccountType; ownerIds:string[]; marketValue:number; weeklyIncome:number; incomeOsScore:number; riskScore:number }
export interface ClientProfile { id:string; name:string; email:string; status:'active'|'review-due'|'prospect'; householdId:string; riskProfile:'conservative'|'moderate'|'growth'; weeklyIncomeGoal:number; nextReview:string; portfolioIds:string[] }
export interface Household { id:string; name:string; clientIds:string[]; portfolioIds:string[]; goals:string[] }
export interface AdvisorTask { id:string; clientId?:string; title:string; due:string; priority:'low'|'medium'|'high'; status:'open'|'done' }
export interface ClientNote { id:string; clientId:string; createdAt:string; author:string; body:string; tags:string[] }
export interface AdvisorWorkspace { firmName:string; users:AdvisorUser[]; clients:ClientProfile[]; households:Household[]; portfolios:ManagedPortfolio[]; tasks:AdvisorTask[]; notes:ClientNote[] }
