import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Reads the login session per request, so it renders on the server each time
export const instant = false

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="uppercase">
              {profile?.role ?? 'seller'}
            </Badge>
           
             <Link href="/dashboard/account" className="text-sm font-medium hover:underline">
                {profile?.full_name ?? user.email}
              </Link>
            
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}