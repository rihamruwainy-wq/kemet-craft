import { AssistantChat } from '@/components/assistant/assistant-chat'

export default function AiAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Assistant</h2>
        <p className="text-sm text-slate-500">
          Answers questions from your catalog by searching product titles, descriptions and eras.
        </p>
      </div>
      <AssistantChat
        suggestions={[
          'Which products are low on stock?',
          'Something for a living room wall',
          'A gift under $40',
          'Cheapest Islamic pieces',
          'Do you have anything in silver?',
        ]}
      />
    </div>
  )
}
