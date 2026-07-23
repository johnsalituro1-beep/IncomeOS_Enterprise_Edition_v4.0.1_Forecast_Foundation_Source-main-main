import type { AdvisorWorkspace, ClientProfile, Household, ManagedPortfolio } from './types'
export const advisorWorkspace: AdvisorWorkspace = {
 firmName:'Dividend Calendar Advisory',
 users:[{id:'u1',name:'Lead Advisor',email:'advisor@example.com',role:'administrator',firmId:'f1'}],
 clients:[
  {id:'c1',name:'John Household',email:'john@example.com',status:'review-due',householdId:'h1',riskProfile:'moderate',weeklyIncomeGoal:2000,nextReview:'2026-08-05',portfolioIds:['p1','p2']},
  {id:'c2',name:'Harbor Family',email:'harbor@example.com',status:'active',householdId:'h2',riskProfile:'conservative',weeklyIncomeGoal:1250,nextReview:'2026-09-12',portfolioIds:['p3']},
  {id:'c3',name:'Atlas Growth Trust',email:'atlas@example.com',status:'active',householdId:'h3',riskProfile:'growth',weeklyIncomeGoal:850,nextReview:'2026-10-01',portfolioIds:['p4']}
 ],
 households:[
  {id:'h1',name:'John Household',clientIds:['c1'],portfolioIds:['p1','p2'],goals:['$2,000 weekly income','Preserve long-term principal']},
  {id:'h2',name:'Harbor Family',clientIds:['c2'],portfolioIds:['p3'],goals:['Retirement income','Lower drawdown risk']},
  {id:'h3',name:'Atlas Trust',clientIds:['c3'],portfolioIds:['p4'],goals:['Income growth','Estate continuity']}
 ],
 portfolios:[
  {id:'p1',name:'Income Brokerage',accountType:'taxable',ownerIds:['c1'],marketValue:350000,weeklyIncome:1735,incomeOsScore:74,riskScore:61},
  {id:'p2',name:'Roth IRA',accountType:'roth-ira',ownerIds:['c1'],marketValue:92000,weeklyIncome:240,incomeOsScore:82,riskScore:42},
  {id:'p3',name:'Retirement Income',accountType:'joint',ownerIds:['c2'],marketValue:615000,weeklyIncome:1320,incomeOsScore:86,riskScore:31},
  {id:'p4',name:'Growth & Income Trust',accountType:'trust',ownerIds:['c3'],marketValue:880000,weeklyIncome:910,incomeOsScore:79,riskScore:54}
 ],
 tasks:[
  {id:'t1',clientId:'c1',title:'Review covered-call concentration',due:'2026-07-28',priority:'high',status:'open'},
  {id:'t2',clientId:'c2',title:'Prepare quarterly income report',due:'2026-08-01',priority:'medium',status:'open'},
  {id:'t3',clientId:'c3',title:'Update trust beneficiary notes',due:'2026-08-09',priority:'low',status:'open'}
 ],
 notes:[{id:'n1',clientId:'c1',createdAt:'2026-07-21',author:'Lead Advisor',body:'Client prioritizes weekly income with some growth potential. Review margin exposure before increasing distributions.',tags:['income','risk']}]
}
export function householdSummary(h:Household, portfolios:ManagedPortfolio[]){const p=portfolios.filter(x=>h.portfolioIds.includes(x.id)); return {aum:p.reduce((s,x)=>s+x.marketValue,0),weeklyIncome:p.reduce((s,x)=>s+x.weeklyIncome,0),score:Math.round(p.reduce((s,x)=>s+x.incomeOsScore*x.marketValue,0)/Math.max(1,p.reduce((s,x)=>s+x.marketValue,0))),accounts:p.length}}
export function advisorSummary(w:AdvisorWorkspace){return {aum:w.portfolios.reduce((s,p)=>s+p.marketValue,0),weeklyIncome:w.portfolios.reduce((s,p)=>s+p.weeklyIncome,0),clients:w.clients.length,reviewDue:w.clients.filter(c=>c.status==='review-due').length,openTasks:w.tasks.filter(t=>t.status==='open').length,avgScore:Math.round(w.portfolios.reduce((s,p)=>s+p.incomeOsScore,0)/w.portfolios.length)}}
export function clientPortfolios(c:ClientProfile,w=advisorWorkspace){return w.portfolios.filter(p=>c.portfolioIds.includes(p.id))}
