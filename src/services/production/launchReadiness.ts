import type { DeploymentEnvironment, LaunchGate, ServiceLevelObjective } from '../../domain/production/types'

export const launchGates: LaunchGate[] = [
  { id: 'quality', category: 'quality', title: 'Automated test suite', owner: 'Engineering', status: 'in-progress', evidence: ['Unit-test plan', 'Route smoke-test matrix'] },
  { id: 'security', category: 'security', title: 'Security hardening', owner: 'Security', status: 'in-progress', evidence: ['RBAC contracts', 'Audit event model', 'Dependency review pending'] },
  { id: 'data', category: 'data', title: 'Verified ETF data provider', owner: 'Data', status: 'blocked', evidence: ['Provider abstraction complete', 'Commercial feed not connected'] },
  { id: 'operations', category: 'operations', title: 'Observability and incident response', owner: 'Platform', status: 'in-progress', evidence: ['SLO definitions', 'Runbook templates'] },
  { id: 'legal', category: 'legal', title: 'Disclosures and policy review', owner: 'Legal', status: 'blocked', evidence: ['Modeled-data labels present', 'Counsel review required'] },
  { id: 'support', category: 'support', title: 'Customer onboarding and support', owner: 'Customer Success', status: 'ready', evidence: ['Onboarding state model', 'Support severity taxonomy'] },
]

export const environments: DeploymentEnvironment[] = [
  { name: 'local', branch: 'feature/*', approvalRequired: false, dataMode: 'synthetic', health: 'healthy' },
  { name: 'preview', branch: 'pull-request', approvalRequired: false, dataMode: 'synthetic', health: 'not-configured' },
  { name: 'staging', branch: 'main', approvalRequired: true, dataMode: 'sandbox', health: 'not-configured' },
  { name: 'production', branch: 'release/*', approvalRequired: true, dataMode: 'live', health: 'not-configured' },
]

export const serviceLevelObjectives: ServiceLevelObjective[] = [
  { name: 'Web availability', target: '99.9%', window: '30 days', alertAt: '99.95%' },
  { name: 'API success rate', target: '99.5%', window: '24 hours', alertAt: '99.7%' },
  { name: 'Portfolio calculation latency', target: '< 500 ms', window: 'p95', alertAt: '400 ms' },
  { name: 'ETF search latency', target: '< 750 ms', window: 'p95', alertAt: '600 ms' },
  { name: 'Sync durability', target: '99.99%', window: '30 days', alertAt: '99.995%' },
]

export function calculateLaunchReadiness() {
  const weights = { ready: 1, 'in-progress': .5, blocked: 0 }
  const score = Math.round(launchGates.reduce((sum, gate) => sum + weights[gate.status], 0) / launchGates.length * 100)
  const blockers = launchGates.filter(gate => gate.status === 'blocked')
  return { score, blockers, readyCount: launchGates.filter(gate => gate.status === 'ready').length }
}
