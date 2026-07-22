import type { MobileDevice, MobileNotificationPreference, MobileWidgetPreference, OfflineSnapshot } from '../../domain/mobile/types'

export const defaultMobileWidgets: MobileWidgetPreference[] = [
  { id: 'weekly-income', title: 'Weekly Income', enabled: true, order: 1, compact: false },
  { id: 'upcoming-payments', title: 'Upcoming Payments', enabled: true, order: 2, compact: false },
  { id: 'income-os-score', title: 'Income OS Score', enabled: true, order: 3, compact: true },
  { id: 'goal-progress', title: 'Goal Progress', enabled: true, order: 4, compact: true },
  { id: 'portfolio-alerts', title: 'Priority Alerts', enabled: true, order: 5, compact: false },
]

export const sampleDevices: MobileDevice[] = [
  { id: 'device-iphone', name: 'Primary iPhone', platform: 'ios', biometricEnabled: true, lastSeenAt: '2026-07-21T20:12:00-04:00', syncState: 'synced' },
  { id: 'device-ipad', name: 'Portfolio iPad', platform: 'tablet', biometricEnabled: true, lastSeenAt: '2026-07-21T18:45:00-04:00', syncState: 'pending' },
  { id: 'device-watch', name: 'Income Watch', platform: 'watch', biometricEnabled: false, lastSeenAt: '2026-07-21T20:10:00-04:00', syncState: 'synced' },
]

export const notificationPreferences: MobileNotificationPreference[] = [
  { event: 'distribution-announcement', enabled: true, channels: ['push', 'in-app'] },
  { event: 'ex-date', enabled: true, channels: ['push', 'watch'], quietHours: { start: '22:00', end: '07:00' } },
  { event: 'payment', enabled: true, channels: ['push', 'in-app', 'watch'] },
  { event: 'goal', enabled: true, channels: ['push', 'email'] },
  { event: 'health-score', enabled: true, channels: ['push', 'in-app'] },
  { event: 'watchlist', enabled: false, channels: ['in-app'] },
  { event: 'research', enabled: true, channels: ['in-app'] },
]

export function buildOfflineSnapshot(portfolioId: string): OfflineSnapshot {
  const created = new Date()
  const expires = new Date(created.getTime() + 24 * 60 * 60 * 1000)
  return {
    portfolioId,
    createdAt: created.toISOString(),
    expiresAt: expires.toISOString(),
    holdingsCount: 5,
    researchRecords: 128,
    twinScenarios: 4,
    checksum: `offline-${portfolioId}-${created.getTime()}`,
  }
}

export function mobileReadinessScore() {
  const checks = [
    { name: 'Shared domain services', ready: true },
    { name: 'Responsive mission control', ready: true },
    { name: 'Offline snapshot contract', ready: true },
    { name: 'Push notification contract', ready: true },
    { name: 'Biometric security adapter', ready: true },
    { name: 'App Store signing', ready: false },
    { name: 'Native device testing', ready: false },
  ]
  return { checks, score: Math.round(checks.filter(item => item.ready).length / checks.length * 100) }
}
