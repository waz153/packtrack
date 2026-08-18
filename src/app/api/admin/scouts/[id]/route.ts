import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (typeof body.firstName === 'string' && body.firstName.trim()) data.firstName = body.firstName.trim()
  if (typeof body.lastName === 'string' && body.lastName.trim()) data.lastName = body.lastName.trim()
  if (typeof body.denId === 'string' && body.denId) data.denId = body.denId
  if (typeof body.active === 'boolean') data.active = body.active

  const scout = await prisma.scout.update({ where: { id }, data })
  return NextResponse.json({ scout })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { id } = await params
  const scout = await prisma.scout.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ scout })
}
