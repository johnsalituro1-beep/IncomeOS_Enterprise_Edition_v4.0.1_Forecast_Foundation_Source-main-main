export type MobilePlatform = 'ios' | 'android' | 'tablet' | 'watch'
export type SyncState = 'synced' | 'pending' | 'offline' | 'conflict'
export type NotificationChannel = 'push' | 'email' | 'in-app' | 'watch'

export interface MobileWidgetPreference {
  id: string
  title: string
  enabled: boolean
  order: number
  compact: boolean
}

export interface MobileDevice {
  id: string
  name: string
  platform: MobilePlatform
  biometricEnabled: boolean
  lastSeenAt: string
  syncState: SyncState
}

export interface MobileNotificationPreference {
  event: 'distribution-announcement' | 'ex-date' | 'payment' | 'goal' | 'health-score' | 'watchlist' | 'research'
  enabled: boolean
  channels: NotificationChannel[]
  quietHours?: { start: string; end: string }
}

export interface OfflineSnapshot {
  portfolioId: string
  createdAt: string
  expiresAt: string
  holdingsCount: number
  researchRecords: number
  twinScenarios: number
  checksum: string
}
