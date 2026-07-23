export type RuntimeEnvironment = 'development' | 'preview' | 'production'

const rawEnvironment = import.meta.env.VITE_APP_ENV as string | undefined

export const runtimeConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'IncomeOS Enterprise Edition',
  version: import.meta.env.VITE_APP_VERSION || '1.1.0',
  environment: (rawEnvironment === 'production' || rawEnvironment === 'preview' ? rawEnvironment : 'development') as RuntimeEnvironment,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN as string | undefined,
  serverJobsUrl: import.meta.env.VITE_SERVER_JOBS_URL as string | undefined,
  backupPolicyConfirmed: import.meta.env.VITE_BACKUP_POLICY_CONFIRMED === 'true',
  enableDemoMode: import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false',
} as const

export type ConfigurationIssue = {
  key: string
  severity: 'warning' | 'error'
  message: string
}

export function validateRuntimeConfig(): ConfigurationIssue[] {
  const issues: ConfigurationIssue[] = []
  if (!runtimeConfig.supabaseUrl) issues.push({ key: 'VITE_SUPABASE_URL', severity: 'warning', message: 'Supabase is not configured; the application will use demo mode.' })
  if (!runtimeConfig.supabaseAnonKey) issues.push({ key: 'VITE_SUPABASE_ANON_KEY', severity: 'warning', message: 'Supabase authentication and persistence are unavailable.' })
  if (runtimeConfig.environment === 'production' && !runtimeConfig.sentryDsn) issues.push({ key: 'VITE_SENTRY_DSN', severity: 'warning', message: 'Production error monitoring is not configured.' })
  if (runtimeConfig.environment === 'production' && !runtimeConfig.serverJobsUrl) issues.push({ key: 'VITE_SERVER_JOBS_URL', severity: 'warning', message: 'Server-side scheduled jobs are not configured.' })
  if (runtimeConfig.environment === 'production' && !runtimeConfig.backupPolicyConfirmed) issues.push({ key: 'VITE_BACKUP_POLICY_CONFIRMED', severity: 'warning', message: 'Backup and recovery testing has not been confirmed.' })
  if (runtimeConfig.environment === 'production' && runtimeConfig.enableDemoMode) issues.push({ key: 'VITE_ENABLE_DEMO_MODE', severity: 'error', message: 'Demo mode should be disabled for production deployments.' })
  return issues
}
