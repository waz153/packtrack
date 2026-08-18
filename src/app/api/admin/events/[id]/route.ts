import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/adminAuth'

const EDITABLE_FIELDS = ['name', 'startTime', 'endTime', 'location', 'notes'] as const
const STATUS_VALUES = ['LOCKED', 'UNLOCKED', 'CANCELLED'] as const

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession()
  if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}

  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field] || null
  }
  if (typeof body.name === 'string') data.name = body.name.trim()

  if ('date' in body && body.date) {
    const parsedDate = new Date(body.date)
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }
    data.date = parsedDate
  }

  if ('endDate' in body) {
    data.endDate = body.endDate ? new Date(body.endDate) : null
  }

  if ('status' in body) {
    if (!STATUS_VALUES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    data.status = body.status
    data.isManualOverride = true
  }

  const event = await prisma.event.update({ where: { id }, data })
  return NextResponse.json({ event })
}
