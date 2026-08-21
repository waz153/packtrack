'use client'

import { useEffect, useState } from 'react'
import { toCsv, downloadCsv } from '@/lib/csv'
import ReportsTabs from '../ReportsTabs'

type Row = {
  id: string
  firstName: string
  lastName: string
  denName: string
  checkedInCount: number
  totalEvents: number
  rate: number
}

export default function AttendanceHistory() {
  const [totalEvents, setTotalEvents] = useState<number | null>(null)
  const [rows, setRows] = useState<Row[] | null>(null)
  const [denFilter, setDenFilter] = useState('All')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/reports/attendance')
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error)
        setRows(json.rows)
        setTotalEvents(json.totalEvents)
      })
      .catch(() => setError('Could not load attendance history.'))
  }, [])

  function exportCsv() {
    if (!rows) return
    const csv = toCsv(
      ['Den', 'First Name', 'Last Name', 'Checked In', 'Of Events', 'Rate'],
      rows.map((r) => [
        r.denName,
        r.firstName,
        r.lastName,
        r.checkedInCount,
        r.totalEvents,
        `${Math.round(r.rate * 100)}%`,
      ])
    )
    downloadCsv('attendance-history.csv', csv)
  }

  if (!rows) {
    return (
      <div>
        <h1 style={{ fontSize: 20 }}>Reports</h1>
        <ReportsTabs />
        <p style={{ marginTop: 16, color: '#666' }}>{error || 'Loading…'}</p>
      </div>
    )
  }

  const dens = ['All', ...Array.from(new Set(rows.map((r) => r.denName))).sort()]
  const visible = denFilter === 'All' ? rows : rows.filter((r) => r.denName === denFilter)

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>Reports</h1>
      <ReportsTabs />

      <p style={{ color: '#666', fontSize: 14, marginTop: 16 }}>
        Check-in rate across {totalEvents} event{totalEvents === 1 ? '' : 's'} held so far. Lowest attendance
        shown first.
      </p>

      {error && <p style={{ color: '#B23B3B', marginTop: 12, fontSize: 14 }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 8 }}>
        <select
          value={denFilter}
          onChange={(e) => setDenFilter(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
        >
          {dens.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button onClick={exportCsv} style={primaryButtonStyle}>
          Export CSV
        </button>
      </div>

      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              {['Den', 'Name', 'Checked In', 'Rate'].map((h) => (
                <th key={h} style={thStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id}>
                <td style={tdStyle}>{r.denName}</td>
                <td style={tdStyle}>
                  {r.firstName} {r.lastName}
                </td>
                <td style={tdStyle}>
                  {r.checkedInCount} / {r.totalEvents}
                </td>
                <td style={{ ...tdStyle, color: rateColor(r.rate), fontWeight: 600 }}>
                  {Math.round(r.rate * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function rateColor(rate: number) {
  if (rate < 0.34) return '#B23B3B'
  if (rate < 0.67) return '#B2860B'
  return '#3E7C59'
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
