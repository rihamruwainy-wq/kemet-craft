'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import type { Product } from '@/types/product'

type Turn = { role: 'user' | 'assistant'; text: string; products?: Product[] }

export function AssistantChat({ suggestions }: { suggestions: string[] }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const ask = async (question: string) => {
    const q = question.trim()
    if (!q || loading) return
    setText('')
    setLoading(true)
    setTurns((t) => [...t, { role: 'user', text: q }])

    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q }),
    })
    const data = await res.json().catch(() => ({}))
    setTurns((t) => [
      ...t,
      {
        role: 'assistant',
        text: data.answer ?? data.error ?? 'Sorry, something went wrong. Please try again.',
        products: data.products ?? [],
      },
    ])
    setLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  return (
    <div className="flex h-[65vh] min-h-[420px] flex-col rounded-lg border bg-white">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {turns.length === 0 && (
          <div className="space-y-4 pt-6 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-amber-600" />
            <p className="text-sm text-slate-500">Ask about the catalog. Try one of these:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="cursor-pointer rounded-full border px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((t, i) => (
          <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] space-y-3 rounded-2xl px-4 py-2.5 text-sm ${
                t.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{t.text}</p>
              {!!t.products?.length && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {t.products.map((p) => (
                    <div key={p.id} className="rounded-lg border bg-white p-2.5 text-slate-900">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold leading-snug">{p.title}</p>
                        <span className="text-xs font-bold">${Number(p.price).toFixed(2)}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px]">
                          {p.era_tag || 'Heritage'}
                        </Badge>
                        <span className={`text-[10px] ${p.stock > 0 ? 'text-slate-500' : 'text-red-600'}`}>
                          {p.stock > 0 ? `${p.stock} in stock` : 'Sold out'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <p className="text-xs text-slate-500">Searching the catalog...</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(text)
        }}
        className="flex gap-2 border-t p-3"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. a gift under $40 for someone who loves Pharaonic history"
          maxLength={500}
        />
        <Button type="submit" disabled={loading || !text.trim()}>
          Ask
        </Button>
      </form>
    </div>
  )
}
