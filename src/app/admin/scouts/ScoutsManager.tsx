'use client'

import { useEffect, useState } from 'react'

type Scout = { id: string; firstName: string; lastName: string; active: boolean }
type Den = { id: string; name: string; scouts: Scout[] }

export default function ScoutsManager() {
  const [dens, setDens] = useState<Den[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [denId, setDenId] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [showRemoved, setShowRemoved] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/admin/scouts')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setDens(json.dens)
      if (!denId && json.dens[0]) setDenId(json.dens[0].id)
      setError(null)
    } catch {
      setError('Could not load scouts.')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function addScout(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !denId) return
    try {
      const res = await fetch('/api/admin/scouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, denId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to add scout')
      setFirstName('')
      setLastName('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add scout')
    }
  }

  async function removeScout(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/scouts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      await load()
    } catch {
      setError('Could not remove scout.')
    } finally {
      setBusyId(null)
    }
  }

  async function restoreScout(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/scouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true }),
      })
      if (!res.ok) throw new Error()
      await load()
    } catch {
      setError('Could not restore scout.')
    } finally {
      setBusyId(null)
    }
  }

  if (!dens) return <p>{error || 'Loading…'}</p>

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>Scouts</h1>

      {error && <p style={{ color: '#B23B3B', marginTop: 12, fontSize: 14 }}>{error}</p>}

      <form onSubmit={addScout} style={formStyle}>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
          style={{ ...inputStyle, flex: 1 }}
          required
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last name"
          style={{ ...inputStyle, flex: 1 }}
          required
        />
        <select value={denId} onChange={(e) => setDenId(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
          {dens.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <button type="submit" style={primaryButtonStyle}>
          Add
        </button>
      </form>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 13, color: '#444' }}>
        <input type="checkbox" checked={showRemoved} onChange={(e) => setShowRemoved(e.target.checked)} />
        Show removed scouts
      </label>

      {dens.map((den) => {
        const visible = den.scouts.filter((s) => showRemoved || s.active)
        if (visible.length === 0) return null
        return (
          <section key={den.id} style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>
              {den.name} <span style={{ color: '#888', fontWeight: 400 }}>({den.scouts.filter((s) => s.active).length})</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {visible.map((scout) => (
                <div
                  key={scout.id}
                  style={{
                    ...rowStyle,
                    ...(scout.active ? {} : rowRemovedStyle),
                  }}
                >
                  <span>
                    {scout.firstName} {scout.lastName}
                    {!scout.active && ' — removed'}
                  </span>
                  {scout.active ? (
                    <button
                      onClick={() => removeScout(scout.id)}
                      disabled={busyId === scout.id}
                      style={secondaryButtonStyle}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => restoreScout(scout.id)}
                      disabled={busyId === scout.id}
                      style={secondaryButtonStyle}
                    >
                      Restore
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

const formStyle: React.CSSProperties = {
  marginTop: 16,
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
}

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: 15,
  border: '1px solid #ccc',
  borderRadius: 8,
  minWidth: 120,
}

const primaryButtonStyle: React.CSSProperties = {
  padding: '8px 14px',
  fontSize: 14,
  border: 'none',
  borderRadius: 8,
  background: '#171717',
  color: '#fff',
  cursor: 'pointer',
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 13,
  border: '1px solid #ccc',
  borderRadius: 8,
  background: '#fff',
  color: '#171717',
  cursor: 'pointer',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  border: '1px solid #eee',
  borderRadius: 8,
  fontSize: 14,
}

const rowRemovedStyle: React.CSSProperties = {
  opacity: 0.6,
  background: '#faf5f5',
}
