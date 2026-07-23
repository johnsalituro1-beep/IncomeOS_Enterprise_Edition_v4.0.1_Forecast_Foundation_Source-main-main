export type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance' | 'unknown'
export type IncidentSeverity = 'info' | 'warning' | 'critical'
export type HealthCheck = { id:string; name:string; status:ServiceStatus; latencyMs:number|null; checkedAt:string; detail:string }
export type Incident = { id:string; title:string; severity:IncidentSeverity; status:'open'|'monitoring'|'resolved'; startedAt:string; resolvedAt:string|null; message:string }
export type BackupVerification = { id:string; backupAt:string; verifiedAt:string|null; restoreTestedAt:string|null; status:'pending'|'verified'|'failed'; notes:string }
export type OperationsSnapshot = { overall:ServiceStatus; availabilityPct:number; openIncidents:number; criticalIncidents:number; backupStatus:'healthy'|'attention'|'unknown'; checks:HealthCheck[] }

export function classifyOverallStatus(checks:HealthCheck[], maintenance=false):ServiceStatus {
  if (maintenance) return 'maintenance'
  if (!checks.length) return 'unknown'
  if (checks.some(c=>c.status==='outage')) return 'outage'
  if (checks.some(c=>c.status==='degraded' || c.status==='unknown')) return 'degraded'
  return 'operational'
}

export function calculateAvailability(checks:HealthCheck[]) {
  if (!checks.length) return 0
  const available = checks.filter(c=>c.status==='operational' || c.status==='degraded').length
  return Math.round((available / checks.length) * 10000) / 100
}

export function classifyBackupStatus(backups:BackupVerification[], now=new Date()) {
  const latest=[...backups].sort((a,b)=>b.backupAt.localeCompare(a.backupAt))[0]
  if (!latest) return 'unknown' as const
  const ageHours=(now.getTime()-new Date(latest.backupAt).getTime())/3_600_000
  if (latest.status==='failed' || ageHours>36 || !latest.verifiedAt) return 'attention' as const
  return 'healthy' as const
}

export function buildOperationsSnapshot(input:{checks:HealthCheck[]; incidents:Incident[]; backups:BackupVerification[]; maintenance?:boolean; now?:Date}):OperationsSnapshot {
  const open=input.incidents.filter(i=>i.status!=='resolved')
  return {
    overall: classifyOverallStatus(input.checks, input.maintenance),
    availabilityPct: calculateAvailability(input.checks),
    openIncidents: open.length,
    criticalIncidents: open.filter(i=>i.severity==='critical').length,
    backupStatus: classifyBackupStatus(input.backups, input.now),
    checks: input.checks,
  }
}

export type AlertDecision = { notify:boolean; channel:'none'|'email'|'pager'; reason:string }
export function decideAlert(incident:Incident, repeatedFailures=0):AlertDecision {
  if (incident.status==='resolved') return {notify:false,channel:'none',reason:'Incident is resolved.'}
  if (incident.severity==='critical' || repeatedFailures>=3) return {notify:true,channel:'pager',reason:'Critical impact or repeated failure threshold reached.'}
  if (incident.severity==='warning') return {notify:true,channel:'email',reason:'Warning requires operator review.'}
  return {notify:false,channel:'none',reason:'Informational incident is recorded without escalation.'}
}

export function nextBackoffSeconds(attempt:number, base=30, max=900) {
  return Math.min(max, base * 2 ** Math.max(0, attempt-1))
}
