'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { formatEventDate } from '@/lib/formatDate'

type EventData = {
  id: string
  name: string
  date: string
  startTime: string | null
  endTime: string | null
  location: string | null
  notes: string | null
  qrToken: string
}

export default function PrintFlyer({ event, checkinUrl }: { event: EventData; checkinUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (checkinUrl && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, checkinUrl, { width: 360, margin: 1 })
    }
  }, [checkinUrl])

  return (
    <div>
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body, html { background: #fff !important; }
          .print-container { max-width: none !important; margin: 0 !important; padding: 0 !important; }
          .print-card { border: none !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="no-print" style={{ marginBottom: 16 }}>
        <button onClick={() => window.print()} style={primaryButtonStyle}>
          Print
        </button>
      </div>

      <div
        className="print-card"
        style={{
          maxWidth: 480,
          margin: '0 auto',
          border: '1px solid #eee',
          borderRadius: 16,
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- print-only static asset, no need for next/image optimization here */}
        <img src="/logo.png" alt="Cub Scouts" style={{ width: 96, height: 96, objectFit: 'contain' }} />

        <h1 style={{ fontSize: 20, color: '#666', marginTop: 8, fontWeight: 500 }}>Pack 815</h1>
        <h2 style={{ fontSize: 26, marginTop: 8 }}>{event.name}</h2>

        <p style={{ fontSize: 16, color: '#444', marginTop: 12, lineHeight: 1.6 }}>
          {formatEventDate(event.date)}
          {event.startTime ? ` · ${event.startTime}` : ''}
          {event.endTime ? `–${event.endTime}` : ''}
          <br />
          {event.location}
        </p>

        {event.notes && <p style={{ fontSize: 14, color: '#888', marginTop: 8 }}>{event.notes}</p>}

        <div style={{ marginTop: 28 }}>
          <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
        </div>

        <p style={{ fontSize: 18, fontWeight: 600, marginTop: 16 }}>Scan to check in</p>
        <p style={{ marginTop: 6, fontSize: 12, wordBreak: 'break-all', color: '#999' }}>{checkinUrl}</p>
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
