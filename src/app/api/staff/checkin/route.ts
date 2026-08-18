import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function authorizeForScout(personId: string, scoutId: string) {
  const person = await prisma.person.findUnique({ where: { id: personId }, include: { dens: true } })
  if (!person || !person.active) return null
  const scout = await prisma.scout.findUnique({ where: { id: scoutId } })
  if (!scout) return null
  if (person.role !== 'ADMIN' && !person.dens.some((d) => d.id === scout.denId)) return null
  return person
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { eventId, scoutId } = await req.json()
  if (!eventId || !scoutId) {
    return NextResponse.json({ error: 'eventId and scoutId are required' }, { status: 400 })
  }

  const person = await authorizeForScout(session.personId, scoutId)
  if (!person) return NextResponse.json({ error: 'Not authorized for this scout' }, { status: 403 })

  const checkin = await prisma.checkin.upsert({
    where: { scoutId_eventId: { scoutId, eventId } },
    update: {},
    create: { scoutId, eventId, method: 'OVERRIDE', checkedById: person.id },
  })

  return NextResponse.json({ ok: true, checkinId: checkin.id })
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { eventId, scoutId } = await req.json()
  if (!eventId || !scoutId) {
    return NextResponse.json({ error: 'eventId and scoutId are required' }, { status: 400 })
  }

  const person = await authorizeForScout(session.personId, scoutId)
  if (!person) return NextResponse.json({ error: 'Not authorized for this scout' }, { status: 403 })

  await prisma.checkin.deleteMany({ where: { scoutId, eventId } })

  return NextResponse.json({ ok: true })
}
