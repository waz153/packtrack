import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { createSessionValue, SESSION_COOKIE } from '@/lib/session'

export async function POST(req: Request) {
  const { name, passcode } = await req.json()

  if (typeof name !== 'string' || typeof passcode !== 'string' || !name.trim() || !passcode.trim()) {
    return NextResponse.json({ error: 'Name and passcode are required' }, { status: 400 })
  }

  const person = await prisma.person.findFirst({
    where: {
      name: { equals: name.trim(), mode: 'insensitive' },
      passcode: passcode.trim(),
      active: true,
    },
  })

  if (!person) {
    return NextResponse.json({ error: 'Invalid name or passcode' }, { status: 401 })
  }

  const store = await cookies()
  store.set(SESSION_COOKIE, createSessionValue({ personId: person.id, role: person.role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return NextResponse.json({ ok: true, name: person.name, role: person.role })
}
