import type { BackupVerification, HealthCheck, Incident } from '../../services/production/operationsMonitoring'
const KEY='incomeos:production-operations:v3.1'
export type StoredOperations={checks:HealthCheck[];incidents:Incident[];backups:BackupVerification[];maintenance:boolean}
const defaults:StoredOperations={checks:[],incidents:[],backups:[],maintenance:false}
export function loadProductionOperations():StoredOperations { try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)??'{}')}}catch{return defaults} }
export function saveProductionOperations(value:StoredOperations){localStorage.setItem(KEY,JSON.stringify(value))}
