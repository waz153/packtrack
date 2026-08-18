import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'
import { generatePasscode } from '@/lib/token'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  if (id === admin.id && body.active === false) {
    return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}

  if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim()
  if (body.role === 'ADMIN' || body.role === 'LEADER') data.role = body.role
  if (typeof body.active === 'boolean') data.active = body.active
  if (Array.isArray(body.denIds)) {
    data.dens = { set: body.denIds.map((denId: string) => ({ id: denId })) }
  }
  const regenerating = !!body.regeneratePasscode
  if (regenerating) {
    data.passcode = generatePasscode(4)
  }

  const person = await prisma.person.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
      dens: true,
      passcode: regenerating,
    },
  })
  return NextResponse.json({ person })
}
