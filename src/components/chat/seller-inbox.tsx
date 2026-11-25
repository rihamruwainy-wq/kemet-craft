'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatRoom, type ChatMessage } from '@/components/chat/chat-room'

type Room = { roomId: string; buyerName: string; lastMessage: string; lastAt: string | null }

// Groups messages into one conversation per buyer, newest first
function toRooms(messages: ChatMessage[]): Room[] {
  const rooms = new Map<string, Room>()
  for (const m of messages) {
    const existing = rooms.get(m.room_id)
    const buyerName =
      m.sender_id === m.room_id && m.sender_name ? m.sender_name : existing?.buyerName ?? 'Buyer'
    if (!existing || String(m.created_at) >= String(existing.lastAt)) {
      rooms.set(m.room_id, { roomId: m.room_id, buyerName, lastMessage: m.content, lastAt: m.created_at })
    } else if (buyerName !== existing.buyerName) {
      existing.buyerName = buyerName
    }
  }
  return [...rooms.values()].sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)))
}

export function SellerInbox({ userId, userName }: { userId: string; userName: string }) {
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1000)
      .then(({ data }) => {
        setMessages((data ?? []) as ChatMessage[])
        setLoading(false)
      })

    // Keep the conversation list fresh as new messages arrive
    const channel = supabase
      .channel('seller-inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as ChatMessage
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const rooms = toRooms(messages)
  const active = selected ?? rooms[0]?.roomId ?? null

  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3 text-sm font-semibold">Conversations</div>
        {loading ? (
          <p className="p-4 text-sm text-slate-500">Loading...</p>
        ) : rooms.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            No conversations yet. Buyers can message you from the store&apos;s &quot;Chat with us&quot; page.
          </p>
        ) : (
          <ul>
            {rooms.map((r) => (
              <li key={r.roomId}>
                <button
                  onClick={() => setSelected(r.roomId)}
                  className={`w-full cursor-pointer border-b px-4 py-3 text-left transition last:border-b-0 ${
                    active === r.roomId ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-medium">{r.buyerName}</p>
                  <p className="truncate text-xs text-slate-500">{r.lastMessage}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {active ? (
        <ChatRoom key={active} roomId={active} currentUserId={userId} currentUserName={userName} />
      ) : (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-white text-sm text-slate-500">
          Select a conversation
        </div>
      )}
    </div>
  )
}
