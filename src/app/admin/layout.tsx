import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/adminAuth'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const admin = await requireAdminSession()
  if (!admin) redirect('/staff/login')

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 16px 64px' }}>
      <AdminNav />
      {children}
    </div>
  )
}
