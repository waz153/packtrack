import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { reportableEventsWhere } from '@/lib/reportEvents'

export async function GET() {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const totalScouts = await prisma.scout.count({ where: { active: true } })

  const events = await prisma.event.findMany({
    where: reportableEventsWhere(new Date()),
    orderBy: { date: 'asc' },
    include: { _count: { select: { checkins: true } } },
  })

  const rows = events.map((e) => ({
    id: e.id,
    name: e.name,
    date: e.date,
    checkedInCount: e._count.checkins,
    totalScouts,
    rate: totalScouts > 0 ? e._count.checkins / totalScouts : 0,
  }))

  return NextResponse.json({ rows })
}
