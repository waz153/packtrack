import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function requireAdminSession() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null

  const person = await prisma.person.findUnique({ where: { id: session.personId } })
  if (!person || !person.active || person.role !== 'ADMIN') return null

  return person
}
