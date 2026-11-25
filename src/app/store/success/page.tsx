import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-2">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <CardTitle className="text-2xl">Payment Successful</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Thank you for your order! Your payment has been confirmed.
          </p>
         <div className="flex gap-3 justify-center">
  <Link
    href="/store"
    className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
  >
    Back to Store
  </Link>
  <Link
    href="/dashboard"
    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
  >
    Go to Dashboard
  </Link>
</div>
        </CardContent>
      </Card>
    </main>
  )
}