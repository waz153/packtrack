import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { pickDefaultEvent } from '@/lib/events'
import { getEffectiveStatus } from '@/lib/eventStatus'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const url = new URL(req.url)
  const eventId = url.searchParams.get('eventId')

  const event = eventId
    ? await prisma.event.findUnique({ where: { id: eventId } })
    : await pickDefaultEvent()

  if (!event) {
    return NextResponse.json({ error: 'No events found' }, { status: 404 })
  }

  const person = await prisma.person.findUnique({
    where: { id: session.personId },
    include: { dens: true },
  })
  if (!person || !person.active) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const denWhere = person.role === 'ADMIN' ? {} : { id: { in: person.dens.map((d) => d.id) } }

  const dens = await prisma.den.findMany({
    where: denWhere,
    orderBy: { name: 'asc' },
    include: {
      scouts: {
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        include: {
          checkins: {
            where: { eventId: event.id },
            select: { id: true, checkedInAt: true, method: true },
          },
        },
      },
    },
  })

  const allEvents = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    select: { id: true, name: true, date: true },
  })

  let checkedIn = 0
  let total = 0
  const result = dens.map((den) => {
    const scouts = den.scouts.map((s) => {
      total++
      const checkin = s.checkins[0] ?? null
      if (checkin) checkedIn++
      return {
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        checkedIn: !!checkin,
        checkedInAt: checkin?.checkedInAt ?? null,
      }
    })
    return { id: den.id, name: den.name, scouts }
  })

  return NextResponse.json({
    event: {
      id: event.id,
      name: event.name,
      date: event.date,
      status: getEffectiveStatus(event),
      qrToken: event.qrToken,
    },
    events: allEvents,
    dens: result,
    totals: { checkedIn, total },
    role: person.role,
  })
}
