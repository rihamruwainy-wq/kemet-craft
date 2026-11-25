import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatRoom } from '@/components/chat/chat-room'

// Reads the login session per request, so it renders on the server each time
export const instant = false

export default async function StoreChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/store" className="text-xl font-bold tracking-tight">
            KemetCraft Store
          </Link>
          <Link href="/store" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Back to store
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chat with us</h2>
          <p className="text-sm text-muted-foreground">
            Ask about a piece, shipping or custom orders. We usually reply within a few hours.
          </p>
        </div>
        <ChatRoom
          roomId={user.id}
          currentUserId={user.id}
          currentUserName={profile?.full_name ?? user.email ?? 'Buyer'}
          emptyText="Send us a message and the shop will reply here."
        />
      </main>
    </div>
  )
}
