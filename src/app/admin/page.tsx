import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import AdminHome from './AdminHome'

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/staff/login')

  const person = await prisma.person.findUnique({ where: { id: session.personId } })
  if (!person || person.role !== 'ADMIN') redirect('/staff/dashboard')

  return <AdminHome />
}
