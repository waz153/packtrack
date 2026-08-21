import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import PrintFlyer from './PrintFlyer'

export default async function EventPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  const headerList = await headers()
  const host = headerList.get('host')
  const protocol = headerList.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https')
  const checkinUrl = `${protocol}://${host}/checkin/${event.qrToken}`

  return (
    <PrintFlyer
      event={{
        id: event.id,
        name: event.name,
        date: event.date.toISOString(),
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        notes: event.notes,
        qrToken: event.qrToken,
      }}
      checkinUrl={checkinUrl}
    />
  )
}
