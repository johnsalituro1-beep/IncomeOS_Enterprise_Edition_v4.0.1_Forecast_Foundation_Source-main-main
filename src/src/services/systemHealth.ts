import { isSupabaseConfigured, supabase } from '../lib/supabase'

export type ServiceHealth = {
  service: string
  status: 'healthy' | 'degraded' | 'not-configured'
  latencyMs?: number
  detail: string
}

export async function checkSupabaseHealth(): Promise<ServiceHealth> {
  if (!isSupabaseConfigured || !supabase) {
    return { service: 'Supabase', status: 'not-configured', detail: 'Running in local demonstration mode.' }
  }
  const started = performance.now()
  try {
    const { error } = await supabase.auth.getSession()
    if (error) throw error
    return { service: 'Supabase', status: 'healthy', latencyMs: Math.round(performance.now() - started), detail: 'Authentication endpoint responded.' }
  } catch (error) {
    return { service: 'Supabase', status: 'degraded', latencyMs: Math.round(performance.now() - started), detail: error instanceof Error ? error.message : 'Health check failed.' }
  }
}
