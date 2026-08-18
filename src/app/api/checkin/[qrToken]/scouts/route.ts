import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ qrToken: string }> }
) {
  const { qrToken } = await params
  const url = new URL(req.url)
  const denId = url.searchParams.get('denId')
  if (!denId) {
    return NextResponse.json({ error: 'denId is required' }, { status: 400 })
  }

  const event = await prisma.event.findUnique({ where: { qrToken } })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const scouts = await prisma.scout.findMany({
    where: { denId },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    include: {
      checkins: { where: { eventId: event.id }, select: { id: true } },
    },
  })

  return NextResponse.json({
    scouts: scouts.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      checkedIn: s.checkins.length > 0,
    })),
  })
}
