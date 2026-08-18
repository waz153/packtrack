'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { formatEventDate } from '@/lib/formatDate'

type EventOption = { id: string; name: string; date: string }
type ReportRow = {
  denName: string
  firstName: string
  lastName: string
  checkedIn: boolean
  checkedInAt: string | null
  method: string | null
  checkedByName: string | null
}
type ReportData = {
  event: { id: string; name: string; date: string }
  rows: ReportRow[]
  totals: { checkedIn: number; total: number }
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function downloadCsv(report: ReportData) {
  const header = ['Den', 'First Name', 'Last Name', 'Checked In', 'Checked In At', 'Method', 'Checked By']
  const lines = [header.join(',')]
  for (const r of report.rows) {
    lines.push(
      [
        r.denName,
        r.firstName,
        r.lastName,
        r.checkedIn ? 'Yes' : 'No',
        r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : '',
        r.method ?? '',
        r.checkedByName ?? '',
      ]
        .map((v) => csvEscape(String(v)))
        .join(',')
    )
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${report.event.name.replace(/[^a-z0-9]+/gi, '-')}-attendance.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function ReportViewInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [events, setEvents] = useState<EventOption[] | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const eventId = searchParams.get('eventId')

  useEffect(() => {
    fetch('/api/admin/events')
      .then((r) => r.json())
      .then((json) => {
        setEvents(json.events)
        if (!eventId && json.events[0]) {
          router.replace(`/admin/reports?eventId=${json.events[0].id}`)
        }
      })
      .catch(() => setError('Could not load events.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!eventId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset before refetching on eventId change
    setReport(null)
    fetch(`/api/admin/reports/${eventId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error)
        setReport(json)
        setError(null)
      })
      .catch(() => setError('Could not load report.'))
  }, [eventId])

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>Reports</h1>

      {events && events.length > 0 && (
        <select
          value={eventId ?? ''}
          onChange={(e) => router.replace(`/admin/reports?eventId=${e.target.value}`)}
          style={{ marginTop: 16, padding: 8, borderRadius: 8, border: '1px solid #ccc', width: '100%' }}
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} — {formatEventDate(e.date)}
            </option>
          ))}
        </select>
      )}

      {error && <p style={{ color: '#B23B3B', marginTop: 12, fontSize: 14 }}>{error}</p>}

      {!report ? (
        <p style={{ marginTop: 16, color: '#666' }}>{error || 'Loading…'}</p>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <p style={{ color: '#666', fontSize: 14 }}>
              {report.totals.checkedIn} / {report.totals.total} checked in
            </p>
            <button onClick={() => downloadCsv(report)} style={primaryButtonStyle}>
              Export CSV
            </button>
          </div>

          <div style={{ marginTop: 12, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {['Den', 'Name', 'Checked In', 'Time', 'Method', 'By'].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((r, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{r.denName}</td>
                    <td style={tdStyle}>
                      {r.firstName} {r.lastName}
                    </td>
                    <td style={tdStyle}>{r.checkedIn ? '✓' : ''}</td>
                    <td style={tdStyle}>{r.checkedInAt ? new Date(r.checkedInAt).toLocaleTimeString() : ''}</td>
                    <td style={tdStyle}>{r.method ?? ''}</td>
                    <td style={tdStyle}>{r.checkedByName ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default function ReportView() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ReportViewInner />
    </Suspense>
  )
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

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 8px',
  borderBottom: '2px solid #eee',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderBottom: '1px solid #f2f2f2',
  whiteSpace: 'nowrap',
}
