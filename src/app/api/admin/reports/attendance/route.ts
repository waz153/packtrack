import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { reportableEventsWhere } from '@/lib/reportEvents'

export async function GET() {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const eventsWhere = reportableEventsWhere(new Date())

  const totalEvents = await prisma.event.count({ where: eventsWhere })

  const scouts = await prisma.scout.findMany({
    where: { active: true },
    include: {
      den: { select: { name: true } },
      checkins: {
        where: { event: eventsWhere },
        select: { id: true },
      },
    },
  })

  const rows = scouts
    .map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      denName: s.den.name,
      checkedInCount: s.checkins.length,
      totalEvents,
      rate: totalEvents > 0 ? s.checkins.length / totalEvents : 0,
    }))
    .sort((a, b) => a.rate - b.rate || a.firstName.localeCompare(b.firstName))

  return NextResponse.json({ totalEvents, rows })
}
