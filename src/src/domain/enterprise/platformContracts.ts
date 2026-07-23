export type AuditEvent={id:string;actorId:string;action:string;resource:string;timestamp:string;metadata:Record<string,string|number|boolean>}
export interface CloudSyncAdapter{push(resource:string,payload:unknown):Promise<void>;pull<T>(resource:string):Promise<T|null>}
export interface MarketDataAdapter{quote(ticker:string):Promise<{price:number;asOf:string}>;distributions(ticker:string):Promise<Array<{exDate:string;payDate:string;amount:number}>>}
export type FeatureFlag={key:string;enabled:boolean;audience:'all'|'pro'|'advisor'|'enterprise'}
export const enterpriseReadiness=[
 {area:'Identity & access',status:'Architecture drafted'},
 {area:'Audit logging',status:'Contract defined'},
 {area:'Provider abstraction',status:'Contract defined'},
 {area:'Backup & recovery',status:'Runbook required'},
 {area:'Observability',status:'Telemetry provider pending'},
] as const
