import type { Prisma } from '@/generated/prisma/client'

// Events that count toward attendance reports: anything already opened for
// check-in (currently UNLOCKED) or whose date has passed. Excludes events
// that are still LOCKED and haven't happened yet — those can't have any
// real attendance data. Cancelled events never count.
export function reportableEventsWhere(now: Date): Prisma.EventWhereInput {
  return {
    status: { not: 'CANCELLED' },
    OR: [{ date: { lte: now } }, { status: 'UNLOCKED' }],
  }
}
