export type CopilotTool='portfolio-metrics'|'operating-score'|'digital-twin'|'etf-research'|'calendar'
export type CopilotIntent={intent:'income'|'risk'|'scenario'|'research'|'unknown';tools:CopilotTool[];requiresVerifiedData:boolean}
export function routeCopilotQuestion(question:string):CopilotIntent{
 const q=question.toLowerCase()
 if(q.includes('what if')||q.includes('scenario')||q.includes('invest another')) return {intent:'scenario',tools:['digital-twin','portfolio-metrics','operating-score'],requiresVerifiedData:false}
 if(q.includes('compare')||q.includes('research')||q.includes('etf')) return {intent:'research',tools:['etf-research'],requiresVerifiedData:true}
 if(q.includes('risk')||q.includes('score')) return {intent:'risk',tools:['operating-score','portfolio-metrics'],requiresVerifiedData:false}
 if(q.includes('income')||q.includes('payment')) return {intent:'income',tools:['portfolio-metrics','calendar'],requiresVerifiedData:false}
 return {intent:'unknown',tools:['portfolio-metrics'],requiresVerifiedData:false}
}
