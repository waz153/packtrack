'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'

type Scout = { id: string; checkedIn: boolean }
type Den = { id: string; name: string; scouts: Scout[] }
type EventSummary = { id: string; name: string; date: string; status: string; qrToken: string }
type DashboardData = {
  event: EventSummary
  events: { id: string; name: string; date: string }[]
  dens: Den[]
  totals: { checkedIn: number; total: number }
}

const POLL_MS = 7000

export default function AdminHome() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [checkinUrl, setCheckinUrl] = useState('')

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

  useEffect(() => {
    if (!data || typeof window === 'undefined') return
    const url = `${window.location.origin}/checkin/${data.event.qrToken}`
    setCheckinUrl(url)
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 220, margin: 1 })
    }
  }, [data])

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
        <h1 style={{ fontSize: 20 }}>Admin — {data.event.name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/staff/dashboard" style={linkButtonStyle}>
            Dashboard
          </a>
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

      {error && <p style={{ color: '#B23B3B', marginTop: 12, fontSize: 14 }}>{error}</p>}

      <div
        style={{
          marginTop: 24,
          padding: 20,
          borderRadius: 12,
          border: '1px solid #eee',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 42, fontWeight: 700 }}>
          {data.totals.checkedIn}
          <span style={{ fontSize: 20, color: '#888' }}> / {data.totals.total}</span>
        </div>
        <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>checked in · status {data.event.status}</div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {data.dens.map((den) => {
          const checked = den.scouts.filter((s) => s.checkedIn).length
          return (
            <div
              key={den.id}
              style={{
                flex: '1 1 100px',
                padding: 12,
                border: '1px solid #eee',
                borderRadius: 10,
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 600 }}>{den.name}</div>
              <div style={{ color: '#666', fontSize: 14 }}>
                {checked} / {den.scouts.length}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Check-in QR code</h2>
        <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
        <p style={{ marginTop: 8, fontSize: 13, wordBreak: 'break-all', color: '#666' }}>{checkinUrl}</p>
      </div>
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
