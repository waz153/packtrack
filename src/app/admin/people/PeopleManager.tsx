'use client'

import { useEffect, useState } from 'react'

type Den = { id: string; name: string }
type Person = {
  id: string
  name: string
  role: 'ADMIN' | 'LEADER'
  active: boolean
  dens: Den[]
}

type FormState = { name: string; role: 'ADMIN' | 'LEADER'; denIds: string[] }
const EMPTY_FORM: FormState = { name: '', role: 'LEADER', denIds: [] }

export default function PeopleManager() {
  const [people, setPeople] = useState<Person[] | null>(null)
  const [dens, setDens] = useState<Den[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/admin/people')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setPeople(json.people)
      setDens(json.dens)
      setError(null)
    } catch {
      setError('Could not load people.')
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    load()
  }, [])

  async function createPerson(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.name.trim()) return
    setError(null)
    try {
      const res = await fetch('/api/admin/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create person')
      setNotice(`${json.person.name}'s passcode is ${json.person.passcode} — write it down, it won't be shown again.`)
      setCreateForm(EMPTY_FORM)
      setCreating(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create person')
    }
  }

  function startEdit(p: Person) {
    setEditingId(p.id)
    setEditForm({ name: p.name, role: p.role, denIds: p.dens.map((d) => d.id) })
    setNotice(null)
  }

  async function saveEdit(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/people/${id}`, {
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

  async function toggleActive(p: Person) {
    setBusyId(p.id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/people/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !p.active }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not update')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update person.')
    } finally {
      setBusyId(null)
    }
  }

  async function regeneratePasscode(p: Person) {
    setBusyId(p.id)
    try {
      const res = await fetch(`/api/admin/people/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regeneratePasscode: true }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error()
      setNotice(`${p.name}'s new passcode is ${json.person.passcode} — write it down, it won't be shown again.`)
      await load()
    } catch {
      setError('Could not regenerate passcode.')
    } finally {
      setBusyId(null)
    }
  }

  function toggleDen(form: FormState, setForm: (f: FormState) => void, denId: string) {
    const has = form.denIds.includes(denId)
    setForm({ ...form, denIds: has ? form.denIds.filter((id) => id !== denId) : [...form.denIds, denId] })
  }

  if (!people) return <p>{error || 'Loading…'}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20 }}>People</h1>
        <button onClick={() => setCreating((c) => !c)} style={primaryButtonStyle}>
          {creating ? 'Cancel' : '+ New person'}
        </button>
      </div>

      {notice && (
        <p style={{ background: '#fff8e1', border: '1px solid #f0d98c', borderRadius: 8, padding: 10, marginTop: 12, fontSize: 14 }}>
          {notice}
        </p>
      )}
      {error && <p style={{ color: '#B23B3B', marginTop: 12, fontSize: 14 }}>{error}</p>}

      {creating && (
        <form onSubmit={createPerson} style={formStyle}>
          <PersonFields form={createForm} setForm={setCreateForm} dens={dens} toggleDen={toggleDen} />
          <button type="submit" style={primaryButtonStyle}>
            Create person
          </button>
        </form>
      )}

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {people.map((p) => (
          <div key={p.id} style={cardStyle}>
            {editingId === p.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <PersonFields form={editForm} setForm={setEditForm} dens={dens} toggleDen={toggleDen} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => saveEdit(p.id)} disabled={busyId === p.id} style={primaryButtonStyle}>
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
                    <div style={{ fontWeight: 600 }}>
                      {p.name} {!p.active && <span style={{ color: '#B23B3B', fontWeight: 400 }}>(deactivated)</span>}
                    </div>
                    <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                      {p.role}
                      {p.role === 'LEADER' && ` · ${p.dens.map((d) => d.name).join(', ') || 'no den assigned'}`}
                    </div>
                  </div>
                  <button onClick={() => startEdit(p)} style={secondaryButtonStyle}>
                    Edit
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => regeneratePasscode(p)}
                    disabled={busyId === p.id}
                    style={secondaryButtonStyle}
                  >
                    Regenerate passcode
                  </button>
                  <button onClick={() => toggleActive(p)} disabled={busyId === p.id} style={secondaryButtonStyle}>
                    {p.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PersonFields({
  form,
  setForm,
  dens,
  toggleDen,
}: {
  form: FormState
  setForm: (f: FormState) => void
  dens: Den[]
  toggleDen: (form: FormState, setForm: (f: FormState) => void, denId: string) => void
}) {
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
        Role
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as 'ADMIN' | 'LEADER' })}
          style={inputStyle}
        >
          <option value="LEADER">Leader</option>
          <option value="ADMIN">Admin</option>
        </select>
      </label>
      {form.role === 'LEADER' && (
        <div>
          <span style={labelStyle}>Dens</span>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
            {dens.map((den) => (
              <label key={den.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={form.denIds.includes(den.id)}
                  onChange={() => toggleDen(form, setForm, den.id)}
                />
                {den.name}
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  )
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

const cardStyle: React.CSSProperties = {
  padding: 14,
  border: '1px solid #eee',
  borderRadius: 10,
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
