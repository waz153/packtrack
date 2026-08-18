'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StaffLoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, passcode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }
      if (data.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/staff/dashboard')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <form
        onSubmit={submit}
        style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <h1 style={{ fontSize: 22, textAlign: 'center', marginBottom: 12 }}>Staff Login</h1>

        <label style={{ fontSize: 14, color: '#444' }}>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="username"
            style={inputStyle}
            required
          />
        </label>

        <label style={{ fontSize: 14, color: '#444' }}>
          Passcode
          <input
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            style={inputStyle}
            required
          />
        </label>

        {error && <p style={{ color: '#B23B3B', fontSize: 14 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 8,
            padding: '12px 16px',
            background: '#171717',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 4,
  padding: '10px 12px',
  fontSize: 16,
  border: '1px solid #ccc',
  borderRadius: 8,
}
