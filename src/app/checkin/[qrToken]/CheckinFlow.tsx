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
  const [confirmation, setConfirmation] = useState<{ name: string; undone: boolean } | null>(null)
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

  async function toggleCheckIn(scout: Scout) {
    if (confirmation) return
    const undoing = scout.checkedIn
    try {
      const res = await fetch(`/api/checkin/${qrToken}/scouts/${scout.id}`, {
        method: undoing ? 'DELETE' : 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      setScouts((prev) => prev.map((s) => (s.id === scout.id ? { ...s, checkedIn: !undoing } : s)))
      setConfirmation({ name: scout.firstName, undone: undoing })
      setTimeout(() => setConfirmation(null), 1800)
    } catch {
      setError('That didn’t go through. Check your connection and try again.')
    }
  }

  if (confirmation) {
    return (
      <main style={styles.centered}>
        <div style={{ fontSize: 64 }}>{confirmation.undone ? '↩️' : '✅'}</div>
        <h1 style={{ fontSize: 24, marginTop: 12 }}>
          {confirmation.undone
            ? `${confirmation.name}'s check-in was undone.`
            : `${confirmation.name}, you're checked in!`}
        </h1>
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
              <DenTile name={den.name} />
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
      {!loading && scouts.length > 0 && (
        <p style={{ padding: '0 16px', color: '#999', fontSize: 12 }}>
          Checked in by mistake? Tap the name again to undo.
        </p>
      )}

      <div style={{ padding: '8px 16px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {scouts.map((scout) => (
          <button
            key={scout.id}
            onClick={() => toggleCheckIn(scout)}
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

const LOGO_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']

function DenTile({ name }: { name: string }) {
  const [extIndex, setExtIndex] = useState(0)

  if (extIndex >= LOGO_EXTENSIONS.length) {
    return (
      <div style={{ ...styles.denTile, background: denColor(name) }}>{name[0]}</div>
    )
  }

  const src = `/dens/${name.toLowerCase()}.${LOGO_EXTENSIONS[extIndex]}`

  return (
    <div style={{ ...styles.denTile, background: '#f2f2f2', padding: 8 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- den logos are user-uploaded, extension unknown at build time */}
      <img
        key={src}
        src={src}
        alt={name}
        onError={() => setExtIndex((i) => i + 1)}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
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
