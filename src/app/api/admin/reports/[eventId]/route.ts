import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { eventId } = await params

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const dens = await prisma.den.findMany({
    orderBy: { name: 'asc' },
    include: {
      scouts: {
        where: { active: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        include: {
          checkins: {
            where: { eventId },
            include: { checkedBy: { select: { name: true } } },
          },
        },
      },
    },
  })

  const rows = dens.flatMap((den) =>
    den.scouts.map((s) => {
      const checkin = s.checkins[0] ?? null
      return {
        denName: den.name,
        firstName: s.firstName,
        lastName: s.lastName,
        checkedIn: !!checkin,
        checkedInAt: checkin?.checkedInAt ?? null,
        method: checkin?.method ?? null,
        checkedByName: checkin?.checkedBy?.name ?? null,
      }
    })
  )

  return NextResponse.json({
    event: { id: event.id, name: event.name, date: event.date },
    rows,
    totals: { checkedIn: rows.filter((r) => r.checkedIn).length, total: rows.length },
  })
}
