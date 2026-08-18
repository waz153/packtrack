import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { getEffectiveStatus } from '@/lib/eventStatus'
import { generateQrToken } from '@/lib/token'

export async function GET() {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    include: { _count: { select: { checkins: true } } },
  })

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      name: e.name,
      date: e.date,
      endDate: e.endDate,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      notes: e.notes,
      status: e.status,
      effectiveStatus: getEffectiveStatus(e),
      qrToken: e.qrToken,
      checkinCount: e._count.checkins,
    })),
  })
}

export async function POST(req: Request) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const body = await req.json()
  const { name, date, startTime, endTime, location, notes, endDate } = body

  if (typeof name !== 'string' || !name.trim() || typeof date !== 'string' || !date) {
    return NextResponse.json({ error: 'Name and date are required' }, { status: 400 })
  }

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  const event = await prisma.event.create({
    data: {
      name: name.trim(),
      date: parsedDate,
      endDate: endDate ? new Date(endDate) : null,
      startTime: startTime || null,
      endTime: endTime || null,
      location: location || null,
      notes: notes || null,
      status: 'LOCKED',
      isManualOverride: true,
      qrToken: generateQrToken(),
    },
  })

  return NextResponse.json({ event })
}
