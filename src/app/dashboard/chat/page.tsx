import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SellerInbox } from '@/components/chat/seller-inbox'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Live Chat</h2>
        <p className="text-sm text-slate-500">Reply to buyers in real time</p>
      </div>
      <SellerInbox userId={user.id} userName={profile?.full_name ?? 'KemetCraft'} />
    </div>
  )
}
