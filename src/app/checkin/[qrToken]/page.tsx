import { prisma } from '@/lib/prisma'
import { getEffectiveStatus } from '@/lib/eventStatus'
import CheckinFlow from './CheckinFlow'

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ qrToken: string }>
}) {
  const { qrToken } = await params

  const event = await prisma.event.findUnique({ where: { qrToken } })

  if (!event) {
    return (
      <Message title="Check-in link not found">
        This QR code doesn&apos;t match a known event. Double check with your den leader.
      </Message>
    )
  }

  const status = getEffectiveStatus(event)

  if (status === 'CANCELLED') {
    return <Message title={event.name}>This event has been cancelled.</Message>
  }

  if (status === 'LOCKED') {
    return (
      <Message title={event.name}>
        Check-in isn&apos;t open yet.
        {event.startTime ? (
          <>
            <br />
            Starts at {event.startTime}
            {event.location ? ` — ${event.location}` : ''}
          </>
        ) : null}
      </Message>
    )
  }

  const dens = await prisma.den.findMany({ orderBy: { name: 'asc' } })

  return <CheckinFlow qrToken={qrToken} eventName={event.name} dens={dens} />
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main
      style={{
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 32,
        gap: 12,
      }}
    >
      <h1 style={{ fontSize: 22 }}>{title}</h1>
      <p style={{ color: '#666', maxWidth: 340, lineHeight: 1.5 }}>{children}</p>
    </main>
  )
}
