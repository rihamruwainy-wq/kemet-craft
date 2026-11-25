'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function BuyButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })

    if (res.status === 401) {
      router.push('/login')
      return
    }

    const data = await res.json().catch(() => ({}))
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-2">
      <Button onClick={handleCheckout} disabled={disabled || loading} className="w-full">
        {disabled ? 'Out of stock' : loading ? 'Redirecting...' : 'Buy Now'}
      </Button>
      {error && <p className="text-center text-xs text-red-600">{error}</p>}
    </div>
  )
}
