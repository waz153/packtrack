'use client'

import { useState } from 'react'
import { denColor } from '@/lib/denColors'

type Den = { id: string; name: string; logoUrl: string | null }
type Scout = { id: string; firstName: string; lastName: string; checkedIn: boolean }

export default function CheckinFlow({
  qrToken,
  eventName,
  dens,
}: {
  qrToken: string
  eventName: string
  dens: Den[]
}) {
  const [selectedDen, setSelectedDen] = useState<Den | null>(null)
  const [scouts, setScouts] = useState<Scout[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmedName, setConfirmedName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function openDen(den: Den) {
    setSelectedDen(den)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/checkin/${qrToken}/scouts?denId=${den.id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load scouts')
      setScouts(data.scouts)
    } catch {
      setError('Could not load scouts for this den. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function checkIn(scout: Scout) {
    if (confirmedName) return
    try {
      const res = await fetch(`/api/checkin/${qrToken}/scouts/${scout.id}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Check-in failed')
      setScouts((prev) => prev.map((s) => (s.id === scout.id ? { ...s, checkedIn: true } : s)))
      setConfirmedName(scout.firstName)
      setTimeout(() => setConfirmedName(null), 1800)
    } catch {
      setError('Check-in failed. Check your connection and try again.')
    }
  }

  if (confirmedName) {
    return (
      <main style={styles.centered}>
        <div style={{ fontSize: 64 }}>✅</div>
        <h1 style={{ fontSize: 24, marginTop: 12 }}>{confirmedName}, you&apos;re checked in!</h1>
      </main>
    )
  }

  if (!selectedDen) {
    return (
      <main style={styles.page}>
        <h1 style={{ fontSize: 22, textAlign: 'center', margin: '24px 0 4px' }}>{eventName}</h1>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: 24 }}>
          Tap your den to check in
        </p>
        <div style={styles.denGrid}>
          {dens.map((den) => (
            <button key={den.id} onClick={() => openDen(den)} style={styles.denTileButton}>
              <div style={{ ...styles.denTile, background: denColor(den.name) }}>
                {den.name[0]}
              </div>
              <span style={{ marginTop: 8, fontWeight: 600 }}>{den.name}</span>
            </button>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 16px 8px' }}>
        <button
          onClick={() => {
            setSelectedDen(null)
            setScouts([])
            setError(null)
          }}
          style={styles.backButton}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: 20 }}>{selectedDen.name}</h1>
      </div>

      {error && <p style={{ color: '#B23B3B', padding: '0 16px' }}>{error}</p>}
      {loading && <p style={{ padding: '0 16px', color: '#666' }}>Loading scouts…</p>}

      <div style={{ padding: '8px 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {scouts.map((scout) => (
          <button
            key={scout.id}
            onClick={() => checkIn(scout)}
            style={{
              ...styles.scoutRow,
              ...(scout.checkedIn ? styles.scoutRowChecked : {}),
            }}
          >
            <span>
              {scout.firstName} {scout.lastName}
            </span>
            {scout.checkedIn && <span style={{ fontSize: 18 }}>✓</span>}
          </button>
        ))}
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    flex: 1,
    minHeight: '100vh',
    maxWidth: 480,
    margin: '0 auto',
    width: '100%',
  },
  centered: {
    flex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  denGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    padding: '0 16px',
  },
  denTileButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: 'none',
    background: 'none',
    padding: 0,
    cursor: 'pointer',
  },
  denTile: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 40,
    fontWeight: 700,
  },
  backButton: {
    border: 'none',
    background: 'none',
    fontSize: 15,
    cursor: 'pointer',
    color: '#171717',
    padding: '4px 0',
  },
  scoutRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '14px 16px',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ddd',
    background: '#fff',
    fontSize: 16,
    textAlign: 'left',
    cursor: 'pointer',
  },
  scoutRowChecked: {
    background: '#f0f7f2',
    borderColor: '#3E7C59',
    color: '#3E7C59',
  },
}
