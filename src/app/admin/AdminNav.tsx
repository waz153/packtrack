'use client'

import { usePathname, useRouter } from 'next/navigation'

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/scouts', label: 'Scouts' },
  { href: '/admin/people', label: 'People' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/help', label: 'Help' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/staff/logout', { method: 'POST' })
    router.push('/staff/login')
  }

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid #eee',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {LINKS.map((link) => {
          const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
          return (
            <a
              key={link.href}
              href={link.href}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 14,
                background: active ? '#171717' : 'transparent',
                color: active ? '#fff' : '#171717',
              }}
            >
              {link.label}
            </a>
          )
        })}
      </div>
      <button
        onClick={logout}
        style={{
          padding: '6px 12px',
          fontSize: 13,
          border: '1px solid #ccc',
          borderRadius: 8,
          background: '#fff',
          cursor: 'pointer',
          color: '#171717',
        }}
      >
        Log out
      </button>
    </nav>
  )
}
