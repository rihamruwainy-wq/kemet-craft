import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { askAssistant } from '@/lib/assistant'

export async function POST(req: Request) {
  const { question } = await req.json().catch(() => ({ question: '' }))
  if (typeof question !== 'string' || !question.trim()) {
    return NextResponse.json({ error: 'Please type a question.' }, { status: 400 })
  }
  if (question.length > 500) {
    return NextResponse.json({ error: 'Please keep questions under 500 characters.' }, { status: 400 })
  }

  const supabase = await createClient()
  const reply = await askAssistant(supabase, question)
  return NextResponse.json(reply)
}
