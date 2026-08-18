import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { generatePasscode } from '@/lib/token'

export async function GET() {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const [people, dens] = await Promise.all([
    prisma.person.findMany({
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        dens: true,
      },
    }),
    prisma.den.findMany({ orderBy: { name: 'asc' } }),
  ])

  return NextResponse.json({ people, dens })
}

export async function POST(req: Request) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { name, role, denIds } = await req.json()

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (role !== 'ADMIN' && role !== 'LEADER') {
    return NextResponse.json({ error: 'Role must be ADMIN or LEADER' }, { status: 400 })
  }

  const passcode = generatePasscode(4)

  const person = await prisma.person.create({
    data: {
      name: name.trim(),
      role,
      passcode,
      dens: Array.isArray(denIds) ? { connect: denIds.map((id: string) => ({ id })) } : undefined,
    },
    include: { dens: true },
  })

  return NextResponse.json({ person })
}
