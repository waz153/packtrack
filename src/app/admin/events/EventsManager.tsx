'use client'

import { useEffect, useState } from 'react'
import { formatEventDate } from '@/lib/formatDate'

type Event = {
  id: string
  name: string
  date: string
  endDate: string | null
  startTime: string | null
  endTime: string | null
  location: string | null
  notes: string | null
  status: 'LOCKED' | 'UNLOCKED' | 'CANCELLED'
  effectiveStatus: string
  qrToken: string
  checkinCount: number
}

type FormState = {
  name: string
  date: string
  startTime: string
  endTime: string
  location: string
  notes: string
}

const EMPTY_FORM: FormState = { name: '', date: '', startTime: '', endTime: '', location: '', notes: '' }

function toDateInput(iso: string) {
  return iso.slice(0, 10)
}

export default function EventsManager() {
  const [events, setEvents] = useState<Event[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/admin/events')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setEvents(json.events)
      setError(null)
    } catch {
      setError('Could not load events.')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    load()
  }, [])

  async function createEvent(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create event')
      setCreateForm(EMPTY_FORM)
      setCreating(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    }
  }

  function startEdit(ev: Event) {
    setEditingId(ev.id)
    setEditForm({
      name: ev.name,
      date: toDateInput(ev.date),
      startTime: ev.startTime || '',
      endTime: ev.endTime || '',
      location: ev.location || '',
      notes: ev.notes || '',
    })
  }

  async function saveEdit(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error()
      setEditingId(null)
      await load()
    } catch {
      setError('Could not save changes.')
    } finally {
      setBusyId(null)
    }
  }

  async function setStatus(id: string, status: Event['status']) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      await load()
    } catch {
      setError('Could not update event status.')
    } finally {
      setBusyId(null)
    }
  }

  if (!events) return <p>{error || 'Loading…'}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20 }}>Events</h1>
        <button onClick={() => setCreating((c) => !c)} style={primaryButtonStyle}>
          {creating ? 'Cancel' : '+ New event'}
        </button>
      </div>

      {error && <p style={{ color: '#B23B3B', marginTop: 12, fontSize: 14 }}>{error}</p>}

      {creating && (
        <form onSubmit={createEvent} style={formStyle}>
          <EventFields form={createForm} setForm={setCreateForm} />
          <button type="submit" style={primaryButtonStyle}>
            Create event
          </button>
        </form>
      )}

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {events.map((ev) => (
          <div key={ev.id} style={cardStyle}>
            {editingId === ev.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <EventFields form={editForm} setForm={setEditForm} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => saveEdit(ev.id)} disabled={busyId === ev.id} style={primaryButtonStyle}>
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} style={secondaryButtonStyle}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{ev.name}</div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                      {formatEventDate(ev.date)}
                      {ev.startTime ? ` · ${ev.startTime}` : ''}
                      {ev.endTime ? `–${ev.endTime}` : ''}
                      {ev.location ? ` · ${ev.location}` : ''}
                    </div>
                    {ev.notes && <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{ev.notes}</div>}
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      <StatusBadge status={ev.effectiveStatus} /> · {ev.checkinCount} checked in
                    </div>
                  </div>
                  <button onClick={() => startEdit(ev)} style={secondaryButtonStyle}>
                    Edit
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {ev.status !== 'UNLOCKED' && (
                    <button
                      onClick={() => setStatus(ev.id, 'UNLOCKED')}
                      disabled={busyId === ev.id}
                      style={secondaryButtonStyle}
                    >
                      Unlock
                    </button>
                  )}
                  {ev.status !== 'LOCKED' && (
                    <button
                      onClick={() => setStatus(ev.id, 'LOCKED')}
                      disabled={busyId === ev.id}
                      style={secondaryButtonStyle}
                    >
                      Lock
                    </button>
                  )}
                  {ev.status !== 'CANCELLED' && (
                    <button
                      onClick={() => setStatus(ev.id, 'CANCELLED')}
                      disabled={busyId === ev.id}
                      style={secondaryButtonStyle}
                    >
                      Cancel event
                    </button>
                  )}
                  <a href={`/checkin/${ev.qrToken}`} target="_blank" rel="noreferrer" style={secondaryButtonStyle}>
                    View check-in page
                  </a>
                  <a href={`/admin/events/${ev.id}/print`} target="_blank" rel="noreferrer" style={secondaryButtonStyle}>
                    Print flyer
                  </a>
                  <a href={`/admin/reports?eventId=${ev.id}`} style={secondaryButtonStyle}>
                    Report
                  </a>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function EventFields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  return (
    <>
      <label style={labelStyle}>
        Name
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
          required
        />
      </label>
      <label style={labelStyle}>
        Date
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          style={inputStyle}
          required
        />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ ...labelStyle, flex: 1 }}>
          Start time
          <input
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            placeholder="4:00 PM"
            style={inputStyle}
          />
        </label>
        <label style={{ ...labelStyle, flex: 1 }}>
          End time
          <input
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            placeholder="5:00 PM"
            style={inputStyle}
          />
        </label>
      </div>
      <label style={labelStyle}>
        Location
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Notes
        <input
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={inputStyle}
        />
      </label>
    </>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    UNLOCKED: '#3E7C59',
    LOCKED: '#888',
    CANCELLED: '#B23B3B',
  }
  return <span style={{ color: colors[status] || '#888', fontWeight: 600 }}>{status}</span>
}

const cardStyle: React.CSSProperties = {
  padding: 14,
  border: '1px solid #eee',
  borderRadius: 10,
}

const formStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 16,
  border: '1px solid #eee',
  borderRadius: 10,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#444',
  display: 'block',
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 4,
  padding: '8px 10px',
  fontSize: 15,
  border: '1px solid #ccc',
  borderRadius: 8,
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
  padding: '8px 14px',
  fontSize: 14,
  border: '1px solid #ccc',
  borderRadius: 8,
  background: '#fff',
  color: '#171717',
  cursor: 'pointer',
}
