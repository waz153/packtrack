export type EffectiveStatus = 'LOCKED' | 'UNLOCKED' | 'CANCELLED'

type EventLike = {
  status: 'LOCKED' | 'UNLOCKED' | 'CANCELLED'
  isManualOverride: boolean
  unlockAt: Date | null
  lockAt: Date | null
}

export function getEffectiveStatus(event: EventLike): EffectiveStatus {
  if (event.status === 'CANCELLED') return 'CANCELLED'
  if (event.isManualOverride) return event.status

  const now = new Date()
  if (!event.unlockAt) return 'LOCKED'
  if (now < event.unlockAt) return 'LOCKED'
  if (event.lockAt && now > event.lockAt) return 'LOCKED'
  return 'UNLOCKED'
}
