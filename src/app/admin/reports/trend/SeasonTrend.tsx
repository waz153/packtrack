'use client'

import { useEffect, useState } from 'react'
import { formatEventDate } from '@/lib/formatDate'
import { toCsv, downloadCsv } from '@/lib/csv'
import ReportsTabs from '../ReportsTabs'

type Row = {
  id: string
  name: string
  date: string
  checkedInCount: number
  totalScouts: number
  rate: number
}

export default function SeasonTrend() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/reports/trend')
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error)
        setRows(json.rows)
      })
      .catch(() => setError('Could not load season trend.'))
  }, [])

  function exportCsv() {
    if (!rows) return
    const csv = toCsv(
      ['Event', 'Date', 'Checked In', 'Of Scouts', 'Rate'],
      rows.map((r) => [
        r.name,
        formatEventDate(r.date),
        r.checkedInCount,
        r.totalScouts,
        `${Math.round(r.rate * 100)}%`,
      ])
    )
    downloadCsv('season-trend.csv', csv)
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

  return (
    <div>
      <h1 style={{ fontSize: 20 }}>Reports</h1>
      <ReportsTabs />

      <p style={{ color: '#666', fontSize: 14, marginTop: 16 }}>
        Check-in turnout at each event held so far, out of {rows[0]?.totalScouts ?? 0} active scouts.
      </p>

      {error && <p style={{ color: '#B23B3B', marginTop: 12, fontSize: 14 }}>{error}</p>}

      {rows.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={exportCsv} style={primaryButtonStyle}>
            Export CSV
          </button>
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.length === 0 && <p style={{ color: '#666' }}>No events have been held yet.</p>}
        {rows.map((r) => (
          <div key={r.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 4 }}>
              <span>
                {r.name} <span style={{ color: '#999' }}>— {formatEventDate(r.date)}</span>
              </span>
              <span style={{ color: '#666' }}>
                {r.checkedInCount} / {r.totalScouts} ({Math.round(r.rate * 100)}%)
              </span>
            </div>
            <div style={{ background: '#f2f2f2', borderRadius: 6, height: 10, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.round(r.rate * 100))}%`,
                  background: '#3E7C59',
                  height: '100%',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
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
