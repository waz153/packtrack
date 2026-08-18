import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import Dashboard from './Dashboard'

export default async function StaffDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/staff/login')

  return <Dashboard />
}
