import Link from 'next/link'
import { AssistantChat } from '@/components/assistant/assistant-chat'

export default function StoreAssistantPage() {
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
          <h2 className="text-2xl font-bold tracking-tight">Find the perfect piece</h2>
          <p className="text-sm text-muted-foreground">
            Tell our assistant what you&apos;re looking for: a room, a budget, an era or a material.
          </p>
        </div>
        <AssistantChat
          suggestions={[
            'A gift under $40',
            'Something for a living room wall',
            'Coptic pieces',
            'Do you have anything in silver?',
            'A lamp or lantern',
          ]}
        />
      </main>
    </div>
  )
}
