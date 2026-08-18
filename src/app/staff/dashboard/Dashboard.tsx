'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Scout = {
  id: string
  firstName: string
  lastName: string
  checkedIn: boolean
  checkedInAt: string | null
}
type Den = { id: string; name: string; scouts: Scout[] }
type EventSummary = { id: string; name: string; date: string; status: string }
type DashboardData = {
  event: EventSummary
  events: { id: string; name: string; date: string }[]
  dens: Den[]
  totals: { checkedIn: number; total: number }
  role: 'ADMIN' | 'LEADER'
}

const POLL_MS = 7000

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyScoutId, setBusyScoutId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const url = eventId ? `/api/staff/dashboard?eventId=${eventId}` : '/api/staff/dashboard'
      const res = await fetch(url)
      if (res.status === 401) {
        router.push('/staff/login')
        return
      }
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setData(json)
      setEventId(json.event.id)
      setError(null)
    } catch {
      setError('Could not refresh. Retrying…')
    }
  }, [eventId, router])

  useEffect(() => {
    load()
    const interval = setInterval(load, POLL_MS)
    return () => clearInterval(interval)
  }, [load])

  async function toggle(scout: Scout) {
    if (!data) return
    setBusyScoutId(scout.id)
    try {
      const method = scout.checkedIn ? 'DELETE' : 'POST'
      const res = await fetch('/api/staff/checkin', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: data.event.id, scoutId: scout.id }),
      })
      if (!res.ok) throw new Error()
      await load()
    } catch {
      setError('That update failed. Try again.')
    } finally {
      setBusyScoutId(null)
    }
  }

  async function logout() {
    await fetch('/api/staff/logout', { method: 'POST' })
    router.push('/staff/login')
  }

  if (!data) {
    return <main style={{ padding: 24 }}>{error || 'Loading…'}</main>
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20 }}>{data.event.name}</h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            {data.totals.checkedIn} / {data.totals.total} checked in
            {' · '}
            {data.event.status}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {data.role === 'ADMIN' && (
            <a href="/admin" style={linkButtonStyle}>
              Admin
            </a>
          )}
          <button onClick={logout} style={linkButtonStyle}>
            Log out
          </button>
        </div>
      </div>

      {data.events.length > 1 && (
        <select
          value={data.event.id}
          onChange={(e) => setEventId(e.target.value)}
          style={{ marginTop: 16, padding: 8, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
        >
          {data.events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} — {new Date(e.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      )}

      {error && (
        <p style={{ color: '#B23B3B', marginTop: 12, fontSize: 14 }}>{error}</p>
      )}

      {data.dens.map((den) => (
        <section key={den.id} style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>{den.name}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {den.scouts.map((scout) => (
              <button
                key={scout.id}
                onClick={() => toggle(scout)}
                disabled={busyScoutId === scout.id}
                style={{
                  ...rowStyle,
                  ...(scout.checkedIn ? rowCheckedStyle : {}),
                  opacity: busyScoutId === scout.id ? 0.5 : 1,
                }}
              >
                <span>
                  {scout.firstName} {scout.lastName}
                </span>
                <span style={{ fontSize: 13 }}>{scout.checkedIn ? '✓ Undo' : 'Check in'}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}

const linkButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 13,
  border: '1px solid #ccc',
  borderRadius: 8,
  background: '#fff',
  cursor: 'pointer',
  color: '#171717',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #ddd',
  background: '#fff',
  fontSize: 15,
  textAlign: 'left',
  cursor: 'pointer',
}

const rowCheckedStyle: React.CSSProperties = {
  background: '#f0f7f2',
  borderColor: '#3E7C59',
  color: '#3E7C59',
}
