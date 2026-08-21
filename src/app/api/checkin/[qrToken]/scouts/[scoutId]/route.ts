import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getEffectiveStatus } from '@/lib/eventStatus'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ qrToken: string; scoutId: string }> }
) {
  const { qrToken, scoutId } = await params

  const event = await prisma.event.findUnique({ where: { qrToken } })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (getEffectiveStatus(event) !== 'UNLOCKED') {
    return NextResponse.json({ error: 'Check-in is not open for this event' }, { status: 403 })
  }

  const scout = await prisma.scout.findUnique({ where: { id: scoutId } })
  if (!scout || !scout.active) {
    return NextResponse.json({ error: 'Scout not found' }, { status: 404 })
  }

  const checkin = await prisma.checkin.upsert({
    where: { scoutId_eventId: { scoutId, eventId: event.id } },
    update: {},
    create: {
      scoutId,
      eventId: event.id,
      method: 'SELF',
    },
  })

  return NextResponse.json({
    checkedIn: true,
    checkinId: checkin.id,
    scout: { id: scout.id, firstName: scout.firstName, lastName: scout.lastName },
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ qrToken: string; scoutId: string }> }
) {
  const { qrToken, scoutId } = await params

  const event = await prisma.event.findUnique({ where: { qrToken } })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  if (getEffectiveStatus(event) !== 'UNLOCKED') {
    return NextResponse.json({ error: 'Check-in is not open for this event' }, { status: 403 })
  }

  await prisma.checkin.deleteMany({ where: { scoutId, eventId: event.id } })

  return NextResponse.json({ checkedIn: false })
}
