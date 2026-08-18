import { prisma } from '@/lib/prisma'
import { getEffectiveStatus } from '@/lib/eventStatus'

export async function pickDefaultEvent() {
  const events = await prisma.event.findMany({ orderBy: { date: 'desc' } })
  if (events.length === 0) return null

  const unlocked = events.find((e) => getEffectiveStatus(e) === 'UNLOCKED')
  if (unlocked) return unlocked

  const now = Date.now()
  const upcoming = events
    .filter((e) => e.date.getTime() >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  if (upcoming[0]) return upcoming[0]

  return events[0]
}
