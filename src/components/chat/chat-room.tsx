'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'

export type ChatMessage = {
  id: string
  room_id: string
  sender_id: string
  sender_name: string | null
  content: string
  created_at: string | null
}

type Props = {
  roomId: string
  currentUserId: string
  currentUserName: string
  emptyText?: string
}

// Real-time chat for one room. A room is one buyer's conversation with the shop
// (room_id = the buyer's user id). Messages arrive live via Supabase Realtime.
export function ChatRoom({ roomId, currentUserId, currentUserName, emptyText }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (active) setMessages((data ?? []) as ChatMessage[])
      })

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const msg = payload.new as ChatMessage
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [roomId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setSending(true)
    setError(null)

    const { data, error } = await supabase
      .from('messages')
      .insert({ room_id: roomId, sender_id: currentUserId, sender_name: currentUserName, content })
      .select()
      .single()

    if (error) {
      setError('Message not sent. Please try again.')
    } else {
      setText('')
      if (data) {
        const msg = data as ChatMessage
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
      }
    }
    setSending(false)
  }

  return (
    <div className="flex h-[60vh] min-h-[400px] flex-col rounded-lg border bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="pt-10 text-center text-sm text-slate-500">
            {emptyText ?? 'No messages yet. Say hello!'}
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 text-xs font-semibold opacity-70">{m.sender_name ?? 'User'}</p>
                )}
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                {m.created_at && (
                  <p className="mt-1 text-[10px] opacity-60">
                    {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          maxLength={2000}
        />
        <Button type="submit" disabled={sending || !text.trim()} className="gap-2">
          <Send className="h-4 w-4" />
          Send
        </Button>
      </form>
      {error && <p className="px-3 pb-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}
