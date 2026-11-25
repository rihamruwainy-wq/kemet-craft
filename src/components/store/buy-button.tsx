'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function BuyButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={disabled || loading} className="w-full">
      {loading ? 'Redirecting...' : 'Buy Now'}
    </Button>
  )
}