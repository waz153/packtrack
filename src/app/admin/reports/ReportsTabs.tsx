'use client'

import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/admin/reports', label: 'Per Event' },
  { href: '/admin/reports/attendance', label: 'Attendance History' },
  { href: '/admin/reports/trend', label: 'Season Trend' },
]

export default function ReportsTabs() {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 16, flexWrap: 'wrap' }}>
      {TABS.map((tab) => {
        const active = pathname === tab.href
        return (
          <a
            key={tab.href}
            href={tab.href}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 13,
              border: '1px solid #ddd',
              background: active ? '#171717' : '#fff',
              color: active ? '#fff' : '#171717',
            }}
          >
            {tab.label}
          </a>
        )
      })}
    </div>
  )
}
