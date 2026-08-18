import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'packtrack_session'

type Session = { personId: string; role: 'ADMIN' | 'LEADER' }

function secret(): string {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('SESSION_SECRET is not set')
  return s
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function createSessionValue(session: Session): string {
  const payload = `${session.personId}.${session.role}`
  return `${payload}.${sign(payload)}`
}

export function verifySessionValue(value: string | undefined): Session | null {
  if (!value) return null
  const parts = value.split('.')
  if (parts.length !== 3) return null
  const [personId, role, signature] = parts
  const payload = `${personId}.${role}`
  const expected = sign(payload)

  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  if (role !== 'ADMIN' && role !== 'LEADER') return null

  return { personId, role }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  return verifySessionValue(store.get(SESSION_COOKIE)?.value)
}
