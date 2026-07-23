export type LaunchGateStatus = 'ready' | 'in-progress' | 'blocked'
export type EnvironmentName = 'local' | 'preview' | 'staging' | 'production'

export interface LaunchGate {
  id: string
  category: 'quality' | 'security' | 'operations' | 'legal' | 'support' | 'data'
  title: string
  owner: string
  status: LaunchGateStatus
  evidence: string[]
}

export interface DeploymentEnvironment {
  name: EnvironmentName
  branch: string
  approvalRequired: boolean
  dataMode: 'synthetic' | 'sandbox' | 'live'
  health: 'healthy' | 'degraded' | 'not-configured'
}

export interface ServiceLevelObjective {
  name: string
  target: string
  window: string
  alertAt: string
}
