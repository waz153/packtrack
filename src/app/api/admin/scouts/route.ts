import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'

export async function GET() {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const dens = await prisma.den.findMany({
    orderBy: { name: 'asc' },
    include: {
      scouts: {
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      },
    },
  })

  return NextResponse.json({ dens })
}

export async function POST(req: Request) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { firstName, lastName, denId } = await req.json()
  if (
    typeof firstName !== 'string' ||
    !firstName.trim() ||
    typeof lastName !== 'string' ||
    !lastName.trim() ||
    typeof denId !== 'string' ||
    !denId
  ) {
    return NextResponse.json({ error: 'firstName, lastName, and denId are required' }, { status: 400 })
  }

  const den = await prisma.den.findUnique({ where: { id: denId } })
  if (!den) return NextResponse.json({ error: 'Den not found' }, { status: 400 })

  const scout = await prisma.scout.create({
    data: { firstName: firstName.trim(), lastName: lastName.trim(), denId },
  })

  return NextResponse.json({ scout })
}
